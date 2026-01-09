# ?? Quick Viewer Guide

## Access the Viewer

1. **Start the application**
2. **Click the `??? Viewer` tab** in the left sidebar
3. **Experiment with controls!**

---

## ?? Quick Actions

### See Wireframe Structure
```
Viewer Tab ? Display
? Show Wireframe
```

### Wireframe Only Mode
```
Viewer Tab ? Display
? Wireframe Only
```

### Change Mesh Color
```
Viewer Tab ? Material
Color: [click color picker]
```

### Metallic Surface
```
Viewer Tab ? Material
Metalness: 1.0
Roughness: 0.2
```

### Matte Surface
```
Viewer Tab ? Material
Metalness: 0.0
Roughness: 1.0
```

### Hide Grid
```
Viewer Tab ? Display
? Show Grid
```

### Change Background
```
Viewer Tab ? Scene
Background: [click color picker]
```

### See Mesh Stats
```
Viewer Tab ? Scroll down to:
?? Mesh Info
```

---

## ?? Recommended Settings

### **Design Review**
- Smooth shading
- No wireframe
- Grid ON
- Axes ON
- Light background

### **Technical Analysis**
- Flat shading
- Wireframe overlay
- Grid ON
- Axes ON
- Dark background

### **Presentation Mode**
- Smooth shading
- No wireframe
- Grid OFF
- Axes OFF
- Custom background

### **Debugging**
- Wireframe only
- Grid ON
- Axes ON
- High contrast colors

---

## ?? Reset to Default

If you want to reset all viewer settings:

```javascript
// Default settings:
? Show Grid: ON
? Show Axes: ON
? Color: #7aa6ff
? Metalness: 0.0
? Roughness: 0.8
? Shading: Smooth
? Background: #f6f6f6
```

Just refresh the browser to restore defaults!

---

## ?? Understanding Mesh Info

```
Vertices: 1,234    ? Points in 3D space
Triangles: 2,468   ? Number of faces
Indices: 7,404     ? Total index count (triangles × 3)
```

**Higher numbers = more detail = slower rendering**

---

## ?? Camera Controls

- **Left Mouse** - Rotate camera
- **Right Mouse** - Pan camera
- **Scroll Wheel** - Zoom in/out
- **Middle Mouse** - Pan camera (alternative)

These work in both Parameters and Viewer tabs!

---

Happy viewing! ???
