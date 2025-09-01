# EchoGarden 🌱

A community platform where users help each other and grow a virtual garden together.

## 🚀 Quick Start

```bash
npm install
npm run auto-setup
# Follow instructions to configure your database
npm run test-db
npm run dev
```

## 📝 Setup Steps

### 1. Configure Database
1. Go to https://supabase.com/dashboard
2. Create a new project or select existing one
3. Go to Settings → Database
4. Copy the connection string and password

### 2. Update .env File
Edit the `.env` file created by `npm run auto-setup`:
- Replace `[YOUR-PASSWORD]` with your database password
- Replace `[YOUR-PROJECT-REF]` with your project reference
- Get the anon key from Settings → API

### 3. Start the App
```bash
npm run dev
```

### 4. Open Browser
Go to: http://localhost:5000

## 🎉 Done!

Your app is now running! You can:
- Register a new account
- Login and create help requests
- Respond to others
- Watch your virtual garden grow

## 🔧 If Something Goes Wrong

**Connection Error?**
- Check your Supabase connection string
- Make sure your project is active

**App Won't Start?**
- Run `npm install` again
- Check if port 5000 is free
- Try `PORT=5001` in your .env file

## 📋 Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run test-db` - Test database connection
- `npm run auto-setup` - Create .env file
- `npm run security-audit` - Run security audit

## 🔒 Security Features

- ✅ Rate limiting (100 requests per 15 minutes per IP)
- ✅ Security headers (XSS protection, content type options)
- ✅ Request size limits (10MB max)
- ✅ Production host binding
- ✅ Development-only logging
- ✅ HTTPS cookie settings in production
- ✅ Health check endpoint (`/api/health`)
