# Fix Google OAuth 403 Error - "The given origin is not allowed"

## Problem
You're getting a **403 error** with the message: `[GSI_LOGGER]: The given origin is not allowed for the given client ID.`

This means your Google OAuth Client ID is not configured to allow requests from `http://localhost:3003`.

## Solution

### Step 1: Go to Google Cloud Console
1. Open your browser and go to: https://console.cloud.google.com/
2. Log in with the Google account you used to create the OAuth client

### Step 2: Select Your Project
1. Click on the project dropdown at the top of the page
2. Select your **RahaSeva** project (or whatever you named it)

### Step 3: Navigate to Credentials
1. In the left sidebar, click on **"APIs & Services"**
2. Click on **"Credentials"**

### Step 4: Edit OAuth 2.0 Client ID
1. Find your OAuth 2.0 Client ID in the list (it should end with `.apps.googleusercontent.com`)
2. Click on the **pencil/edit icon** next to it

### Step 5: Add Authorized JavaScript Origins
In the **"Authorized JavaScript origins"** section, add these URLs:
```
http://localhost:3003
http://localhost:5173
http://localhost:3000
http://127.0.0.1:3003
http://127.0.0.1:5173
```

### Step 6: Add Authorized Redirect URIs
In the **"Authorized redirect URIs"** section, add these URLs:
```
http://localhost:3003
http://localhost:5173
http://localhost:3000
http://127.0.0.1:3003
http://127.0.0.1:5173
```

### Step 7: Save Changes
1. Click the **"SAVE"** button at the bottom
2. Wait a few minutes for changes to propagate (usually 1-5 minutes)

### Step 8: Clear Browser Cache and Restart
1. Close all browser tabs with your app
2. Clear your browser cache (or open in Incognito/Private mode)
3. Restart your development server:
   ```powershell
   cd "c:\Users\SumanYadav Personal\Documents\RahaSeva\HelpHive\RahSeva"
   npm run dev
   ```

### Step 9: Test Again
1. Open your app at `http://localhost:3003`
2. Try the Google Sign-In button again
3. You should now see the Google login popup!

## Important Notes

- **Changes take time**: Google OAuth changes can take 1-5 minutes to take effect
- **Use the exact URL**: Make sure you're accessing your app at the exact URL you added (e.g., `http://localhost:3003`, not `http://127.0.0.1:3003`)
- **Check your .env file**: Make sure `VITE_GOOGLE_CLIENT_ID` in your `.env` file matches the Client ID from Google Console

## Verify Your Setup

Your current Google Client ID is:
```
698933010287-kvpnoa3phojtt5ngbf34qetcuq97vnl9.apps.googleusercontent.com
```

Make sure this matches the one in Google Cloud Console!

## Still Having Issues?

If you still get the 403 error after following all steps:

1. **Double-check the URLs** - Make sure there are no typos
2. **Wait longer** - Sometimes it takes up to 10 minutes
3. **Create a new OAuth Client ID** - If all else fails, create a brand new one
4. **Check browser console** - Look for any other error messages

## Screenshots Would Be Here
(If needed, I can help you verify your Google Console settings)

---

✅ **After fixing this, your Google Sign-In button will work perfectly!**
