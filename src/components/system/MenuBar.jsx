import React, { useState, useEffect, useRef } from 'react';
import { Check, Volume2 } from 'lucide-react';
import { VolumeControl } from './VolumeControl';
import { IconImage } from '../icons/DockIcons';

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

export const MenuBar = ({ volume, setVolume }) => {
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
    <div className="absolute top-7 left-0 bg-[#f0f0f0] border border-[#b4b4b4] shadow-[0_8px_20px_rgba(0,0,0,0.3)] rounded-b-lg min-w-[220px] py-1 z-[99999]">
      {/* Pinstripe Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] z-0" 
           style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #000, #000 1px, transparent 1px, transparent 3px)' }}>
      </div>
      
      <div className="relative z-10">
        {items.map((item, idx) => {
          if (item.label === 'separator') return <div key={idx} className="h-[1px] bg-[#d4d4d4] my-1 mx-3" />;
          return (
            <div key={idx} className={`px-5 py-0.5 text-[13px] font-medium flex items-center justify-between hover:bg-[#3875d7] hover:text-white cursor-pointer group ${item.disabled ? 'text-gray-400 hover:bg-transparent hover:text-gray-400 cursor-default' : 'text-black'}`}>
              <div className="flex items-center gap-3">
                <div className="w-4 flex justify-center">
                   {item.icon === 'app' && <div className="w-3.5 h-3.5 bg-[#60a5fa] rounded-[2px] shadow-sm" />}
                   {item.icon === 'doc' && <div className="w-3.5 h-3.5 bg-[#d1d5db] rounded-[2px] shadow-sm" />}
                   {item.icon === 'trash' && <div className="w-3.5 h-3.5 bg-[#9ca3af] rounded-full shadow-sm" />}
                </div>
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.check && <Check size={12} strokeWidth={4} className="text-black group-hover:text-white ml-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div 
      className="h-7 md:h-7 border-b border-[#b4b4b4] flex items-center justify-between px-2 md:px-4 fixed top-0 w-full z-[99997] shadow-sm text-xs md:text-sm select-none font-sans" 
      style={{
        background: `repeating-linear-gradient(to right, #f6f6f6, #f6f6f6 2px, #e0e0e0 2px, #e0e0e0 4px)`,
        backgroundImage: `linear-gradient(to bottom, #f6f6f6, #e0e0e0), repeating-linear-gradient(to right, #f6f6f6, #f6f6f6 2px, #e0e0e0 2px, #e0e0e0 4px)`,
        position: 'fixed'
      }}
      ref={menuRef}
    >
      <div className="flex items-center gap-1 md:gap-2">
        <div className="flex items-center justify-center -ml-2 md:-ml-4 -mr-1 md:-mr-2 flex-shrink-0" style={{ height: '3.125rem', width: 'auto', aspectRatio: '1' }}>
          <IconImage 
            src="/icons/apple-icon.png" 
            alt="Apple"
            eager={true}
          />
        </div>
        {['File', 'Edit', 'View', 'Go', 'Help'].map(menu => (
          <div key={menu} className="relative flex-shrink-0 h-full flex items-center" style={{ zIndex: activeMenu === menu ? 99999 : 'auto' }}>
            <span 
              className={`text-gray-800 px-2.5 py-0.5 rounded-md text-[13px] font-medium cursor-default transition-colors duration-100 ${activeMenu === menu ? 'bg-[#3875d7] text-white shadow-sm' : 'hover:bg-black/5'}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === menu ? null : menu);
              }}
              onMouseEnter={() => {
                 if (activeMenu) setActiveMenu(menu);
              }}
            >{menu}</span>
            {activeMenu === menu && renderMenu(MENU_ITEMS[menu.toLowerCase()])}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="relative" ref={volRef}>
           <Volume2 size={16} className="text-gray-700 cursor-pointer hover:text-black min-w-[20px] min-h-[20px]" onClick={() => setShowVolume(!showVolume)}/>
           {showVolume && <VolumeControl volume={volume} setVolume={setVolume} />}
        </div>
        <span className="text-[10px] md:text-xs font-medium text-gray-700 whitespace-nowrap hidden sm:inline">{formatTime(currentTime)}</span>
      </div>
    </div>
  );
};

