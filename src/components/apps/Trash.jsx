import React from 'react';
import { TrashIcon } from '../icons/DockIcons';

export const TrashGrid = () => {
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

