# Real-time Geometry Nodes Mesh Editor (React Three Fiber + Headless Blender)

This workspace contains a **production-ready** browser mesh editor driven by **Blender Geometry Nodes**, built with **React** and **React Three Fiber**.

You provide:
- A `.blend` file containing an object with a Geometry Nodes modifier (example: `GN_test.blend`).

This repo provides:
- A **React + React Three Fiber** frontend that renders the mesh and generates UI controls for all exposed GN parameters.
- A **WebSocket** server that receives parameter edits, calls headless Blender to rebuild the mesh, and streams back binary vertex/index buffers.
- A **headless Blender script** that loads the `.blend`, applies parameter values, evaluates the depsgraph, and exports geometry as compact binary.

## Architecture

```
Browser (React + React Three Fiber)
  ?? connects via WebSocket
  ?? requests parameter schema
  ?? auto-generates UI controls for each parameter
  ?? sends edits (throttled at 40ms)
  ?? receives binary mesh buffers ? updates BufferGeometry

Server (Node.js + Express + WebSocket)
  ?? serves React build / dev server proxy
  ?? WebSocket API
  ?? spawns Blender in background
  ?? debounces edits and cancels stale jobs
  ?? returns mesh as binary (Float32/Uint32)

Blender (headless)
  ?? loads .blend file
  ?? sets GN modifier inputs
  ?? evaluates depsgraph
  ?? extracts evaluated mesh
  ?? writes binary reply to stdout
```

### Why this design
- **React Three Fiber**: Declarative 3D rendering with React components
- **Performance**: Only uploads new `Float32Array`/`Uint32Array` into `BufferGeometry`
- **Isolation**: The server treats Blender as a worker process
- **Scalability**: Binary data format handles ~100k vertices efficiently
- **Developer Experience**: Hot module reload, component-based UI

## Repository layout
- `server/` — Node.js backend (HTTP + WebSocket)
- `blender/` — Headless Blender scripts
- `web/` — React + Vite frontend

## Prerequisites
- **Blender 3.6+** installed and available as `blender` on PATH
- **Node.js 18+**

## Quick Start

### 1. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd web
npm install
```

### 2. Start the server (Terminal 1)
```bash
cd server
npm run dev
```
Server runs on `http://localhost:8080`

### 3. Start the React dev server (Terminal 2)
```bash
cd web
npm run dev
```
Frontend runs on `http://localhost:3000`

### 4. Open your browser
Navigate to `http://localhost:3000`

## Production Build

Build the React app:
```bash
cd web
npm run build
```

Then configure the server to serve the `web/dist` folder in production.

## Environment Variables

Configure the server with:
- `BLEND_FILE` — Path to your .blend file (default: `../GN_test.blend`)
- `BLENDER_BIN` — Blender executable path (default: `blender`)
- `BLENDER_SCRIPT` — Python script path (default: `../blender/gn_worker.py`)
- `TARGET_OBJECT` — Specific object name (optional, auto-detected if empty)
- `PORT` — Server port (default: `8080`)

Example:
```bash
BLEND_FILE=/path/to/my.blend PORT=9000 npm run dev
```

## WebSocket Protocol

**Client ? Server (JSON):**
- `{"type":"schema"}` — request GN parameter schema
- `{"type":"set","values":{"Input_1":0.5,"Density":20}}` — set parameters

**Server ? Client:**
- JSON `schema` message describing available parameters and UI hints
- Binary `mesh` message: an ArrayBuffer with a small header + typed array payloads

**Binary mesh packet layout (little-endian):**
- `u32 magic` = `0x4D455348` ('MESH')
- `u32 version` = `1`
- `u32 vertexCount`
- `u32 indexCount`
- `f32 positions[vertexCount*3]`
- `f32 normals[vertexCount*3]`
- `u32 indices[indexCount]`

## Notes on GN Parameters
- This scaffold introspects inputs from the Geometry Nodes **modifier**
- You control which parameters are exposed in Blender by creating Group Inputs / modifier properties
- Supported types: `float`, `int`, `bool`, `string`, `float_array` (vectors/colors)

## Performance Notes
- Client throttles slider events (40ms default) and only applies the latest update
- Server debounces updates and cancels stale Blender jobs
- Binary buffers avoid JSON overhead
- React Three Fiber provides efficient rendering with automatic re-use of geometries

## Technology Stack
- **Frontend**: React 18, React Three Fiber, @react-three/drei, Vite
- **Backend**: Node.js, Express, ws (WebSocket)
- **3D**: Three.js 0.160
- **Blender**: Python API (bpy) for headless geometry evaluation

## Troubleshooting

**WebSocket connection fails:**
- Ensure backend server is running on port 8080
- Check Vite proxy configuration in `web/vite.config.js`

**Blender not found:**
- Add Blender to PATH or set `BLENDER_BIN` environment variable

**No parameters showing:**
- Verify your .blend file has a Geometry Nodes modifier with exposed inputs
- Check browser console for errors
- Verify Blender script can parse the modifier (check server logs)

