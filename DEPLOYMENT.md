# EchoGarden Production Deployment Guide

## 🚀 Production Deployment Checklist

### 1. Environment Configuration

#### Required Environment Variables
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Security (CRITICAL - Change these!)
SESSION_SECRET="your-64-character-random-string"
NODE_ENV="production"

# Server Configuration
PORT=5000

# Optional: Supabase Configuration
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

#### Generate Secure Session Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Security Hardening

#### ✅ Completed Security Measures
- [x] Rate limiting (100 requests per 15 minutes per IP)
- [x] Security headers (XSS protection, content type options, frame options)
- [x] Request size limits (10MB max)
- [x] Production host binding (0.0.0.0)
- [x] Removed hardcoded credentials
- [x] Development-only console logging
- [x] HTTPS cookie settings in production

#### 🔒 Additional Security Recommendations
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up firewall rules
- [ ] Enable database connection pooling
- [ ] Implement request validation middleware
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### 3. Database Setup

#### Supabase Production Checklist
- [ ] Enable Row Level Security (RLS)
- [ ] Configure database backups
- [ ] Set up connection pooling
- [ ] Monitor database performance
- [ ] Set up alerts for unusual activity

### 4. Build and Deploy

#### Build the Application
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

#### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### 5. Monitoring and Maintenance

#### Health Check Endpoint
The application includes a health check at `/api/health` (to be implemented)

#### Logging
- Application logs are available in production
- Consider implementing structured logging
- Set up log aggregation (ELK stack, etc.)

#### Performance Monitoring
- Monitor response times
- Track error rates
- Monitor database performance
- Set up uptime monitoring

### 6. Backup Strategy

#### Database Backups
- Supabase provides automatic backups
- Consider additional backup solutions
- Test restore procedures regularly

#### Application Backups
- Version control (Git)
- Environment configuration backups
- User upload backups (if applicable)

### 7. Scaling Considerations

#### Horizontal Scaling
- Use load balancer for multiple instances
- Implement session store (Redis recommended)
- Database connection pooling

#### Vertical Scaling
- Monitor resource usage
- Optimize database queries
- Implement caching strategies

### 8. Post-Deployment Checklist

- [ ] Verify all features work in production
- [ ] Test user registration and authentication
- [ ] Verify database connections
- [ ] Check security headers
- [ ] Test rate limiting
- [ ] Monitor error logs
- [ ] Set up monitoring alerts
- [ ] Document deployment procedures

### 9. Emergency Procedures

#### Rollback Plan
1. Keep previous version ready
2. Database migration rollback procedures
3. Environment variable rollback
4. DNS/load balancer rollback

#### Incident Response
1. Monitor error rates and alerts
2. Identify root cause
3. Implement hotfix if necessary
4. Communicate with users
5. Document incident and lessons learned

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify DATABASE_URL format
- Check Supabase project status
- Verify network connectivity

#### Session Issues
- Ensure SESSION_SECRET is set and unique
- Check cookie settings
- Verify session store configuration

#### Performance Issues
- Monitor database query performance
- Check for memory leaks
- Review rate limiting settings

## 📞 Support

For deployment issues or questions:
1. Check the logs for error messages
2. Verify environment configuration
3. Test in development environment first
4. Review this deployment guide

---

**Remember**: Security is an ongoing process. Regularly review and update security measures, monitor for vulnerabilities, and keep dependencies updated.
