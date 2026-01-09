# ?? QUICK START CHECKLIST

Use this checklist to get up and running in **under 5 minutes**.

---

## ? Pre-Flight Checks (Run Once)

### 1. Verify Prerequisites
```bash
# Check Node.js (should be 18+)
node --version

# Check npm
npm --version

# Check Blender (should be 3.6+)
blender --version
```

**OR run the automated check:**
```bash
check-env.bat
```

---

### 2. Install Dependencies

**Option A - Automatic (Recommended):**
```bash
# Windows:
start.bat

# This installs everything and starts servers automatically
```

**Option B - Manual:**
```bash
# Backend
cd server
npm install

# Frontend
cd web
npm install
```

---

## ?? Start the Application

### Every Time You Want to Run the App:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
? Look for: `Server running: http://localhost:8080`
? Look for: `WebSocket URL: ws://localhost:8080`

**Terminal 2 - Frontend Dev Server:**
```bash
cd web
npm run dev
```
? Look for: `Local: http://localhost:3000/`

**Browser:**
```
Open: http://localhost:3000
```

---

## ?? Expected Behavior

### ? When Everything Works:

1. **Browser loads** (http://localhost:3000)
2. **Left panel shows:**
   - "Geometry Nodes Editor" title
   - Green connection indicator
   - "Connected. Loading schema..."
   - Auto-generated parameter controls

3. **Right panel shows:**
   - 3D viewport with your mesh
   - OrbitControls (click and drag to rotate)

4. **Moving sliders:**
   - Mesh updates in real-time
   - Status shows vertex/index count

---

## ? Common First-Run Issues

### Issue 1: "WebSocket connection failed"
**Fix:** Backend server not running
```bash
# Start it:
cd server
npm run dev
```

### Issue 2: "Error: spawn blender ENOENT"
**Fix:** Blender not in PATH
```bash
# Windows:
set BLENDER_BIN="C:\Program Files\Blender Foundation\Blender 3.6\blender.exe"

# Then restart server:
cd server
npm run dev
```

### Issue 3: "Loading parameters..." forever
**Fix:** Blend file issues
- Check `GN_test.blend` exists
- Verify it has a Geometry Nodes modifier
- Check server terminal for Blender errors

### Issue 4: Accessing http://localhost:8080 instead of :3000
**Fix:** Wrong port!
- ? Port 8080 = WebSocket server (backend only)
- ? Port 3000 = Vite dev server (use this!)

---

## ?? Using Your Own Blender File

### Quick Setup:
```bash
# Windows:
set BLEND_FILE=path\to\your\file.blend
cd server
npm run dev

# Linux/Mac:
BLEND_FILE=/path/to/your/file.blend npm run dev
```

### Requirements for Your Blend File:
1. ? Has a mesh object
2. ? Has a Geometry Nodes modifier on that mesh
3. ? Geometry Nodes tree has exposed Group Inputs

**How to expose inputs in Blender:**
- Right-click on any node input ? "Add to Group Input"
- OR drag from Group Input node

---

## ?? Development Workflow

### 1. Start Servers (once per session)
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd web && npm run dev
```

### 2. Edit Blender File
- Open `GN_test.blend` in Blender
- Modify Geometry Nodes
- Save file
- Refresh browser ? New controls appear!

### 3. Edit Frontend Code
- Modify files in `web/src/`
- Vite hot-reloads automatically
- See changes instantly in browser

### 4. Edit Backend Code
- Modify `server/server.js`
- Restart backend server (Ctrl+C, then `npm run dev`)

---

## ?? File Checklist

After setup, verify these files exist:

```
? server/
   ? server.js
   ? package.json
   ? node_modules/

? web/
   ? src/
      ? main.jsx
      ? App.jsx
      ? components/
         ? Scene3D.jsx
         ? DynamicMesh.jsx
         ? ControlPanel.jsx
         ? ParameterControl.jsx
      ? hooks/
         ? useWebSocket.js
   ? index.html
   ? vite.config.js
   ? package.json
   ? node_modules/

? blender/
   ? gn_worker.py

? GN_test.blend (or your custom file)
```

---

## ?? Success Indicators

### Backend Terminal Should Show:
```
========================================
  Geometry Nodes WebSocket Server
========================================
Server running: http://localhost:8080
WebSocket URL: ws://localhost:8080

MODE: Development (WebSocket only)
Run Vite dev server separately: cd web && npm run dev
========================================
Blender Configuration:
  BLENDER_BIN: blender
  BLEND_FILE: D:\Blender Teseting three js\GN_test.blend
  ...
```

### Frontend Terminal Should Show:
```
VITE v5.x.x  ready in xxx ms

?  Local:   http://localhost:3000/
?  Network: use --host to expose
?  press h to show help
```

### Browser Should Show:
- No errors in console (F12)
- Green connection indicator
- 3D mesh visible
- Parameter controls in left panel

---

## ?? Debug Mode

### Enable Verbose Logging

**Backend:**
Already enabled! Check terminal for:
```
[WebSocket] Client connected...
[Blender] Spawning: blender with mode=schema
[Blender] Success, returned 1234 bytes
```

**Frontend:**
Open browser console (F12) and check:
- Network tab ? WS (WebSocket messages)
- Console tab ? Any errors

---

## ?? You're All Set!

If you can:
- ? See the 3D mesh
- ? Move sliders and see updates
- ? See green connection indicator

**Then everything is working perfectly!** ??

---

## ?? Next Steps

1. **Read** `GETTING_STARTED.md` for detailed documentation
2. **Experiment** with your own Geometry Nodes
3. **Extend** the app with custom features

---

## ?? Still Stuck?

1. Run `check-env.bat` to verify environment
2. Check `GETTING_STARTED.md` troubleshooting section
3. Review both terminal outputs for errors
4. Check browser console (F12) for frontend errors

---

*Keep this checklist handy for quick reference!*
