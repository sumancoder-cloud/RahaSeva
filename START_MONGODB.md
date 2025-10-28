# 🚀 Quick Start MongoDB (Windows)

## ✅ Good News: MongoDB is already installed!

It's just not running. Here's how to start it:

---

## 🔧 Start MongoDB Service (Choose ONE method):

### **Method 1: Using PowerShell (As Administrator)**

1. **Right-click** on PowerShell
2. Select **"Run as Administrator"**
3. Run:
```powershell
Start-Service MongoDB
```

4. Verify it's running:
```powershell
Get-Service MongoDB
```
You should see: `Status: Running`

---

### **Method 2: Using Services App (Easiest)**

1. Press `Win + R`
2. Type: `services.msc`
3. Press Enter
4. Find **"MongoDB Server (MongoDB)"**
5. **Right-click** → **"Start"**
6. **Right-click** → **"Properties"**
7. Set **"Startup type"** to **"Automatic"** (so it starts automatically)
8. Click **"OK"**

---

### **Method 3: Manual Start**

If the service won't start, run MongoDB manually:

1. Open PowerShell (regular, not admin)
2. Run:
```powershell
mongod --dbpath "C:\data\db"
```

If you get an error about the folder not existing:
```powershell
# Create the data directory first
New-Item -Path "C:\data\db" -ItemType Directory -Force
# Then start MongoDB
mongod --dbpath "C:\data\db"
```

**Keep this window open** while using your app!

---

## ✅ Verify MongoDB is Running:

Open a NEW PowerShell window and run:
```powershell
mongosh
# or
mongo
```

You should see:
```
Connecting to:    mongodb://127.0.0.1:27017/
Using MongoDB:    7.x.x
```

Type `exit` to close the MongoDB shell.

---

## 🔄 Restart Your Backend:

After starting MongoDB:

1. Go to your backend terminal (or open new one)
2. Run:
```powershell
cd "C:\Users\SumanYadav Personal\Documents\RahaSeva\HelpHive\RahSeva\server"
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server is running on port 5000
```

---

## 🎯 Quick Fix Right Now:

**EASIEST METHOD:**

1. Press `Win + R`
2. Type: `services.msc` and press Enter
3. Find "MongoDB Server"
4. Right-click → Start
5. Done! ✅

Then restart your backend server.

---

## 🐛 Still Having Issues?

If MongoDB service fails to start, it might be a port conflict or configuration issue.

**Quick workaround** - Run MongoDB manually in a terminal:
```powershell
mongod --dbpath "C:\data\db"
```

Keep that terminal open while developing.

---

**Your MongoDB is installed and ready - just needs to be started!** 🚀
