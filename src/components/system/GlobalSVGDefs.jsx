import React from 'react';

export const GlobalSVGDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
    <defs>
      {/* Finder Face Gradients */}
      <linearGradient id="finderFace" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0050cd" />
        <stop offset="100%" stopColor="#002ea8" />
      </linearGradient>
      <linearGradient id="finderGloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
        <stop offset="40%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      
      {/* AOL/Chat Gradients */}
      <radialGradient id="bubbleGrad" cx="40%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#a3c2ff" />
        <stop offset="100%" stopColor="#3d6ca8" />
      </radialGradient>
      {/* IE Gradients */}
      <linearGradient id="eGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
      {/* Trash Texture */}
      <pattern id="meshGrid" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#525252" strokeWidth="1" />
        <line x1="0" y1="0" x2="6" y2="0" stroke="#525252" strokeWidth="1" />
      </pattern>
      
      {/* Folder Gradients (The Classic Aqua Blue) */}
      <linearGradient id="folderBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7aa3f5" />
          <stop offset="100%" stopColor="#487ce8" />
      </linearGradient>
      <linearGradient id="folderFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#92b6f8" />
          <stop offset="100%" stopColor="#5890f0" />
      </linearGradient>
      <linearGradient id="folderGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

