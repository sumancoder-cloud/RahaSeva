# 🔧 Fix Google OAuth Origin Error (403)

## 🚨 The Error You're Seeing:
```
Failed to load resource: the server responded with a status of 403
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

## 🎯 What This Means:
Your Google OAuth Client ID is **NOT configured** to accept login requests from `http://localhost:3003`.

---

## ✅ COMPLETE FIX - Follow These Steps EXACTLY:

### STEP 1: Open Google Cloud Console
1. Open your browser and go to: **https://console.cloud.google.com/**
2. **Sign in** with your Google account

### STEP 2: Select Your Project
1. At the **top of the page**, click the project dropdown
2. Select your **RahaSeva** project (or create one if needed)

### STEP 3: Go to Credentials
1. In the **left sidebar**, click **"APIs & Services"**
2. Click **"Credentials"**
3. You'll see your OAuth 2.0 Client IDs listed

### STEP 4: Edit Your OAuth Client ID
1. Find this Client ID: `698933010287-kvpnoa3phojtt5ngbf34qetcuq97vnl9.apps.googleusercontent.com`
2. Click the **pencil/edit icon (✏️)** next to it

### STEP 5: Add Authorized JavaScript Origins
Scroll to **"Authorized JavaScript origins"** section

Click **"+ ADD URI"** and add these URLs **ONE AT A TIME**:

```
http://localhost:3003
```

```
http://localhost:5173
```

```
http://127.0.0.1:3003
```

```
http://127.0.0.1:5173
```

**⚠️ CRITICAL:**
- Type each URL **exactly** as shown
- Use `http://` NOT `https://`
- NO trailing slash at the end
- NO spaces

### STEP 6: Add Authorized Redirect URIs (Optional)
Scroll to **"Authorized redirect URIs"**

Add these (optional but recommended):

```
http://localhost:3003/
```

```
http://localhost:5173/
```

### STEP 7: SAVE Your Changes ⭐
1. Scroll to the **bottom** of the page
2. Click the blue **"SAVE"** button
3. Wait for confirmation message

### STEP 8: ⏰ WAIT 5 MINUTES
**IMPORTANT:** Google OAuth changes take **2-10 minutes** to propagate globally. Be patient!

### STEP 8: ⏰ WAIT 5 MINUTES
**IMPORTANT:** Google OAuth changes take **2-10 minutes** to propagate globally. Be patient!

### STEP 9: Clear Browser Cache
1. **Close ALL tabs** with your app
2. **Open browser DevTools**: Press `F12`
3. **Right-click the refresh button** → Select **"Empty Cache and Hard Reload"**
4. OR use **Incognito/Private mode**

### STEP 10: Restart Development Server
Open PowerShell and run:

```powershell
cd "c:\Users\SumanYadav Personal\Documents\RahaSeva\HelpHive\RahSeva"
npm run dev
```

### STEP 11: Test Your App! 🎉
1. Open browser to: `http://localhost:3003`
2. Go to **Login** or **Sign Up** page
3. Click the **"Continue with Google"** button
4. ✅ **Google login popup should appear!**
5. Select your account
6. You should see: **"Google Sign-In Successful! 🎉"**

---

## 🔍 Verify Your Settings

### Your Current OAuth Client ID:
```
698933010287-kvpnoa3phojtt5ngbf34qetcuq97vnl9.apps.googleusercontent.com
```

### Required Authorized JavaScript Origins:
- ✅ `http://localhost:3003`
- ✅ `http://localhost:5173`
- ✅ `http://127.0.0.1:3003`
- ✅ `http://127.0.0.1:5173`

### Check Your .env File:
Open: `c:\Users\SumanYadav Personal\Documents\RahaSeva\HelpHive\RahSeva\.env`

Should have:
```env
VITE_GOOGLE_CLIENT_ID=698933010287-kvpnoa3phojtt5ngbf34qetcuq97vnl9.apps.googleusercontent.com
```

---

## 🚨 Still Not Working? Try These:

### ✅ Checklist:
- [ ] Added ALL 4 origins to Google Cloud Console
- [ ] Clicked SAVE in Google Cloud Console
- [ ] Waited at least 5 minutes
- [ ] Cleared browser cache completely
- [ ] Restarted dev server
- [ ] Using exact URL: `http://localhost:3003` (not 127.0.0.1)
- [ ] MongoDB is running
- [ ] Backend server is running on port 5000

### 🔄 Try Creating a NEW OAuth Client:

If nothing works, create a fresh OAuth Client ID:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. Choose **"Web application"**
5. Name: `RahaSeva Local Dev`
6. Add Authorized JavaScript origins:
   - `http://localhost:3003`
   - `http://localhost:5173`
   - `http://127.0.0.1:3003`
7. Click **CREATE**
8. **Copy the new Client ID**
9. Update `.env` file with new ID
10. Restart server: `npm run dev`

---

## 📸 What Success Looks Like:

### Before Fix (403 Error):
```
❌ Failed to load resource: 403
❌ [GSI_LOGGER]: The given origin is not allowed
❌ Google button may not appear or doesn't work
```

### After Fix (Working):
```
✅ No errors in console
✅ Google Sign-In button loads properly
✅ Clicking opens Google account selector
✅ After login: "Google Sign-In Successful! 🎉"
✅ Redirected to welcome page
✅ User data saved in database
```

---

## 🐛 Common Issues & Solutions:

### Issue 1: "Still getting 403 after adding origins"
**Solution:** Wait 10 minutes. Google's servers need time to sync.

### Issue 2: "Button doesn't appear at all"
**Solution:** 
- Check browser console for errors
- Make sure `.env` file has the Client ID
- Restart dev server after changing `.env`

### Issue 3: "Network Error"
**Solution:**
- Make sure backend is running: `cd server && npm run dev`
- Check backend is on port 5000
- Check MongoDB is running

### Issue 4: "User already exists error"
**Solution:** That's OK! Just use Login instead of Sign Up.

---

## 💡 Pro Tips:

1. **Always use Incognito mode** when testing OAuth to avoid cache issues
2. **Keep Google Cloud Console open** in another tab for quick access
3. **Check both Browser Console (F12)** and **Backend Terminal** for errors
4. **Be patient** - OAuth changes aren't instant!
5. **Bookmark this page**: https://console.cloud.google.com/apis/credentials

---

---

## 🎯 Quick Test Commands:

### Start Everything:
```powershell
# Terminal 1 - Start Frontend
cd "c:\Users\SumanYadav Personal\Documents\RahaSeva\HelpHive\RahSeva"
npm run dev

# Terminal 2 - Start Backend (if needed)
cd "c:\Users\SumanYadav Personal\Documents\RahaSeva\HelpHive\RahSeva\server"
npm run dev

# Terminal 3 - Start MongoDB (if needed)
mongod
```

### Check if it's working:
1. Open: `http://localhost:3003/login`
2. Open DevTools (F12)
3. Click Google Sign-In button
4. Check Console tab - should see NO 403 errors
5. Google popup should appear
6. After login, check for success toast! 🎉

---

## 📋 Complete Pre-Flight Checklist:

Before testing, make sure:

- [ ] ✅ Google Cloud Console: Added all 4 origins
- [ ] ✅ Google Cloud Console: Clicked SAVE
- [ ] ✅ Waited 5-10 minutes after saving
- [ ] ✅ `.env` file has correct VITE_GOOGLE_CLIENT_ID
- [ ] ✅ MongoDB is running
- [ ] ✅ Backend server is running (port 5000)
- [ ] ✅ Frontend server is running (port 3003)
- [ ] ✅ Browser cache is cleared
- [ ] ✅ Using http://localhost:3003 (not 127.0.0.1)

---

## 🆘 Need More Help?

### Check These Logs:

**Browser Console (F12):**
- Look for any red errors
- Should see: "Google Registered Data: {email, name, ...}"

**Backend Terminal:**
- Should see: "Google auth request received"
- Should see: "Creating new user for: your@email.com"
- Should see: "Google auth successful"

**If you see errors:**
1. Copy the complete error message
2. Check if MongoDB is running
3. Check if backend is on port 5000
4. Verify Client ID matches in both Google Console and `.env`

---

## ✅ Success Confirmation:

You'll know everything is working when:

1. ✅ No 403 error in browser console
2. ✅ Google button loads and is clickable
3. ✅ Google account selector popup appears
4. ✅ After selecting account, see success toast
5. ✅ Automatically redirected to welcome page
6. ✅ User data is saved in MongoDB
7. ✅ Can log in again with same Google account

---

## 🎉 Final Notes:

- **This fix is PERMANENT** - Once you add the origins, they stay added
- **For production**, you'll need to add your production URL (e.g., https://yourdomain.com)
- **Keep your Client ID secret** - Don't commit it to public repos
- **The wait time is normal** - Google's OAuth system needs time to sync

---

**🚀 Once you follow these steps, your Google Sign-In WILL work! 🚀**

**⏰ Remember: PATIENCE! Wait 5-10 minutes after saving in Google Cloud Console! ⏰**

---

## 📝 Summary of What You Need to Do RIGHT NOW:

1. 🌐 Go to: https://console.cloud.google.com/apis/credentials
2. ✏️ Edit your OAuth 2.0 Client ID
3. ➕ Add these 4 origins:
   - `http://localhost:3003`
   - `http://localhost:5173`
   - `http://127.0.0.1:3003`
   - `http://127.0.0.1:5173`
4. 💾 Click SAVE
5. ⏰ Wait 5 minutes
6. 🔄 Clear browser cache
7. 🚀 Restart dev server
8. 🎉 Test and enjoy!

**That's it! Follow these steps and you're done! 🎊**
