import React, { useState } from 'react';
import ParameterControl from './ParameterControl';
import ViewerControls from './ViewerControls';
import './ControlPanel.css';

function ControlPanel({ schema, status, parameters, onParameterChange, isConnected, meshData, onViewerSettingsChange }) {
  const [activeTab, setActiveTab] = useState('parameters'); // 'parameters' | 'viewer'

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h1>Geometry Nodes Editor</h1>
        <div className="status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
          {status}
        </div>
      </div>

      <div className="panel-tabs">
        <button
          className={`panel-tab ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          ?? Parameters
        </button>
        <button
          className={`panel-tab ${activeTab === 'viewer' ? 'active' : ''}`}
          onClick={() => setActiveTab('viewer')}
        >
          ??? Viewer
        </button>
      </div>

      {activeTab === 'parameters' && (
        <>
          <div className="panel-info">
            <p className="small">
              This UI is automatically generated from your Blender Geometry Nodes modifier inputs.
            </p>
          </div>

          <div className="controls-container">
            {schema?.params?.length > 0 ? (
              schema.params.map((param) => {
                // Use identifier for the internal key (what Blender uses)
                // Use name as fallback for backwards compatibility
                const paramKey = param.identifier || param.name;
                
                return (
                  <ParameterControl
                    key={paramKey}
                    param={param}
                    value={parameters[paramKey]}
                    onChange={(value) => onParameterChange(paramKey, value)}
                  />
                );
              })
            ) : (
              <div className="no-params">
                {isConnected ? 'Loading parameters...' : 'Waiting for connection...'}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'viewer' && (
        <ViewerControls
          onSettingsChange={onViewerSettingsChange}
          meshData={meshData}
        />
      )}
    </div>
  );
}

export default ControlPanel;
