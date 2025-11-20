import React from 'react';
import { AppletsIcon } from '../icons/AppletsIcon';
import { 
  AppsFolderIcon, 
  DesktopFolderIcon, 
  DocumentsFolderIcon, 
  PicturesFolderIcon, 
  MusicFolderIcon, 
  SitesFolderIcon, 
  VideosFolderIcon 
} from '../icons/FolderIcons';

// --- Finder Content Grid with Specific Icons ---
export const FinderGrid = () => {
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

