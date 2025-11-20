import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Maximize2, ChevronLeft, ChevronRight, Search, Wifi, Battery, Volume2, Command, Check, Settings, Send, Trash2, Plus, LogOut } from 'lucide-react';
import { useAuth, useUser, SignInButton, SignUpButton, SignedIn, SignedOut } from '@insforge/react';
import { createClient } from '@insforge/sdk';
import ReactMarkdown from 'react-markdown';

// Menu Items for MenuBar
const MENU_ITEMS = {
  file: [
    { label: 'New Finder Window', icon: 'app', check: false },
    { label: 'New Folder', icon: 'doc', check: false },
    { label: 'separator' },
    { label: 'Get Info', icon: 'doc', check: false },
    { label: 'separator' },
    { label: 'Eject', icon: 'doc', check: false },
    { label: 'separator' },
    { label: 'Close Window', icon: 'doc', check: false }
  ],
  edit: [
    { label: 'Undo', icon: 'doc', check: false },
    { label: 'Redo', icon: 'doc', check: false },
    { label: 'separator' },
    { label: 'Cut', icon: 'doc', check: false },
    { label: 'Copy', icon: 'doc', check: false },
    { label: 'Paste', icon: 'doc', check: false }
  ],
  view: [
    { label: 'as Icons', icon: 'doc', check: true },
    { label: 'as List', icon: 'doc', check: false },
    { label: 'as Columns', icon: 'doc', check: false },
    { label: 'separator' },
    { label: 'Show View Options', icon: 'doc', check: false }
  ],
  go: [
    { label: 'Back', icon: 'doc', check: false },
    { label: 'Forward', icon: 'doc', check: false },
    { label: 'separator' },
    { label: 'Computer', icon: 'doc', check: false },
    { label: 'Home', icon: 'doc', check: false },
    { label: 'Desktop', icon: 'doc', check: false },
    { label: 'Applications', icon: 'doc', check: false }
  ],
  help: [
    { label: 'samOS Help', icon: 'doc', check: false }
  ]
};

// --- 1. Custom SVGs for Icons (Classic Aqua Style) ---

// IMPORTANT: SVG Definitions must be inside a <defs> tag within an <svg> block.

// We'll render this once at the top level of the app.

const GlobalSVGDefs = () => (
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

// --- Core Folder Component ---
const AquaFolder = ({ children, symbolOpacity = 0.7 }) => (
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
const AppsFolderIcon = () => (
  <AquaFolder>
    <g transform="translate(45, 30) scale(0.8)">
       <rect x="-15" y="0" width="10" height="40" transform="rotate(-45)" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
       <rect x="10" y="-10" width="6" height="50" transform="rotate(45)" fill="#ef4444" stroke="#991b1b" />
       <path d="M40 20 L 60 40 L 50 50 L 30 30 Z" fill="#a3a3a3" stroke="#404040" />
    </g>
  </AquaFolder>
);

// 2. Documents (Paper)
const DocumentsFolderIcon = () => (
  <AquaFolder>
      <rect x="30" y="20" width="40" height="50" fill="white" stroke="#d1d5db" />
      <line x1="35" y1="30" x2="65" y2="30" stroke="#9ca3af" strokeWidth="2" />
      <line x1="35" y1="40" x2="65" y2="40" stroke="#9ca3af" strokeWidth="2" />
      <line x1="35" y1="50" x2="65" y2="50" stroke="#9ca3af" strokeWidth="2" />
  </AquaFolder>
);

// 3. Music (Note)
const MusicFolderIcon = () => (
  <AquaFolder>
      <path d="M45 20 L 45 55 Q 45 65 35 65 Q 25 65 25 55 Q 25 45 35 45 L 40 45 L 40 25 L 60 20 L 60 50 Q 60 60 50 60 Q 40 60 40 50 Q 40 40 50 40 L 55 40 L 55 20 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1" transform="translate(10, 5)" opacity="0.8" />
  </AquaFolder>
);

// 4. Images/Pictures (Photo)
const PicturesFolderIcon = () => (
  <AquaFolder>
      <rect x="25" y="25" width="50" height="40" fill="white" stroke="#6b7280" strokeWidth="1" />
      <rect x="28" y="28" width="44" height="34" fill="#bfdbfe" />
      <circle cx="40" cy="40" r="5" fill="#fcd34d" />
      <path d="M28 62 L 40 50 L 55 62 Z" fill="#4ade80" />
      <path d="M45 62 L 60 45 L 72 62 Z" fill="#22c55e" />
  </AquaFolder>
);

// 5. Desktop (Finder Face on Monitor)
const DesktopFolderIcon = () => (
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
const SitesFolderIcon = () => (
  <AquaFolder>
     <circle cx="50" cy="45" r="20" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1" />
     <path d="M50 25 L 50 65" stroke="white" strokeWidth="1" />
     <path d="M30 45 L 70 45" stroke="white" strokeWidth="1" />
     <ellipse cx="50" cy="45" rx="10" ry="20" stroke="white" fill="none" strokeWidth="1" />
  </AquaFolder>
);

// 7. Videos (Film)
const VideosFolderIcon = () => (
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

// 8. Applets (System/Gear)
const AppletsIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      <rect x="15" y="15" width="70" height="70" rx="10" fill="#a8a29e" stroke="#57534e" strokeWidth="1" />
      <circle cx="50" cy="50" r="25" fill="#e5e5e5" stroke="#78716c" strokeWidth="2" strokeDasharray="8 4" />
      <circle cx="50" cy="50" r="10" fill="#a8a29e" />
      <path d="M15 15 L 85 85" stroke="white" opacity="0.2" strokeWidth="2" />
  </svg>
);

// --- Main Dock/App Icons ---
const IconImage = ({ src, alt, fallback, eager = false }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallback) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  // Preload important icons
  useEffect(() => {
    if (eager) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      return () => document.head.removeChild(link);
    }
  }, [src, eager]);

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className="w-full h-full object-contain drop-shadow-xl"
      style={{ imageRendering: 'high-quality' }}
      onError={handleError}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
};

const FinderIcon = () => (
  <IconImage 
    src="/icons/finder-icon.png" 
    alt="Finder"
    eager={true}
  />
);

const AOLIcon = () => (
  <IconImage 
    src="/icons/chatgpt-icon.png" 
    alt="ChatGPT"
    eager={true}
  />
);

const IEIcon = () => (
  <IconImage 
    src="/icons/ie-icon.png" 
    alt="Internet Explorer"
    eager={true}
  />
);

const AppsIcon = () => (
  <IconImage 
    src="/icons/applications-icon.png" 
    alt="Applications"
    eager={true}
  />
);

const TrashIcon = () => (
  <IconImage 
    src="/icons/trash-icon.png" 
    alt="Trash"
    eager={true}
  />
);

// Desktop Icons
const HardDriveIcon = () => (
  <div className="flex flex-col items-center group cursor-pointer w-20 mb-4">
    <div className="w-16 h-16 drop-shadow-md mb-1">
      <IconImage 
        src="/icons/macintosh-hd-icon.png" 
        alt="Macintosh HD"
        eager={true}
      />
    </div>
    <span className="text-white text-xs font-medium px-2 py-0.5 rounded bg-black/0 group-hover:bg-blue-600/80 shadow-sm text-center leading-tight whitespace-nowrap">Macintosh HD</span>
  </div>
);

const IpodDesktopIcon = () => (
  <div className="flex flex-col items-center group cursor-pointer w-20 mb-4">
    <div className="w-16 h-16 drop-shadow-md mb-1">
      <IconImage 
        src="/icons/ipod-icon.png" 
        alt="iPod"
        eager={true}
      />
    </div>
    <span className="text-white text-xs font-medium px-2 py-0.5 rounded bg-black/0 group-hover:bg-blue-600/80 shadow-sm text-center leading-tight whitespace-nowrap">iPod</span>
  </div>
);

// --- 2. System Components ---
const VolumeControl = () => {
  const [volume, setVolume] = useState(70);
  return (
    <div className="absolute top-7 right-10 w-8 h-32 bg-[#f2f2f2] border border-[#b4b4b4] shadow-lg rounded-b-sm flex flex-col items-center justify-between py-2 z-[100]"
         style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)' }}>
       <div className="w-1 h-20 bg-gray-300 rounded-full relative shadow-inner">
          <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-b from-[#7ea7e5] to-[#4a86e8] border border-[#3060a8] shadow-sm" style={{ bottom: `${volume}%` }}></div>
       </div>
       <Settings size={12} className="text-gray-600" />
    </div>
  );
}

const MenuBar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [showVolume, setShowVolume] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef(null);
  const volRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setActiveMenu(null);
      if (volRef.current && !volRef.current.contains(event.target)) setShowVolume(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()} ${hours}:${minutes} ${ampm}`;
  };

  const renderMenu = (items) => (
    <div className="absolute top-7 left-0 bg-[#f6f6f6] border border-[#b4b4b4] shadow-xl rounded-b-md min-w-[200px] py-1 z-[100]">
      {items.map((item, idx) => {
        if (item.label === 'separator') return <div key={idx} className="h-[1px] bg-[#d4d4d4] my-1 mx-1" />;
        return (
          <div key={idx} className={`px-4 py-1 text-sm flex items-center justify-between hover:bg-[#3875d7] hover:text-white cursor-pointer group ${item.disabled ? 'text-gray-400 hover:bg-transparent hover:text-gray-400 cursor-default' : 'text-black'}`}>
            <div className="flex items-center gap-2">
              {item.icon === 'app' && <div className="w-4 h-4 bg-blue-400 rounded-sm" />}
              {item.icon === 'doc' && <div className="w-4 h-4 bg-gray-300 rounded-sm" />}
              {item.icon === 'trash' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
              <span>{item.label}</span>
            </div>
            {item.check && <Check size={12} className="text-black group-hover:text-white" />}
          </div>
        );
      })}
       <div className="absolute inset-0 pointer-events-none opacity-10 z-[-1]" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #000 2px, #000 3px)' }}></div>
    </div>
  );

  return (
    <div 
      className="h-7 border-b border-[#b4b4b4] flex items-center justify-between px-4 fixed top-0 w-full z-50 shadow-sm text-sm select-none font-sans" 
      style={{
        background: `repeating-linear-gradient(to right, #f6f6f6, #f6f6f6 2px, #e0e0e0 2px, #e0e0e0 4px)`,
        backgroundImage: `linear-gradient(to bottom, #f6f6f6, #e0e0e0), repeating-linear-gradient(to right, #f6f6f6, #f6f6f6 2px, #e0e0e0 2px, #e0e0e0 4px)`
      }}
      ref={menuRef}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center -ml-4 -mr-2" style={{ height: '3.125rem', width: 'auto', aspectRatio: '1' }}>
          <IconImage 
            src="/icons/apple-icon.png" 
            alt="Apple"
            eager={true}
          />
        </div>
        {['File', 'Edit', 'View', 'Go', 'Help'].map(menu => (
          <div key={menu} className="relative">
            <span className={`text-gray-800 drop-shadow-sm cursor-pointer px-1 rounded ${activeMenu === menu ? 'bg-[#3875d7] text-white' : 'hover:bg-blue-400/50'}`} onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}>{menu}</span>
            {activeMenu === menu && renderMenu(MENU_ITEMS[menu.toLowerCase()])}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={volRef}>
           <Volume2 size={16} className="text-gray-700 cursor-pointer hover:text-black" onClick={() => setShowVolume(!showVolume)}/>
           {showVolume && <VolumeControl />}
        </div>
        <span className="text-xs font-medium text-gray-700">{formatTime(currentTime)}</span>
      </div>
    </div>
  );
};

const DockItem = ({ icon: Icon, label, onClick, bounce, isOpen, tooltipOverride }) => {
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef(null);

  const updateTooltipPos = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      // 考虑 hover 时图标向上移动 16px (translate-y-4 = 1rem = 16px)
      const hoverOffset = isHovered ? -16 : 0;
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top + hoverOffset - 12
      });
    }
  };

  useEffect(() => {
    if (isHovered) {
      updateTooltipPos();
      const handleResize = () => updateTooltipPos();
      const handleScroll = () => updateTooltipPos();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(updateTooltipPos, 0);
  };

  const handleMouseMove = () => {
    if (isHovered) {
      updateTooltipPos();
    }
  };

  return (
    <>
      <div 
        ref={itemRef}
        className={`group flex flex-col items-center gap-1 relative transition-all duration-300 hover:-translate-y-4 cursor-pointer ${bounce ? 'animate-bounce' : ''}`}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="w-14 h-14 md:w-16 md:h-16 transition-transform duration-200 group-hover:scale-125 z-30 filter drop-shadow-xl relative">
          <Icon />
        </div>
        {isOpen && (
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-black/80 filter blur-[0.5px]"></div>
        )}
      </div>
      {isHovered && createPortal(
        <div 
          className="fixed pointer-events-none flex flex-col items-center transition-opacity"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 999999
          }}
        >
          <div className="bg-[#1e1e1e]/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-white/20 backdrop-blur-sm">
            {tooltipOverride || label}
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1e1e1e]/90"></div>
        </div>,
        document.body
      )}
    </>
  );
};

// --- 3. Windows ---
const TrafficLights = ({ onClose }) => (
  <div className="flex gap-2 ml-2" onMouseDown={(e) => e.stopPropagation()}>
    <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-inner border border-[#e0443e] cursor-pointer hover:brightness-90 flex items-center justify-center" onClick={onClose}></div>
    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner border border-[#e1a11d]"></div>
    <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner border border-[#1aab29]"></div>
  </div>
);

const Window = ({ id, title, x, y, width, height, zIndex, isActive, onClose, onFocus, children, type }) => {
  const [pos, setPos] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    onFocus(id);
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const titleBarGradient = `linear-gradient(to bottom, #e6e6e6 0%, #dcdcdc 50%, #c8c8c8 50%, #b4b4b4 100%)`;
  const pinstripe = `repeating-linear-gradient(to right, #f5f5f5, #f5f5f5 2px, #ffffff 2px, #ffffff 4px)`;

  return (
    <div
      style={{ left: pos.x, top: pos.y, width, height, zIndex, position: 'absolute' }}
      className={`flex flex-col rounded-t-lg rounded-b shadow-2xl overflow-hidden ${isActive ? 'shadow-black/30' : 'shadow-black/10'}`}
      onMouseDown={() => onFocus(id)}
    >
      <div className="h-7 flex items-center justify-between px-2 select-none border-b border-gray-400" style={{ background: titleBarGradient }} onMouseDown={handleMouseDown}>
        <TrafficLights onClose={() => onClose(id)} />
        <span className="text-sm font-semibold text-gray-700 shadow-sm">{title}</span>
        <div className="w-12"></div>
      </div>
      {type === 'finder' && (
        <div className="h-10 bg-[#ececec] border-b border-gray-300 flex items-center px-3 gap-4">
           <div className="flex gap-1"><ChevronLeft size={16} className="text-gray-400" /><ChevronRight size={16} className="text-gray-400" /></div>
           <div className="flex-1 bg-white border border-gray-300 rounded-sm h-6 flex items-center px-2"><span className="text-xs text-gray-500">/</span></div>
        </div>
      )}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden" style={{ background: type === 'ipod' ? '#f2f2f2' : pinstripe }}>
        {children}
      </div>
    </div>
  );
};

// --- Finder Content Grid with Specific Icons ---
const FinderGrid = () => {
  const items = [
    { label: 'Applets', icon: <AppletsIcon /> },
    { label: 'Applications', icon: <AppsFolderIcon /> },
    { label: 'Desktop', icon: <DesktopFolderIcon /> },
    { label: 'Documents', icon: <DocumentsFolderIcon /> },
    { label: 'Images', icon: <PicturesFolderIcon /> },
    { label: 'Music', icon: <MusicFolderIcon /> },
    { label: 'Sites', icon: <SitesFolderIcon /> },
    { label: 'Videos', icon: <VideosFolderIcon /> }
  ];

  return (
    <div className="p-4 grid grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="w-12 h-12">
            {item.icon}
          </div>
          <span className="text-xs font-medium text-gray-700 group-hover:bg-blue-200 px-1 rounded">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// --- Trash Content (Empty State) ---
const TrashGrid = () => {
  return (
    <div className="p-4 flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <div className="w-16 h-16 opacity-50">
          <TrashIcon />
        </div>
        <span className="text-sm font-medium">The Trash is empty</span>
      </div>
    </div>
  );
};

const ChatApp = () => {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const [conversations, setConversations] = useState([
    { id: '1', title: 'New Chat', messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }] }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('1');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredConversationId, setHoveredConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId) || conversations[0];
  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDeleteMessage = (index) => {
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages: conv.messages.filter((_, i) => i !== index) }
        : conv
    ));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }] }
          : conv
      ));
    }
  };

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      title: 'New Chat',
      messages: [{ role: 'assistant', content: '👋 Hello! I\'m ChatGPT. How can I help you today?' }]
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
  };

  const handleDeleteConversation = (conversationId, e) => {
    e.stopPropagation();
    if (conversations.length === 1) {
      alert('Cannot delete the last conversation');
      return;
    }
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (conversationId === currentConversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setCurrentConversationId(remaining[0]?.id || '1');
      }
    }
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
  };

  const updateConversationTitle = (conversationId, title) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, title } : conv
    ));
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        if (signOut) {
          await signOut();
        } else {
          // Fallback: use SDK to sign out
          const client = createClient({
            baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app',
            anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || ''
          });
          await client.auth.signOut();
          // Reload page to clear state
          window.location.reload();
        }
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || !isSignedIn) return;

    const currentMessage = inputMessage.trim();
    const userMessage = { role: 'user', content: currentMessage };
    
    // Update conversation with user message
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    ));
    
    // Update title if it's the first user message
    if (messages.length === 1) {
      const title = currentMessage.length > 30 ? currentMessage.substring(0, 30) + '...' : currentMessage;
      updateConversationTitle(currentConversationId, title);
    }
    
    setInputMessage('');
    setIsLoading(true);

    try {
      const client = createClient({
        baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app',
        anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || ''
      });

      const completion = await client.ai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: currentMessage }
        ],
        temperature: 0.7,
        stream: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'
      };
      
      // Update conversation with assistant message
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      ));
    } catch (error) {
      console.error('AI Error:', error);
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [...conv.messages, {
              role: 'assistant',
              content: 'Sorry, an error occurred. Please try again later.'
            }] }
          : conv
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full text-sm font-sans">
      {/* Sidebar */}
      <div 
        className={`bg-[#e8e8e8] border-r border-[#b4b4b4] flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-12' : 'w-64'
        }`}
      >
        {!sidebarCollapsed && (
          <>
            <div className="p-3 border-b border-[#b4b4b4]">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-700">ChatGPT</div>
                <button
                  onClick={handleNewConversation}
                  className="p-1.5 rounded hover:bg-[#d4d4d4] transition-colors"
                  title="New Chat"
                >
                  <Plus size={16} className="text-gray-700" />
                </button>
              </div>
              <SignedIn>
                <div className="px-3 py-1.5 text-white rounded text-xs mb-2" style={{ background: 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', border: '1px solid #1e4a8a' }}>
                  {user?.email || 'User'}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-[#ff5f57] hover:text-white rounded transition-colors flex items-center justify-center gap-1 border border-[#b4b4b4]"
                  style={{ color: '#0050cd' }}
                  title="Sign out"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </SignedIn>
              <SignedOut>
                <div className="px-3 py-1.5 bg-[#c8c8c8] text-gray-700 rounded text-xs border border-[#b4b4b4]">
                  Not signed in
                </div>
              </SignedOut>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`mb-2 p-2 rounded cursor-pointer group relative ${
                    currentConversationId === conv.id
                      ? 'bg-[#3875d7] text-white'
                      : 'hover:bg-[#d4d4d4] text-gray-700'
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
                  onMouseEnter={() => setHoveredConversationId(conv.id)}
                  onMouseLeave={() => setHoveredConversationId(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 truncate text-xs font-medium pr-6">
                      {conv.title}
                    </div>
                    {hoveredConversationId === conv.id && (
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#ff5f57] hover:text-white transition-colors"
                        title="Delete conversation"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 border-t border-[#b4b4b4] hover:bg-[#d4d4d4] transition-colors flex items-center justify-center"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} className="text-gray-700" />
          ) : (
            <ChevronLeft size={16} className="text-gray-700" />
          )}
        </button>
      </div>
      <div className="flex-1 flex flex-col bg-white">
        <div className="h-8 border-b border-[#b4b4b4] flex items-center justify-between px-3" style={{ background: 'linear-gradient(to bottom, #f6f6f6 0%, #e0e0e0 100%)' }}>
          <span className="font-bold text-gray-700">ChatGPT</span>
          <SignedOut>
            <div className="flex gap-2">
              <SignInButton>
                <span className="text-xs font-bold cursor-pointer hover:bg-[#3875d7] hover:text-white px-2 py-1 rounded" style={{ color: '#0050cd' }}>Sign In</span>
              </SignInButton>
              <SignUpButton>
                <span className="text-xs font-bold cursor-pointer hover:bg-[#3875d7] hover:text-white px-2 py-1 rounded" style={{ color: '#0050cd' }}>Sign Up</span>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-bold cursor-pointer hover:bg-[#ff5f57] hover:text-white px-2 py-1 rounded transition-colors"
                  style={{ color: '#0050cd' }}
                  title="Clear all messages"
                >
                  Clear All
                </button>
              )}
              <span className="text-xs font-bold text-gray-700">{user?.email || 'Signed in'}</span>
              <button
                onClick={handleSignOut}
                className="text-xs font-bold cursor-pointer hover:bg-[#ff5f57] hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                style={{ color: '#0050cd' }}
                title="Sign out"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          </SignedIn>
        </div>
        <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'repeating-linear-gradient(to right, #f5f5f5, #f5f5f5 2px, #ffffff 2px, #ffffff 4px)' }}>
          {!isLoaded ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : !isSignedIn ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-gray-600 text-center">Please sign in to use ChatGPT</p>
              <div className="flex gap-2">
                <SignInButton>
                  <button className="px-4 py-2 text-white rounded hover:brightness-90 shadow-sm" style={{ background: 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', border: '1px solid #1e4a8a' }}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="px-4 py-2 text-white rounded hover:brightness-90 shadow-sm" style={{ background: 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', border: '1px solid #1e4a8a' }}>
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                  onMouseEnter={() => setHoveredMessageIndex(idx)}
                  onMouseLeave={() => setHoveredMessageIndex(null)}
                >
                  <div className="relative">
                    <div
                      className={`rounded-2xl px-3 py-2 shadow-sm ${
                        msg.role === 'user'
                          ? 'text-white rounded-tr-none'
                          : 'bg-white border border-[#b4b4b4] rounded-tl-none max-w-[90%]'
                      }`}
                      style={{ 
                        ...(msg.role === 'user' ? { 
                          background: 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', 
                          border: '1px solid #1e4a8a',
                          display: 'inline-block'
                        } : {
                          display: 'inline-block',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '90%'
                        })
                      }}
                    >
                      <div className="text-sm" style={{ 
                        color: msg.role === 'user' ? 'white' : '#1f2937', 
                        whiteSpace: msg.role === 'user' ? 'pre' : 'pre-wrap',
                        wordBreak: msg.role === 'user' ? 'keep-all' : 'break-word',
                        overflowWrap: msg.role === 'user' ? 'normal' : 'break-word'
                      }}>
                        {msg.role === 'user' ? (
                          <span>{msg.content}</span>
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p style={{ marginBottom: '0.25rem', marginTop: 0, lineHeight: '1.4', display: 'inline' }} className="last:mb-0">{children}</p>,
                            code: ({ inline, children, ...props }) => {
                              if (inline) {
                                return (
                                  <code 
                                    style={{ 
                                      padding: '0.125rem 0.25rem',
                                      borderRadius: '0.25rem',
                                      fontSize: '0.75rem',
                                      fontFamily: 'monospace',
                                      backgroundColor: msg.role === 'user' ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
                                      color: msg.role === 'user' ? '#e0e7ff' : '#1e293b'
                                    }}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <code 
                                  style={{ 
                                    display: 'block',
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                    overflowX: 'auto',
                                    backgroundColor: msg.role === 'user' ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
                                    color: msg.role === 'user' ? '#e0e7ff' : '#1e293b',
                                    marginBottom: '0.5rem'
                                  }}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => (
                              <pre style={{ marginBottom: '0.5rem', marginTop: 0, borderRadius: '0.25rem', overflowX: 'auto' }}>{children}</pre>
                            ),
                            ul: ({ children }) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '0.5rem', marginTop: 0 }}>{children}</ul>,
                            ol: ({ children }) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', marginBottom: '0.5rem', marginTop: 0 }}>{children}</ol>,
                            li: ({ children }) => <li style={{ marginBottom: '0.25rem' }}>{children}</li>,
                            h1: ({ children }) => <h1 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>{children}</h1>,
                            h2: ({ children }) => <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>{children}</h2>,
                            h3: ({ children }) => <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote style={{ 
                                borderLeft: `2px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.3)' : '#d1d5db'}`,
                                paddingLeft: '0.75rem',
                                fontStyle: 'italic',
                                margin: '0.5rem 0'
                              }}>
                                {children}
                              </blockquote>
                            ),
                            a: ({ children, href }) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                  textDecoration: 'underline',
                                  color: msg.role === 'user' ? '#a3c2ff' : '#3875d7'
                                }}
                                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                              >
                                {children}
                              </a>
                            ),
                            strong: ({ children }) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
                            em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                            hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.3)' : '#d1d5db'}`, margin: '0.75rem 0' }} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                        )}
                      </div>
                    </div>
                    {hoveredMessageIndex === idx && idx > 0 && (
                      <button
                        onClick={() => handleDeleteMessage(idx)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-sm flex items-center justify-center hover:brightness-90 transition-colors"
                        title="Delete message"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white border border-[#b4b4b4] rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                    <span className="text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <SignedIn>
          <div className="border-t border-[#b4b4b4] p-4 flex gap-3" style={{ background: '#f6f6f6' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 border border-[#b4b4b4] rounded focus:outline-none focus:ring-2 shadow-sm placeholder:text-gray-400"
              style={{ 
                background: 'white', 
                color: '#1f2937',
                caretColor: '#3875d7'
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
              className="px-5 py-2.5 text-white rounded shadow-sm hover:brightness-90 disabled:bg-[#c8c8c8] disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: !inputMessage.trim() || isLoading ? '#c8c8c8' : 'linear-gradient(to bottom, #3875d7 0%, #2a5db0 100%)', border: !inputMessage.trim() || isLoading ? '1px solid #b4b4b4' : '1px solid #1e4a8a' }}
            >
              <Send size={16} />
            </button>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

const IPodApp = () => (
  <div className="h-full flex items-center justify-center bg-[#d1d5db]">
     <div className="w-[240px] h-[380px] bg-gradient-to-b from-gray-100 to-gray-300 rounded-[20px] shadow-xl border border-gray-400 p-4 flex flex-col relative">
        <div className="h-32 bg-[#ccdfc1] rounded border-2 border-gray-400 shadow-inner p-2 font-mono text-xs flex flex-col relative overflow-hidden">
             <div className="flex-1 flex flex-col items-center justify-center text-[#3d4839]">
               <div className="font-bold text-sm">Tiramisu</div>
               <div className="text-xs">Don Toliver</div>
            </div>
        </div>
        <div className="flex-1 flex items-center justify-center mt-4">
           <div className="w-40 h-40 rounded-full bg-white shadow-md relative flex items-center justify-center border border-gray-200">
              <div className="absolute top-4 text-[10px] font-bold text-gray-400">MENU</div>
              <div className="w-14 h-14 rounded-full bg-gray-200 shadow-inner"></div>
           </div>
        </div>
     </div>
  </div>
);

// --- Main ---
export default function App() {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [maxZ, setMaxZ] = useState(10);

  // Center helper
  const getCenteredPos = (w, h) => ({ x: (window.innerWidth / 2) - (w / 2), y: (window.innerHeight / 2) - (h / 2) });

  const toggleWindow = (id, type, title, w=400, h=300) => {
    setWindows(prev => {
      const existing = prev.find(win => win.id === id);
      if (existing) {
        if (existing.isOpen) { setActiveWindowId(id); return prev.map(win => win.id === id ? {...win, z: maxZ + 1} : win); }
        const center = getCenteredPos(w, h);
        return prev.map(win => win.id === id ? { ...win, isOpen: true, x: center.x, y: center.y, z: maxZ + 1 } : win);
      }
      const center = getCenteredPos(w, h);
      return [...prev, { id, title, type, isOpen: true, x: center.x, y: center.y, width: w, height: h, z: maxZ + 1 }];
    });
    setMaxZ(prev => prev + 1);
    setActiveWindowId(id);
  };

  const closeWindow = (id) => setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none font-sans" 
         style={{
           // Classic Aqua Blue Wallpaper
           background: `radial-gradient(circle at 50% 30%, #5498db 0%, #3879c2 40%, #1e5799 100%)`
         }}>
      
      {/* Global Definitions */}
      <GlobalSVGDefs />
      
      {/* Wallpaper Waves */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0.05) 40%)',
        backgroundSize: '100% 150px'
      }}></div>
      <MenuBar />

      <div className="absolute top-12 right-6 flex flex-col gap-2 items-end z-0">
        <div onClick={() => toggleWindow('finder-main', 'finder', 'Macintosh HD')}><HardDriveIcon /></div>
        <div onClick={() => toggleWindow('ipod', 'ipod', 'iPod', 280, 450)}><IpodDesktopIcon /></div>
      </div>

      <div className="absolute inset-0 top-7 bottom-24 pointer-events-none">
        {windows.map(win => win.isOpen && (
          <div key={win.id} className="pointer-events-auto relative w-full h-full">
            <Window {...win} zIndex={win.z} isActive={activeWindowId === win.id} onFocus={() => {setActiveWindowId(win.id); setMaxZ(maxZ+1)}} onClose={closeWindow}>
              {win.type === 'finder' && <FinderGrid />}
              {win.type === 'trash' && <TrashGrid />}
              {win.type === 'chat' && <ChatApp />}
              {win.type === 'ipod' && <IPodApp />}
            </Window>
          </div>
        ))}
      </div>

      {/* 2D Aqua Dock */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center z-[100] overflow-visible pointer-events-none h-24">
        <div className="pointer-events-auto relative flex items-end justify-center">
            <div className="relative h-[80px] w-auto min-w-full rounded-t-lg border-t border-white/40 bg-white/30 backdrop-blur-sm shadow-2xl z-0 flex items-center justify-center px-6 py-3 overflow-visible">
                 {/* Pinstripes */}
                 <div className="absolute inset-0 opacity-20 rounded-t-lg" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.8) 1px, rgba(255,255,255,0.8) 2px)' }}></div>
                 <div className="relative z-20 flex gap-4 items-center">
                    <DockItem icon={FinderIcon} label="Finder" onClick={() => toggleWindow('finder-main', 'finder', 'Macintosh HD')} isOpen={windows.find(w => w.id === 'finder-main')?.isOpen || false} />
                    <DockItem icon={AOLIcon} label="ChatGPT" onClick={() => toggleWindow('chat', 'chat', 'ChatGPT', 500, 350)} isOpen={windows.find(w => w.id === 'chat')?.isOpen} />
                    <DockItem icon={IEIcon} label="Internet Explorer" tooltipOverride="Internet Explorer" onClick={() => {}} isOpen={false} />
                    <DockItem icon={AppsIcon} label="Applications" onClick={() => toggleWindow('finder-apps', 'finder', 'Applications')} isOpen={windows.find(w => w.id === 'finder-apps')?.isOpen} />
                    <div className="w-[1px] h-12 bg-black/10 mx-2 self-center border-r border-white/30"></div> 
                    <DockItem icon={TrashIcon} label="Trash" onClick={() => toggleWindow('trash', 'trash', 'Trash')} isOpen={windows.find(w => w.id === 'trash')?.isOpen || false} />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}

