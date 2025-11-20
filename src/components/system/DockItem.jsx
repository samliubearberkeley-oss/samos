import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const DockItem = ({ icon: Icon, label, onClick, bounce, isOpen, tooltipOverride }) => {
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

