import React from 'react';
import { IconImage } from './DockIcons';

export const HardDriveIcon = () => (
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

export const IpodDesktopIcon = () => (
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

