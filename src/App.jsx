import React, { useState } from 'react';
import { GlobalSVGDefs } from './components/system/GlobalSVGDefs';
import { MenuBar } from './components/system/MenuBar';
import { DockItem } from './components/system/DockItem';
import { Window } from './components/system/Window';
import { FinderGrid } from './components/apps/Finder';
import { TrashGrid } from './components/apps/Trash';
import { ChatApp } from './components/apps/ChatApp';
import { IPodApp } from './components/apps/IPodApp';
import { HardDriveIcon, IpodDesktopIcon } from './components/icons/DesktopIcons';
import { FinderIcon, AOLIcon, IEIcon, AppsIcon, TrashIcon } from './components/icons/DockIcons';

export default function App() {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [maxZ, setMaxZ] = useState(10);
  const [globalVolume, setGlobalVolume] = useState(70); // Global volume state
  
  // Ensure window z-index never exceeds dock z-index (dock is 99999)
  const MAX_WINDOW_Z = 9998;

  // Center helper
  const getCenteredPos = (w, h) => ({ x: (window.innerWidth / 2) - (w / 2), y: (window.innerHeight / 2) - (h / 2) });

  const toggleWindow = (id, type, title, w=400, h=300) => {
    setWindows(prev => {
      const existing = prev.find(win => win.id === id);
      const newZ = Math.min(maxZ + 1, MAX_WINDOW_Z);
      if (existing) {
        if (existing.isOpen) { setActiveWindowId(id); return prev.map(win => win.id === id ? {...win, z: newZ} : win); }
        // Recalculate center if re-opening
        const isSmallScreen = window.innerWidth <= 768;
        const baseCenter = getCenteredPos(w, h);
        // Add offset for mobile if there are other open windows to avoid exact overlap
        const openWindowsCount = prev.filter(win => win.isOpen).length;
        const offset = isSmallScreen ? (openWindowsCount * 20) : 0;
        
        const finalX = baseCenter.x + offset;
        const finalY = baseCenter.y + offset;
        
        return prev.map(win => win.id === id ? { ...win, isOpen: true, x: finalX, y: finalY, z: newZ } : win);
      }
      
      const isSmallScreen = window.innerWidth <= 768;
      const baseCenter = getCenteredPos(w, h);
      const openWindowsCount = prev.filter(win => win.isOpen).length;
      const offset = isSmallScreen ? (openWindowsCount * 20) : 0;
      const finalX = baseCenter.x + offset;
      const finalY = baseCenter.y + offset;
      
      return [...prev, { id, title, type, isOpen: true, x: finalX, y: finalY, width: w, height: h, z: newZ }];
    });
    setMaxZ(prev => Math.min(prev + 1, MAX_WINDOW_Z));
    setActiveWindowId(id);
  };

  const closeWindow = (id) => setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none font-sans" 
         style={{
           backgroundImage: 'url(/wallpaper.jpg)',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat',
           backgroundAttachment: 'fixed'
         }}>
      
      {/* Global Definitions */}
      <GlobalSVGDefs />
      <MenuBar volume={globalVolume} setVolume={setGlobalVolume} />

      {/* Desktop Icons - Lower z-index so windows appear above them */}
      <div className="absolute top-12 md:top-12 right-4 md:right-6 flex flex-col gap-2 items-end z-[10] pointer-events-auto">
        <div onClick={() => toggleWindow('finder-main', 'finder', 'Macintosh HD')} className="cursor-pointer"><HardDriveIcon /></div>
        <div onClick={() => toggleWindow('ipod', 'ipod', 'iPod', 320, 508)} className="cursor-pointer"><IpodDesktopIcon /></div>
      </div>

      {/* Windows Container - Ensure it doesn't overlap dock */}
      <div className="absolute inset-0 top-7 pb-[70px] md:pb-[80px] pointer-events-none">
        {windows.map(win => win.isOpen && (
          <div key={win.id} className="pointer-events-auto relative w-full h-full">
            <Window {...win} zIndex={Math.min(win.z, MAX_WINDOW_Z)} isActive={activeWindowId === win.id} onFocus={() => {setActiveWindowId(win.id); setMaxZ(prev => Math.min(prev + 1, MAX_WINDOW_Z))}} onClose={closeWindow}>
              {win.type === 'finder' && <FinderGrid />}
              {win.type === 'trash' && <TrashGrid />}
              {win.type === 'chat' && <ChatApp />}
              {win.type === 'ipod' && <IPodApp globalVolume={globalVolume} />}
            </Window>
          </div>
        ))}
      </div>

      {/* 2D Aqua Dock - Fixed at bottom, always visible, highest z-index */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-[99999] pointer-events-none" style={{ position: 'fixed', bottom: 0, width: '100%' }}>
        <div className="pointer-events-auto relative flex items-end justify-center pb-0 w-full max-w-full">
            <div className="relative h-[70px] md:h-[80px] w-auto min-w-fit max-w-full rounded-t-lg border-t border-white/40 bg-white/30 backdrop-blur-sm shadow-2xl flex items-center justify-center px-3 md:px-6 py-2 md:py-3 overflow-visible">
                 {/* Pinstripes */}
                 <div className="absolute inset-0 opacity-20 rounded-t-lg" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.8) 1px, rgba(255,255,255,0.8) 2px)' }}></div>
                 <div className="relative z-20 flex gap-2 md:gap-4 items-center">
                    <DockItem icon={FinderIcon} label="Finder" onClick={() => toggleWindow('finder-main', 'finder', 'Macintosh HD')} isOpen={windows.find(w => w.id === 'finder-main')?.isOpen || false} />
                    <DockItem icon={AOLIcon} label="ChatGPT" onClick={() => toggleWindow('chat', 'chat', 'ChatGPT', 500, 350)} isOpen={windows.find(w => w.id === 'chat')?.isOpen} />
                    <DockItem icon={IEIcon} label="Internet Explorer" tooltipOverride="Internet Explorer" onClick={() => {}} isOpen={false} />
                    <DockItem icon={AppsIcon} label="Applications" onClick={() => toggleWindow('finder-apps', 'finder', 'Applications')} isOpen={windows.find(w => w.id === 'finder-apps')?.isOpen} />
                    <div className="w-[1px] h-10 md:h-12 bg-black/10 mx-1 md:mx-2 self-center border-r border-white/30"></div> 
                    <DockItem icon={TrashIcon} label="Trash" onClick={() => toggleWindow('trash', 'trash', 'Trash')} isOpen={windows.find(w => w.id === 'trash')?.isOpen || false} />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
