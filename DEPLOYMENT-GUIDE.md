# 🚀 EchoGarden Deployment Guide

This guide shows you how to easily deploy changes from Cursor to your GitHub repository at [https://github.com/FredEcho/EchoGarden.git](https://github.com/FredEcho/EchoGarden.git).

## 📋 Quick Deployment Methods

### Method 1: PowerShell Script (Recommended for Windows)
```powershell
# Run from your project root
.\deploy.ps1

# Or with custom commit message
.\deploy.ps1 "Fixed help request creation bug"
```

### Method 2: Batch File
```cmd
# Run from your project root
deploy.bat

# Or with custom commit message
deploy.bat "Added new garden features"
```

### Method 3: Manual Git Commands
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## 🔄 Automatic Deployment with GitHub Actions

The `.github/workflows/deploy.yml` file automatically:
- ✅ Builds your project on every push
- ✅ Runs tests (if available)
- ✅ Deploys to GitHub Pages (optional)
- ✅ Provides deployment status updates

## 📱 Cursor Integration

### Option 1: Terminal Integration
1. Open Cursor's integrated terminal
2. Navigate to your project root
3. Run: `.\deploy.ps1`

### Option 2: Task Runner
1. In Cursor, press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "deploy" task

### Option 3: Keyboard Shortcut
Create a custom keyboard shortcut in Cursor to run the deployment script.

## 🎯 Deployment Workflow

1. **Make Changes** in Cursor
2. **Test Locally** with `npm run dev`
3. **Deploy** using one of the methods above
4. **Verify** on GitHub

## 🔧 Customization

### Custom Commit Messages
```powershell
.\deploy.ps1 "Your custom commit message here"
```

### Environment-Specific Deployments
The scripts automatically detect your project structure and use the correct Git remote.

## 📊 Deployment Status

Check deployment status:
- **GitHub Actions**: [https://github.com/FredEcho/EchoGarden/actions](https://github.com/FredEcho/EchoGarden/actions)
- **Repository**: [https://github.com/FredEcho/EchoGarden](https://github.com/FredEcho/EchoGarden)

## 🚨 Troubleshooting

### Common Issues:
- **Permission Denied**: Run PowerShell as Administrator
- **Git Not Found**: Ensure Git is installed and in PATH
- **Remote Issues**: Check `git remote -v`

### Reset Deployment:
```bash
git reset --hard HEAD~1
git push -f origin main
```

## 🌟 Pro Tips

1. **Always test locally** before deploying
2. **Use descriptive commit messages**
3. **Check GitHub Actions** for build status
4. **Keep your local branch updated** with `git pull origin main`

---

**Happy Deploying! 🌱✨**

Your EchoGarden project will be automatically updated on GitHub every time you deploy from Cursor.
