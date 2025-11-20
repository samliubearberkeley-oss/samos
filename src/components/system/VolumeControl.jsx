import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings } from 'lucide-react';

export const VolumeControl = ({ volume, setVolume }) => {
  const volumeBarRef = useRef(null);
  const isDraggingVolumeRef = useRef(false);
  const animationFrameRef = useRef(null);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  
  // Update volume based on mouse/touch position
  const updateVolume = useCallback((e, immediate = false) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const clickY = clientY - rect.top;
    // Calculate percentage from bottom (0% = bottom, 100% = top)
    const percentage = Math.max(0, Math.min(100, 100 - (clickY / rect.height) * 100));
    
    const updateUI = () => {
      setVolume(percentage);
    };
    
    if (immediate || !isDraggingVolumeRef.current) {
      updateUI();
    } else {
      // Use requestAnimationFrame for smooth dragging
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateUI);
    }
  }, [setVolume]);
  
  const handleVolumeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingVolumeRef.current = true;
    setIsDraggingVolume(true);
    updateVolume(e, true);
  }, [updateVolume]);
  
  // Global mouse/touch event listeners for volume dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingVolumeRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      updateVolume(e, false);
    };
    
    const handleMouseUp = (e) => {
      if (isDraggingVolumeRef.current) {
        e.preventDefault();
        e.stopPropagation();
        
        // Final update
        if (volumeBarRef.current) {
          const rect = volumeBarRef.current.getBoundingClientRect();
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          const clickY = clientY - rect.top;
          const percentage = Math.max(0, Math.min(100, 100 - (clickY / rect.height) * 100));
          setVolume(percentage);
        }
        
        isDraggingVolumeRef.current = false;
        setIsDraggingVolume(false);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp, { passive: false });
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp, { passive: false });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateVolume, setVolume]);
  
  const handleVolumeClick = useCallback((e) => {
    if (!isDraggingVolumeRef.current) {
      updateVolume(e, true);
    }
  }, [updateVolume]);
  
  return (
    <div className="absolute top-7 left-1/2 -translate-x-1/2 w-8 h-32 bg-[#f2f2f2] border border-[#b4b4b4] shadow-lg rounded-b-sm flex flex-col items-center justify-between py-2 z-[100]"
         style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)' }}>
       <div 
         ref={volumeBarRef}
         className="w-1 h-20 bg-gray-300 rounded-full relative shadow-inner cursor-pointer group mx-auto"
         onMouseDown={handleVolumeStart}
         onTouchStart={handleVolumeStart}
         onClick={handleVolumeClick}
         style={{ 
           background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)'
         }}
       >
          {/* Volume fill indicator */}
          <div 
            className="absolute bottom-0 left-0 w-full rounded-full"
            style={{ 
              height: `${volume}%`,
              background: 'linear-gradient(to top, #5c94fa 0%, #2668e3 100%)',
              transition: isDraggingVolume ? 'none' : 'height 0.1s ease-out',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          ></div>
          {/* Drag handle - center aligned to fill top */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 rounded-full cursor-grab active:cursor-grabbing transition-all z-10 ${
              isDraggingVolume ? 'opacity-100 w-3.5 h-3.5 shadow-md' : 'opacity-0 group-hover:opacity-100 w-3 h-3 shadow-sm'
            }`}
            style={{ 
              bottom: `calc(${volume}% - ${isDraggingVolume ? '7px' : '6px'})`,
              background: 'linear-gradient(to bottom, #5c94fa 0%, #2668e3 100%)',
              border: '2px solid white',
              boxShadow: isDraggingVolume 
                ? '0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(92,148,250,0.5)' 
                : '0 1px 2px rgba(0,0,0,0.2)',
              transition: isDraggingVolume 
                ? 'opacity 0.1s ease-out, box-shadow 0.1s ease-out' 
                : 'bottom 0.1s ease-out, opacity 0.2s ease-out, width 0.2s ease-out, height 0.2s ease-out, box-shadow 0.2s ease-out'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleVolumeStart(e);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleVolumeStart(e);
            }}
          ></div>
       </div>
       <div className="flex items-center justify-center w-full">
         <Settings size={12} className="text-gray-600" />
       </div>
    </div>
  );
}

