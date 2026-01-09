import React, { useState } from 'react';
import './ViewerControls.css';

function ViewerControls({ onSettingsChange, meshData }) {
  const [settings, setSettings] = useState({
    showWireframe: false,
    wireframeOnly: false,
    shading: 'smooth', // 'flat' | 'smooth'
    color: '#7aa6ff',
    metalness: 0.0,
    roughness: 0.8,
    showNormals: false,
    showGrid: true,
    showAxes: true,
    background: '#f6f6f6'
  });

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="viewer-controls">
      <div className="viewer-section">
        <h3 className="viewer-section-title">?? Display</h3>
        
        <div className="viewer-control-row">
          <label className="viewer-checkbox">
            <input
              type="checkbox"
              checked={settings.showWireframe}
              onChange={(e) => handleChange('showWireframe', e.target.checked)}
            />
            <span>Show Wireframe</span>
          </label>
        </div>

        <div className="viewer-control-row">
          <label className="viewer-checkbox">
            <input
              type="checkbox"
              checked={settings.wireframeOnly}
              onChange={(e) => handleChange('wireframeOnly', e.target.checked)}
            />
            <span>Wireframe Only</span>
          </label>
        </div>

        <div className="viewer-control-row">
          <label className="viewer-checkbox">
            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(e) => handleChange('showGrid', e.target.checked)}
            />
            <span>Show Grid</span>
          </label>
        </div>

        <div className="viewer-control-row">
          <label className="viewer-checkbox">
            <input
              type="checkbox"
              checked={settings.showAxes}
              onChange={(e) => handleChange('showAxes', e.target.checked)}
            />
            <span>Show Axes</span>
          </label>
        </div>
      </div>

      <div className="viewer-section">
        <h3 className="viewer-section-title">?? Material</h3>

        <div className="viewer-control-row">
          <label className="viewer-label">Color</label>
          <input
            type="color"
            value={settings.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="viewer-color-input"
          />
        </div>

        <div className="viewer-control-row">
          <label className="viewer-label">Metalness</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.metalness}
            onChange={(e) => handleChange('metalness', parseFloat(e.target.value))}
            className="viewer-slider"
          />
          <span className="viewer-value">{settings.metalness.toFixed(2)}</span>
        </div>

        <div className="viewer-control-row">
          <label className="viewer-label">Roughness</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.roughness}
            onChange={(e) => handleChange('roughness', parseFloat(e.target.value))}
            className="viewer-slider"
          />
          <span className="viewer-value">{settings.roughness.toFixed(2)}</span>
        </div>

        <div className="viewer-control-row">
          <label className="viewer-label">Shading</label>
          <select
            value={settings.shading}
            onChange={(e) => handleChange('shading', e.target.value)}
            className="viewer-select"
          >
            <option value="smooth">Smooth</option>
            <option value="flat">Flat</option>
          </select>
        </div>
      </div>

      <div className="viewer-section">
        <h3 className="viewer-section-title">?? Scene</h3>

        <div className="viewer-control-row">
          <label className="viewer-label">Background</label>
          <input
            type="color"
            value={settings.background}
            onChange={(e) => handleChange('background', e.target.value)}
            className="viewer-color-input"
          />
        </div>
      </div>

      {meshData && (
        <div className="viewer-section">
          <h3 className="viewer-section-title">?? Mesh Info</h3>
          <div className="mesh-info">
            <div className="mesh-info-row">
              <span className="mesh-info-label">Vertices:</span>
              <span className="mesh-info-value">{meshData.vertexCount?.toLocaleString() || 0}</span>
            </div>
            <div className="mesh-info-row">
              <span className="mesh-info-label">Triangles:</span>
              <span className="mesh-info-value">{meshData.indexCount ? (meshData.indexCount / 3).toLocaleString() : 0}</span>
            </div>
            <div className="mesh-info-row">
              <span className="mesh-info-label">Indices:</span>
              <span className="mesh-info-value">{meshData.indexCount?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewerControls;
