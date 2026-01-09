import React, { useState, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import ControlPanel from './components/ControlPanel';
import useWebSocket from './hooks/useWebSocket';
import './App.css';

function App() {
  const [schema, setSchema] = useState(null);
  const [status, setStatus] = useState('Connecting...');
  const { ws, isConnected, sendMessage } = useWebSocket('ws://localhost:8080');
  const [meshData, setMeshData] = useState(null);
  const [parameters, setParameters] = useState({});
  const [viewerSettings, setViewerSettings] = useState({
    showWireframe: false,
    wireframeOnly: false,
    shading: 'smooth',
    color: '#7aa6ff',
    metalness: 0.0,
    roughness: 0.8,
    showGrid: true,
    showAxes: true,
    background: '#f6f6f6'
  });

  useEffect(() => {
    if (!ws) return;

    ws.onopen = () => {
      setStatus('Connected. Loading schema...');
      sendMessage({ type: 'schema' });
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          console.log('[App] Received string message:', event.data.substring(0, 200)); // Log first 200 chars
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'schema') {
            console.log('[App] Schema received:', msg);
            setSchema(msg);
            setStatus('Schema loaded. Building mesh...');
            sendMessage({ type: 'set', values: {} });
          } else if (msg.type === 'error') {
            console.error('[App] Error from server:', msg.message);
            setStatus(`Error: ${msg.message}`);
          }
        } catch (err) {
          console.error('[App] Failed to parse JSON:', err);
          console.error('[App] Raw data:', event.data);
          setStatus(`Parse error: ${err.message} - Check console`);
        }
      } else {
        // Binary mesh data
        console.log('[App] Received binary data, size:', event.data.byteLength);
        parseMeshPacket(event.data);
      }
    };

    ws.onclose = () => {
      setStatus('Disconnected');
      console.log('[App] WebSocket closed');
    };

    ws.onerror = (err) => {
      console.error('[App] WebSocket error:', err);
      setStatus(`WebSocket error: ${err.message || 'Connection failed'}`);
    };
  }, [ws, sendMessage]);

  const parseMeshPacket = (arrayBuffer) => {
    try {
      const dv = new DataView(arrayBuffer);
      const magic = dv.getUint32(0, true);
      
      console.log('[App] Mesh packet magic:', magic.toString(16), 'expected: 4d455348');
      
      if (magic !== 0x4D455348) {
        setStatus('Bad mesh packet - invalid magic number');
        console.error('[App] Invalid magic number');
        return;
      }
      
      const version = dv.getUint32(4, true);
      if (version !== 1) {
        setStatus(`Unsupported packet version: ${version}`);
        return;
      }

      const vertexCount = dv.getUint32(8, true);
      const indexCount = dv.getUint32(12, true);

      console.log('[App] Mesh data:', { vertexCount, indexCount });

      const headerBytes = 16;
      const posBytes = vertexCount * 3 * 4;
      const nrmBytes = vertexCount * 3 * 4;

      let offset = headerBytes;
      const positions = new Float32Array(arrayBuffer, offset, vertexCount * 3);
      offset += posBytes;
      const normals = new Float32Array(arrayBuffer, offset, vertexCount * 3);
      offset += nrmBytes;
      const indices = new Uint32Array(arrayBuffer, offset, indexCount);

      setMeshData({ positions, normals, indices, vertexCount, indexCount });
      setStatus(`Mesh: ${vertexCount.toLocaleString()} verts, ${indexCount.toLocaleString()} indices`);
      console.log('[App] Mesh loaded successfully');
    } catch (err) {
      console.error('[App] Error parsing mesh packet:', err);
      setStatus(`Mesh parse error: ${err.message}`);
    }
  };

  const handleParameterChange = (name, value) => {
    console.log('[App] Parameter changed:', name, '=', value);
    setParameters(prev => {
      const newParams = { ...prev, [name]: value };
      console.log('[App] Sending parameters to server:', newParams);
      sendMessage({ type: 'set', values: newParams });
      return newParams;
    });
  };

  const handleViewerSettingsChange = (newSettings) => {
    console.log('[App] Viewer settings changed:', newSettings);
    setViewerSettings(newSettings);
  };

  console.log('[App] Render - meshData:', meshData ? `${meshData.vertexCount} verts` : 'null');

  return (
    <div className="app">
      <ControlPanel 
        schema={schema}
        status={status}
        parameters={parameters}
        onParameterChange={handleParameterChange}
        isConnected={isConnected}
        meshData={meshData}
        onViewerSettingsChange={handleViewerSettingsChange}
      />
      <Scene3D meshData={meshData} viewerSettings={viewerSettings} />
    </div>
  );
}

export default App;
