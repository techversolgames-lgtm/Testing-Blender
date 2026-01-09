# ?? BLENDER CONFIGURATION FIX

## Current Issue

You're seeing: **"Error: spawn blender ENOENT"**

This means the backend server cannot find the Blender executable.

---

## ? QUICK FIX (3 Methods)

### **Method 1: Auto-Detect Blender (Easiest)**

Run this script to automatically find Blender:

```cmd
find-blender.bat
```

This will:
1. Search common Blender installation locations
2. Test if Blender works
3. Set the environment variable for you
4. Show you next steps

---

### **Method 2: Manual Configuration (Permanent)**

**Step 1: Find Blender**
1. Press `Win + S` (Windows Search)
2. Type `blender.exe`
3. Right-click ? "Open file location"
4. Copy the full path (e.g., `C:\Program Files\Blender Foundation\Blender 4.2\blender.exe`)

**Step 2: Edit server.js**
1. Open `server/server.js`
2. Find line 13-14 (it says `CONFIGURE YOUR BLENDER PATH HERE`)
3. Replace with your path:

```javascript
const BLENDER_BIN = process.env.BLENDER_BIN ?? 
  'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe';  // ? YOUR PATH HERE
```

**Important:** Use `\\` (double backslashes) in the path!

**Step 3: Restart Backend**
```cmd
cd server
npm run dev
```

---

### **Method 3: Environment Variable (Temporary)**

**Step 1: Set the variable**
```cmd
set BLENDER_BIN="C:\Program Files\Blender Foundation\Blender 4.2\blender.exe"
```

**Step 2: Start server in the same terminal**
```cmd
cd server
npm run dev
```

**Note:** This only works in the current terminal session. You'll need to set it again next time.

---

## ?? After Fixing Blender Path

Once configured, your backend terminal should show:

```
========================================
  Geometry Nodes WebSocket Server
========================================
Server running: http://localhost:8080
WebSocket URL: ws://localhost:8080

Blender Configuration:
  BLENDER_BIN: C:\Program Files\Blender Foundation\Blender 4.2\blender.exe
  BLEND_FILE: D:\Blender Teseting three js\GN_test.blend
  ...
```

**No errors about "spawn blender ENOENT"!**

---

## ?? Verify It's Working

### Test 1: Check Blender Version
```cmd
"C:\Program Files\Blender Foundation\Blender 4.2\blender.exe" --version
```

Should output:
```
Blender 4.2.0
...
```

### Test 2: Check Backend Logs
Start the backend server and look for:
```
[WebSocket] Client connected...
[Blender] Spawning: C:\Program Files\...
[Blender] Success, returned 1234 bytes
```

**No errors!**

### Test 3: Check Frontend
Open http://localhost:3000

**Left Panel:**
- ?? Green connection indicator
- "Connected. Loading schema..."
- Parameter controls appear

---

## ? Common Issues

### "The system cannot find the path specified"
**Fix:** Your path is wrong. Double-check:
1. File actually exists at that location
2. You're using `\\` instead of `\`
3. Path is in quotes if it has spaces

### "Blender exited with code 1"
**Fix:** Blender is crashing. Check:
1. GN_test.blend file exists
2. Blend file has a Geometry Nodes modifier
3. Blender can open the file normally

### Still showing "spawn blender ENOENT"
**Fix:** 
1. Make sure you edited the right file (`server/server.js`)
2. Restart the backend server (Ctrl+C, then `npm run dev`)
3. Check you saved the file after editing

---

## ?? Additional Resources

**Need more help?**
- See `GETTING_STARTED.md` ? Troubleshooting
- Run `check-env.bat` to verify environment
- Check backend terminal for detailed error messages

---

## ? Success Checklist

After fixing:
- [ ] Backend starts without "spawn blender ENOENT" error
- [ ] Frontend connects (green indicator)
- [ ] WebSocket messages in browser console (F12 ? Network ? WS)
- [ ] Parameters load in left panel
- [ ] 3D mesh appears in viewport

**All checked?** You're ready to go! ??

---

*This fix is permanent if you edit server.js, or temporary if you use environment variables.*
