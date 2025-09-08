# 🚀 Simple GitHub Upload Guide

## How to Successfully Upload Your Project to GitHub

### Method 1: Use the PowerShell Script
1. **Open PowerShell** (not Command Prompt)
2. **Navigate to your project folder**:
   ```
   cd "C:\Users\Frederic De Waege\Desktop\echogarden\echo code\echo unzip\EchoGarden"
   ```
3. **Run the script**:
   ```
   powershell -ExecutionPolicy Bypass -File deploy.ps1
   ```

### Method 2: Use the Batch File
1. **Open Command Prompt**
2. **Navigate to your project folder**:
   ```
   cd "C:\Users\Frederic De Waege\Desktop\echogarden\echo code\echo unzip\EchoGarden"
   ```
3. **Run the batch file**:
   ```
   deploy.bat
   ```

### Method 3: Manual Commands
If both scripts fail, run these commands one by one:
```
git checkout feature
git add .
git commit -m "Update EchoGarden project"
git push origin feature
```

## What Happens Next
1. ✅ **Project uploaded to GitHub**
2. ✅ **GitHub Actions workflow triggers automatically**
3. ✅ **Website builds and deploys**
4. ✅ **Your site becomes live at**: https://fredecho.github.io/EchoGarden/

## If You Get Errors
- **Authentication error**: Use Personal Access Token instead of password
- **Push failed**: Try `git push -f origin feature` (force push)
- **Branch error**: Run `git checkout -b feature` first

## Final Step: Configure GitHub Pages
1. Go to: https://github.com/FredEcho/EchoGarden/settings/pages
2. Set Source to "GitHub Actions"
3. Click Save
4. Wait 5-10 minutes for deployment

That's it! Your website will be live! 🎉
