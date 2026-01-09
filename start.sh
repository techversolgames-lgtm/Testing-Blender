#!/bin/bash

echo "========================================"
echo "  Blender Geometry Nodes - React Setup"
echo "========================================"
echo ""

echo "[1/4] Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install server dependencies"
    exit 1
fi
cd ..

echo ""
echo "[2/4] Installing web dependencies..."
cd web
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install web dependencies"
    exit 1
fi
cd ..

echo ""
echo "[3/4] Setup complete!"
echo ""
echo "[4/4] You can now start the servers:"
echo ""
echo "Terminal 1: cd server && npm run dev"
echo "Terminal 2: cd web && npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
