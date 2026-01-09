import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT ?? 8080);

// CONFIGURE YOUR BLENDER PATH HERE:
// Replace with your actual Blender installation path
const BLENDER_BIN = process.env.BLENDER_BIN ??
    'C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe';  // ← CHANG

const BLEND_FILE = process.env.BLEND_FILE ?? path.resolve(__dirname, '..', 'GN_test.blend');
const BLENDER_SCRIPT = process.env.BLENDER_SCRIPT ?? path.resolve(__dirname, '..', 'blender', 'gn_worker.py');
const TARGET_OBJECT = process.env.TARGET_OBJECT ?? ''; // optional

const app = express();

// In development, Vite serves the frontend, so we only need WebSocket server
// In production, serve the built frontend from web/dist
const serveStatic = process.env.NODE_ENV === 'production';
if (serveStatic) {
  app.use(express.static(path.resolve(__dirname, '..', 'web', 'dist')));
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

console.log('Blender Configuration:');
console.log('  BLENDER_BIN:', BLENDER_BIN);
console.log('  BLEND_FILE:', BLEND_FILE);
console.log('  BLENDER_SCRIPT:', BLENDER_SCRIPT);
console.log('  TARGET_OBJECT:', TARGET_OBJECT || '(auto-detect)');

function runBlenderOnce({ mode, values }) {
  return new Promise((resolve, reject) => {
    const args = [
      '--background',
      '--factory-startup',
      '--log-level', '0',  // Suppress Blender logging
      BLEND_FILE,
      '--python',
      BLENDER_SCRIPT,
      '--',
      `--mode=${mode}`,
      TARGET_OBJECT ? `--object=${TARGET_OBJECT}` : '',
      values ? `--values=${JSON.stringify(values)}` : ''
    ].filter(Boolean);

    console.log(`[Blender] Spawning: ${BLENDER_BIN} with mode=${mode}`);
    
    const child = spawn(BLENDER_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    const outChunks = [];
    const errChunks = [];

    child.stdout.on('data', (d) => outChunks.push(d));
    child.stderr.on('data', (d) => {
      errChunks.push(d);
      // Log Blender errors in real-time for debugging
      const msg = d.toString('utf8').trim();
      if (msg && !msg.includes('Info:') && !msg.includes('Warning:')) {
        console.log(`[Blender stderr] ${msg}`);
      }
    });

    child.on('error', (err) => {
      console.error('[Blender] Process error:', err.message);
      reject(err);
    });
    
    child.on('close', (code) => {
      const stderr = Buffer.concat(errChunks).toString('utf8');
      if (code !== 0) {
        console.error(`[Blender] Exited with code ${code}`);
        console.error(`[Blender] stderr:\n${stderr}`);
        reject(new Error(`Blender exited with code ${code}\n${stderr}`));
        return;
      }
      
      const buf = Buffer.concat(outChunks);
      
      // IMPORTANT: For schema mode, we need to extract just the JSON
      // Blender 5.0 may include extra output, so we need to filter it
      if (mode === 'schema') {
        const output = buf.toString('utf8');
        
        // Find the JSON object in the output
        const jsonMatch = output.match(/\{"type":\s*"schema".*\}/);
        
        if (jsonMatch) {
          const cleanJson = jsonMatch[0];
          console.log(`[Blender] Schema extracted, ${cleanJson.length} chars`);
          resolve({ buf: Buffer.from(cleanJson, 'utf8'), stderr });
        } else {
          console.error('[Blender] Could not find JSON in output');
          console.error('[Blender] Raw output:', output.substring(0, 500));
          reject(new Error('Could not extract JSON schema from Blender output'));
        }
      } else {
        // For mesh mode, we need to find the binary data
        // Look for the MESH magic number (0x4D455348) in the buffer
        const MESH_MAGIC = 0x4D455348;
        
        console.log(`[Blender] Raw buffer size: ${buf.length} bytes`);
        console.log(`[Blender] First 200 bytes as hex:`, buf.slice(0, 200).toString('hex'));
        console.log(`[Blender] First 200 bytes as text:`, buf.slice(0, 200).toString('utf8').replace(/\n/g, '\\n'));
        
        // Search for the magic number in the buffer
        let meshStart = -1;
        for (let i = 0; i <= buf.length - 4; i++) {
          const magic = buf.readUInt32LE(i);
          if (magic === MESH_MAGIC) {
            meshStart = i;
            console.log(`[Blender] Found MESH magic at offset ${i}`);
            break;
          }
        }
        
        if (meshStart >= 0) {
          // Extract only the mesh data (from magic number onwards)
          const cleanBuf = buf.slice(meshStart);
          console.log(`[Blender] Success, extracted ${cleanBuf.length} bytes (skipped ${meshStart} bytes of logs)`);
          
          // Verify the extracted data
          const dv = new DataView(cleanBuf.buffer, cleanBuf.byteOffset, cleanBuf.length);
          const vertexCount = dv.getUint32(8, true);
          const indexCount = dv.getUint32(12, true);
          console.log(`[Blender] Mesh contains: ${vertexCount} vertices, ${indexCount} indices`);
          
          resolve({ buf: cleanBuf, stderr });
        } else {
          console.error('[Blender] Could not find MESH magic number in output');
          console.error('[Blender] Buffer length:', buf.length);
          console.error('[Blender] Searching for magic 0x4D455348 (MESH)');
          console.error('[Blender] First 100 bytes:', buf.slice(0, 100).toString('utf8'));
          console.error('[Blender] First 100 bytes (hex):', buf.slice(0, 100).toString('hex'));
          reject(new Error('Could not extract mesh binary from Blender output'));
        }
      }
    });
  });
}

wss.on('connection', (ws, req) => {
  console.log(`[WebSocket] Client connected from ${req.socket.remoteAddress}`);
  
  let latestValues = {};
  let inFlight = false;
  let pending = false;

  async function rebuild() {
    if (inFlight) {
      pending = true;
      return;
    }
    inFlight = true;
    pending = false;

    try {
      const { buf } = await runBlenderOnce({ mode: 'mesh', values: latestValues });
      if (ws.readyState === ws.OPEN) {
        ws.send(buf);
      }
    } catch (e) {
      console.error('[WebSocket] Error rebuilding mesh:', e.message);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'error', message: String(e?.message ?? e) }));
      }
    } finally {
      inFlight = false;
      if (pending) rebuild();
    }
  }

  ws.on('message', async (data, isBinary) => {
    if (isBinary) return;

    let msg;
    try {
      msg = JSON.parse(data.toString('utf8'));
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    console.log(`[WebSocket] Received message: ${msg.type}`);

    if (msg.type === 'schema') {
      try {
        const { buf } = await runBlenderOnce({ mode: 'schema' });
        // Schema is returned as UTF-8 JSON bytes to stdout.
        ws.send(buf.toString('utf8'));
      } catch (e) {
        console.error('[WebSocket] Error getting schema:', e.message);
        ws.send(JSON.stringify({ type: 'error', message: String(e?.message ?? e) }));
      }
      return;
    }

    if (msg.type === 'set') {
      latestValues = { ...latestValues, ...(msg.values ?? {}) };
      console.log(`[WebSocket] Parameters updated:`, latestValues);
      // Debounce a tiny bit: wait for multiple slider events.
      if (!inFlight) {
        setTimeout(rebuild, 25);
      } else {
        pending = true;
      }
      return;
    }

    ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${msg.type}` }));
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('  Geometry Nodes WebSocket Server');
  console.log('========================================');
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`WebSocket URL: ws://localhost:${PORT}`);
  console.log('');
  if (!serveStatic) {
    console.log('MODE: Development (WebSocket only)');
    console.log('Run Vite dev server separately: cd web && npm run dev');
  } else {
    console.log('MODE: Production (serving static files)');
  }
  console.log('========================================');
});
