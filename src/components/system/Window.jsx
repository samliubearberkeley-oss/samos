import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TrafficLights = ({ onClose }) => (
  <div className="flex gap-2 ml-2" onMouseDown={(e) => e.stopPropagation()}>
    <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-inner border border-[#e0443e] cursor-pointer hover:brightness-90 flex items-center justify-center" onClick={onClose}></div>
    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner border border-[#e1a11d]"></div>
    <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner border border-[#1aab29]"></div>
  </div>
);

export const Window = ({ id, title, x, y, width, height, zIndex, isActive, onClose, onFocus, children, type }) => {
  const [pos, setPos] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseDown = (e) => {
    onFocus(id);
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleTouchStart = (e) => {
    onFocus(id);
    // Check if touch target is an interactive element (button, input, etc.)
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.no-drag')) {
      return;
    }
    setIsDragging(true);
    const touch = e.touches[0];
    dragOffset.current = { x: touch.clientX - pos.x, y: touch.clientY - pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    
    // Separate touch move handler to prevent scrolling while dragging
    const handleTouchMove = (e) => {
      if (isDragging) {
        e.preventDefault(); // Prevent scrolling while dragging window
        const touch = e.touches[0];
        setPos({ x: touch.clientX - dragOffset.current.x, y: touch.clientY - dragOffset.current.y });
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, pos]);

  const titleBarGradient = `linear-gradient(to bottom, #e6e6e6 0%, #dcdcdc 50%, #c8c8c8 50%, #b4b4b4 100%)`;
  const pinstripe = `repeating-linear-gradient(to right, #f5f5f5, #f5f5f5 2px, #ffffff 2px, #ffffff 4px)`;

  // Mobile responsive dimensions
  // For mobile: leave space for menu bar (28px) and dock (70px) = 98px total
  // Add some padding: top 36px, bottom 78px = 114px total
  const mobileWidth = isMobile ? Math.min(width, window.innerWidth - 16) : width;
  const mobileHeight = isMobile ? Math.min(height, window.innerHeight - 114) : height;
  const mobileX = isMobile ? Math.max(8, (window.innerWidth - mobileWidth) / 2) : pos.x;
  const mobileY = isMobile ? 36 : pos.y;

  return (
    <div
      style={{ 
        left: mobileX, 
        top: mobileY, 
        width: mobileWidth, 
        height: mobileHeight, 
        zIndex, 
        position: 'absolute',
        maxWidth: isMobile ? 'calc(100vw - 16px)' : 'none',
        maxHeight: isMobile ? 'calc(100vh - 114px)' : 'none'
      }}
      className={`flex flex-col shadow-2xl overflow-hidden ${isActive ? 'shadow-black/30' : 'shadow-black/10'} ${type === 'ipod' ? 'rounded-2xl' : 'rounded-t-lg rounded-b'}`}
      onMouseDown={() => onFocus(id)}
      onTouchStart={handleTouchStart}
    >
      <div className={`h-7 md:h-7 flex items-center justify-between px-2 select-none border-b border-gray-400 ${type === 'ipod' ? 'rounded-t-2xl' : ''} cursor-move`} style={{ background: titleBarGradient }} onMouseDown={handleMouseDown}>
        <TrafficLights onClose={() => onClose(id)} />
        <span className="text-xs md:text-sm font-semibold text-gray-700 shadow-sm truncate flex-1 px-2">{title}</span>
        <div className="w-12"></div>
      </div>
      {type === 'finder' && (
        <div className="h-10 bg-[#ececec] border-b border-gray-300 flex items-center px-3 gap-4">
           <div className="flex gap-1"><ChevronLeft size={16} className="text-gray-400" /><ChevronRight size={16} className="text-gray-400" /></div>
           <div className="flex-1 bg-white border border-gray-300 rounded-sm h-6 flex items-center px-2"><span className="text-xs text-gray-500">/</span></div>
        </div>
      )}
      <div className={`flex-1 relative ${type === 'ipod' ? 'overflow-hidden rounded-b-2xl' : 'overflow-y-auto overflow-x-hidden'}`} style={{ background: type === 'ipod' ? 'transparent' : pinstripe }}>
        {children}
      </div>
    </div>
  );
};

