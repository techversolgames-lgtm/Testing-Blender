import React, { useState, useEffect } from 'react';
import './ParameterControl.css';

function ParameterControl({ param, value, onChange }) {
  const [localValue, setLocalValue] = useState(value ?? getDefaultValue(param));

  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  function getDefaultValue(param) {
    if (param.default !== undefined) return param.default;
    if (param.type === 'bool') return false;
    if (param.type === 'string') return '';
    if (param.type === 'float_array') return new Array(param.length || 3).fill(0);
    return param.soft_min ?? param.min ?? 0;
  }

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const min = Number.isFinite(param.soft_min) ? param.soft_min : (Number.isFinite(param.min) ? param.min : 0);
  const max = Number.isFinite(param.soft_max) ? param.soft_max : (Number.isFinite(param.max) ? param.max : 1);

  // Use display_name if available, otherwise fall back to name
  const displayName = param.display_name || param.name;

  const renderControl = () => {
    if (param.type === 'float' || param.type === 'int') {
      const step = param.type === 'int' ? 1 : 0.001;
      
      return (
        <div className="control-inputs">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={(e) => handleChange(param.type === 'int' ? parseInt(e.target.value, 10) : parseFloat(e.target.value))}
            className="range-input"
          />
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={(e) => handleChange(param.type === 'int' ? parseInt(e.target.value, 10) : parseFloat(e.target.value))}
            className="number-input"
          />
        </div>
      );
    }

    if (param.type === 'bool') {
      return (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={localValue}
            onChange={(e) => handleChange(e.target.checked)}
            className="checkbox-input"
          />
          <span className="checkbox-text">
            {localValue ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      );
    }

    if (param.type === 'string') {
      return (
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="text-input"
          placeholder={`Enter ${displayName.toLowerCase()}...`}
        />
      );
    }

    if (param.type === 'float_array' && param.length) {
      const arr = Array.isArray(localValue) ? localValue : new Array(param.length).fill(0);
      
      return (
        <div className="array-inputs">
          {arr.map((val, i) => (
            <input
              key={i}
              type="number"
              step="0.001"
              value={val}
              onChange={(e) => {
                const newArr = [...arr];
                newArr[i] = parseFloat(e.target.value) || 0;
                handleChange(newArr);
              }}
              className="array-input"
              placeholder={String.fromCharCode(88 + i)} // X, Y, Z
            />
          ))}
        </div>
      );
    }

    return (
      <div className="unsupported-type">
        Unsupported type: {param.type}
      </div>
    );
  };

  return (
    <div className="parameter-control">
      <label className="param-label">
        {displayName}
        {param.description && (
          <span className="param-description">{param.description}</span>
        )}
      </label>
      {renderControl()}
    </div>
  );
}

export default ParameterControl;
