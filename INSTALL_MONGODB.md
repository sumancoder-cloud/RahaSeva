# 🗄️ Install & Start MongoDB on Windows

## ❌ Current Issue:
MongoDB is not installed or not running on your system.

---

## 🚀 Solution Options:

### **Option 1: Install MongoDB Community Server (Recommended)**

#### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: 7.0 or latest
   - **Platform**: Windows
   - **Package**: MSI
3. Click "Download"

#### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. **Important**: Check "Install MongoDB as a Service"
4. **Important**: Check "Install MongoDB Compass" (GUI tool)
5. Click "Install"

#### Step 3: Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```

#### Step 4: Start MongoDB Service
```powershell
# Start MongoDB service
net start MongoDB

# Or use Services app (press Win+R, type services.msc)
# Find "MongoDB" and click "Start"
```

#### Step 5: Test Connection
```powershell
# Connect to MongoDB
mongosh
# or
mongo
```

---

### **Option 2: Use MongoDB Atlas (Cloud - Free Tier)**

If you don't want to install MongoDB locally:

#### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free

#### Step 2: Create a Free Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a cloud provider and region
4. Click "Create"

#### Step 3: Configure Access
1. **Create Database User**:
   - Click "Database Access"
   - Click "Add New Database User"
   - Username: `rahaseva`
   - Password: (create a strong password)
   - Save the password!

2. **Whitelist Your IP**:
   - Click "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

#### Step 4: Get Connection String
1. Click "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like:
   ```
   mongodb+srv://rahaseva:<password>@cluster0.xxxxx.mongodb.net/
   ```

#### Step 5: Update Your Backend `.env`
Open `server/.env` and update:
```env
MONGODB_URI=mongodb+srv://rahaseva:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rahaseva?retryWrites=true&w=majority
```

Replace:
- `YOUR_PASSWORD` with your actual password
- `cluster0.xxxxx` with your actual cluster URL

---

### **Option 3: Quick Local Setup (For Testing)**

If you want to test without installing MongoDB, you can use the mock data that's already in your project.

Your backend already has a fallback system that uses mock data when MongoDB is unavailable.

However, **Google Sign-In won't work** without a real database because it needs to save user data.

---

## ✅ After Installation:

### For Local MongoDB:
1. **Start MongoDB**:
   ```powershell
   net start MongoDB
   ```

2. **Verify it's running**:
   ```powershell
   mongosh
   # or
   mongo
   ```

3. **Restart your backend**:
   ```powershell
   cd server
   npm start
   ```

4. You should see:
   ```
   ✅ MongoDB connected successfully
   🚀 Server is running on port 5000
   ```

### For MongoDB Atlas (Cloud):
1. **Update** `server/.env` with Atlas connection string
2. **Restart backend**:
   ```powershell
   cd server
   npm start
   ```
3. You should see:
   ```
   ✅ MongoDB connected successfully
   🚀 Server is running on port 5000
   ```

---

## 🔍 Troubleshooting:

### MongoDB Service Won't Start:
```powershell
# Check if MongoDB service exists
Get-Service -Name MongoDB

# If it doesn't exist, create data directory and start manually:
mkdir C:\data\db
mongod --dbpath C:\data\db
```

### Can't Find MongoDB Command:
Add MongoDB to PATH:
1. Press `Win + R`, type `sysdm.cpl`
2. Go to "Advanced" → "Environment Variables"
3. Edit "Path" under System Variables
4. Add: `C:\Program Files\MongoDB\Server\7.0\bin`
5. Restart PowerShell

### Port 27017 Already in Use:
```powershell
# Find what's using port 27017
netstat -ano | findstr :27017

# Kill that process (replace PID with the number you see)
taskkill /PID <PID> /F
```

---

## 📝 Recommended: Use MongoDB Atlas

For development and testing, **MongoDB Atlas (cloud)** is easier because:
- ✅ No installation needed
- ✅ Always available
- ✅ Free tier sufficient for development
- ✅ No local configuration needed
- ✅ Works from anywhere

---

## 🎯 Next Steps:

1. **Choose** Option 1 (Local) or Option 2 (Cloud)
2. **Install/Configure** MongoDB
3. **Update** `.env` file (if using Atlas)
4. **Restart** backend server
5. **Test** Google Sign-In

---

**Need Help?** Let me know which option you choose and I can help you set it up!
