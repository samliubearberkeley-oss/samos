import React from 'react';

// --- Core Folder Component ---
export const AquaFolder = ({ children, symbolOpacity = 0.7 }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    {/* Back Tab */}
    <path d="M10 25 L 35 25 L 40 15 L 90 15 L 90 85 L 10 85 Z" fill="url(#folderBack)" stroke="#3b6ccf" strokeWidth="1" />
    
    {/* Content/Symbol Layer (Behind front flap) */}
    <g opacity={symbolOpacity}>
       {children}
    </g>
    
    {/* Front Flap */}
    <path d="M10 85 L 15 38 L 85 38 L 90 85 Z" fill="url(#folderFront)" stroke="#417bd9" strokeWidth="1" />
    
    {/* Classic Aqua Gloss Curve */}
    <path d="M15 38 L 85 38 L 83 60 Q 50 75 17 60 Z" fill="url(#folderGloss)" />
  </svg>
);

// --- Specific Folder Types ---

// 1. Applications (Tools)
export const AppsFolderIcon = () => (
  <AquaFolder>
    <g transform="translate(45, 30) scale(0.8)">
       <rect x="-15" y="0" width="10" height="40" transform="rotate(-45)" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
       <rect x="10" y="-10" width="6" height="50" transform="rotate(45)" fill="#ef4444" stroke="#991b1b" />
       <path d="M40 20 L 60 40 L 50 50 L 30 30 Z" fill="#a3a3a3" stroke="#404040" />
    </g>
  </AquaFolder>
);

// 2. Documents (Paper)
export const DocumentsFolderIcon = () => (
  <AquaFolder>
      <rect x="30" y="20" width="40" height="50" fill="white" stroke="#d1d5db" />
      <line x1="35" y1="30" x2="65" y2="30" stroke="#9ca3af" strokeWidth="2" />
      <line x1="35" y1="40" x2="65" y2="40" stroke="#9ca3af" strokeWidth="2" />
      <line x1="35" y1="50" x2="65" y2="50" stroke="#9ca3af" strokeWidth="2" />
  </AquaFolder>
);

// 3. Music (Note)
export const MusicFolderIcon = () => (
  <AquaFolder>
      <path d="M45 20 L 45 55 Q 45 65 35 65 Q 25 65 25 55 Q 25 45 35 45 L 40 45 L 40 25 L 60 20 L 60 50 Q 60 60 50 60 Q 40 60 40 50 Q 40 40 50 40 L 55 40 L 55 20 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1" transform="translate(10, 5)" opacity="0.8" />
  </AquaFolder>
);

// 4. Images/Pictures (Photo)
export const PicturesFolderIcon = () => (
  <AquaFolder>
      <rect x="25" y="25" width="50" height="40" fill="white" stroke="#6b7280" strokeWidth="1" />
      <rect x="28" y="28" width="44" height="34" fill="#bfdbfe" />
      <circle cx="40" cy="40" r="5" fill="#fcd34d" />
      <path d="M28 62 L 40 50 L 55 62 Z" fill="#4ade80" />
      <path d="M45 62 L 60 45 L 72 62 Z" fill="#22c55e" />
  </AquaFolder>
);

// 5. Desktop (Finder Face on Monitor)
export const DesktopFolderIcon = () => (
  <AquaFolder>
      <rect x="25" y="25" width="50" height="40" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2" rx="2" />
      <rect x="28" y="28" width="44" height="34" fill="#3b82f6" />
      {/* Mini Finder Face */}
      <path d="M35 40 C 35 40, 32 45, 32 50 C 32 55, 35 58, 38 58" stroke="black" fill="none" strokeWidth="1" />
      <path d="M65 40 C 65 40, 68 45, 68 50 C 68 55, 65 58, 62 58" stroke="black" fill="none" strokeWidth="1" />
      <path d="M50 40 L 50 58" stroke="black" fill="none" strokeWidth="1" />
      <path d="M35 50 C 40 55, 60 55, 65 50" stroke="black" fill="none" strokeWidth="1" />
  </AquaFolder>
);

// 6. Sites (Globe)
export const SitesFolderIcon = () => (
  <AquaFolder>
     <circle cx="50" cy="45" r="20" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1" />
     <path d="M50 25 L 50 65" stroke="white" strokeWidth="1" />
     <path d="M30 45 L 70 45" stroke="white" strokeWidth="1" />
     <ellipse cx="50" cy="45" rx="10" ry="20" stroke="white" fill="none" strokeWidth="1" />
  </AquaFolder>
);

// 7. Videos (Film)
export const VideosFolderIcon = () => (
  <AquaFolder>
      <rect x="25" y="30" width="50" height="30" fill="#1f2937" stroke="black" />
      <rect x="25" y="30" width="50" height="5" fill="white" opacity="0.2" />
      <rect x="25" y="55" width="50" height="5" fill="white" opacity="0.2" />
      {/* Holes */}
      <rect x="28" y="32" width="3" height="2" fill="white" />
      <rect x="38" y="32" width="3" height="2" fill="white" />
      <rect x="48" y="32" width="3" height="2" fill="white" />
      <rect x="58" y="32" width="3" height="2" fill="white" />
      <rect x="68" y="32" width="3" height="2" fill="white" />
      
      <rect x="28" y="56" width="3" height="2" fill="white" />
      <rect x="38" y="56" width="3" height="2" fill="white" />
      <rect x="48" y="56" width="3" height="2" fill="white" />
      <rect x="58" y="56" width="3" height="2" fill="white" />
      <rect x="68" y="56" width="3" height="2" fill="white" />
  </AquaFolder>
);

