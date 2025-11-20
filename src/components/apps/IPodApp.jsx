import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, FastForward, Rewind, Music, ChevronRight } from 'lucide-react';

// --- iPod Assets & Data ---
const SONGS = [
  { title: 'LUV SIC', artist: 'Nujabes', album: 'Modal Soul', duration: 274, coverColor: 'bg-purple-800', audioSrc: '/audio/NUJABES_-_LUV_SIC.mp3' },
  { title: 'Tiramisu', artist: 'Don Toliver', album: 'Life of a Don', duration: 180, coverColor: 'bg-emerald-700', audioSrc: null },
  { title: 'Less Than Zero', artist: 'The Weeknd', album: 'Dawn FM', duration: 213, coverColor: 'bg-blue-800', audioSrc: null },
  { title: 'Instant Crush', artist: 'Daft Punk', album: 'RAM', duration: 337, coverColor: 'bg-slate-800', audioSrc: null },
  { title: 'Nights', artist: 'Frank Ocean', album: 'Blonde', duration: 307, coverColor: 'bg-black', audioSrc: null },
];

const IPOD_MENU_ITEMS = [
  { id: 'music', label: 'Music', hasSub: true },
  { id: 'extras', label: 'Extras', hasSub: true },
  { id: 'settings', label: 'Settings', hasSub: true },
  { id: 'shuffle', label: 'Shuffle Songs', hasSub: false },
  { id: 'nowplaying', label: 'Now Playing', hasSub: false },
];

export const IPodApp = ({ globalVolume }) => {
  const [view, setView] = useState('nowplaying'); // 'menu', 'nowplaying'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIdx, setCurrentSongIdx] = useState(0);
  const [progress, setProgress] = useState(0); // % progress
  const [volume, setVolume] = useState(60); // % volume (local for iPod wheel control display)
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPlayTime, setCurrentPlayTime] = useState(0); // current playback time in seconds
  const [isDraggingProgress, setIsDraggingProgress] = useState(false); // for UI feedback
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Audio ref
  const audioRef = useRef(null);
  
  // Track window width for responsive calculations
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Wheel Logic Refs
  const wheelRef = useRef(null);
  const angleRef = useRef(0);
  const isDraggingRef = useRef(false);
  
  // Progress bar drag refs
  const progressBarRef = useRef(null);
  const isDraggingProgressRef = useRef(false);
  const animationFrameRef = useRef(null);
  const dragProgressRef = useRef(0); // Store progress during drag for smooth updates
  
  // Handle progress bar click/drag - optimized for smooth dragging
  const updateProgress = useCallback((e, immediate = false) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    
    dragProgressRef.current = percentage;
    
    const currentSong = SONGS[currentSongIdx];
    
    // Use requestAnimationFrame for smooth updates during drag
    const updateUI = () => {
      if (audioRef.current && currentSong.audioSrc) {
        const duration = audioRef.current.duration || currentSong.duration;
        const newTime = (percentage / 100) * duration;
        // Only update audio time when dragging ends or immediately on click
        if (immediate || !isDraggingProgressRef.current) {
          audioRef.current.currentTime = newTime;
        }
        setCurrentPlayTime(newTime);
        setProgress(percentage);
      } else if (currentSong.duration) {
        const newTime = (percentage / 100) * currentSong.duration;
        setCurrentPlayTime(newTime);
        setProgress(percentage);
      }
    };
    
    if (immediate || !isDraggingProgressRef.current) {
      updateUI();
    } else {
      // Use requestAnimationFrame for smooth dragging
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateUI);
    }
  }, [currentSongIdx]);
  
  const handleProgressBarStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingProgressRef.current = true;
    setIsDraggingProgress(true);
    updateProgress(e, true); // Immediate update on start
  }, [updateProgress]);
  
  // Add global mouse/touch event listeners for progress bar dragging - optimized
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingProgressRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      updateProgress(e, false); // Smooth update during drag
    };
    
    const handleMouseUp = (e) => {
      if (isDraggingProgressRef.current) {
        e.preventDefault();
        e.stopPropagation();
        
        // Final update with immediate audio seek
        if (progressBarRef.current) {
          const rect = progressBarRef.current.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clickX = clientX - rect.left;
          const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
          
          const currentSong = SONGS[currentSongIdx];
          if (audioRef.current && currentSong.audioSrc) {
            const duration = audioRef.current.duration || currentSong.duration;
            const newTime = (percentage / 100) * duration;
            audioRef.current.currentTime = newTime;
            setCurrentPlayTime(newTime);
            setProgress(percentage);
          }
        }
        
        isDraggingProgressRef.current = false;
        setIsDraggingProgress(false);
        
        // Cancel any pending animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };
    
    // Always add listeners, they check the ref internally
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
  }, [updateProgress, currentSongIdx]);
  
  // Handle click on progress bar (when not dragging)
  const handleProgressBarClick = useCallback((e) => {
    if (!isDraggingProgressRef.current) {
      updateProgress(e, true); // Immediate update on click
    }
  }, [updateProgress]);

  // Initialize and manage audio element when song changes
  useEffect(() => {
    const currentSong = SONGS[currentSongIdx];
    
    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Initialize new audio if song has audio source
    if (currentSong.audioSrc) {
      audioRef.current = new Audio(currentSong.audioSrc);
      audioRef.current.volume = (globalVolume || volume) / 100;
      
      const timeUpdateHandler = () => {
        if (audioRef.current) {
          const current = audioRef.current.currentTime;
          const duration = audioRef.current.duration || currentSong.duration;
          setCurrentPlayTime(current);
          setProgress((current / duration) * 100);
        }
      };
      
      const endedHandler = () => {
        // Auto play next song
        setCurrentSongIdx((prev) => (prev + 1) % SONGS.length);
        setProgress(0);
        setCurrentPlayTime(0);
      };
      
      audioRef.current.addEventListener('timeupdate', timeUpdateHandler);
      audioRef.current.addEventListener('ended', endedHandler);
      
      // Load the audio
      audioRef.current.load();
      setCurrentPlayTime(0);
      setProgress(0);
    } else {
      // No audio file, reset progress
      setCurrentPlayTime(0);
      setProgress(0);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentSongIdx]);
  
  // Handle play/pause
  useEffect(() => {
    if (audioRef.current && SONGS[currentSongIdx].audioSrc) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Playback failed:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSongIdx]);
  
  // Update volume - use global volume if available, otherwise use local volume
  useEffect(() => {
    if (audioRef.current) {
      const effectiveVolume = globalVolume !== undefined ? globalVolume : volume;
      audioRef.current.volume = effectiveVolume / 100;
    }
  }, [volume, globalVolume]);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  

  // Format time for display
  const formatDisplayTime = (date) => {
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  };

  // --- Click Wheel Logic ---
  const handleWheelStart = (e) => {
    isDraggingRef.current = true;
    updateAngle(e);
  };

  const handleWheelMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault(); // Prevent page scroll on mobile
    
    const prevAngle = angleRef.current;
    updateAngle(e);
    const newAngle = angleRef.current;
    
    let delta = newAngle - prevAngle;
    // Handle wrap-around (0 to 360)
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    // Sensitivity threshold
    if (Math.abs(delta) > 15) {
      const direction = delta > 0 ? 1 : -1; // 1 = clockwise (down/vol up), -1 = counter (up/vol down)
      handleScroll(direction);
    }
  };

  const handleWheelEnd = () => {
    isDraggingRef.current = false;
  };

  const updateAngle = (e) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    const rad = Math.atan2(y, x);
    let deg = rad * (180 / Math.PI);
    if (deg < 0) deg += 360;
    
    angleRef.current = deg;
  };

  const handleScroll = (direction) => {
    if (view === 'menu') {
      setSelectedIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return IPOD_MENU_ITEMS.length - 1;
        if (next >= IPOD_MENU_ITEMS.length) return 0;
        return next;
      });
    } else if (view === 'nowplaying') {
      setVolume((prev) => {
        const next = prev + (direction * 2); // 2% increments
        return Math.min(100, Math.max(0, next));
      });
    }
  };

  // --- Button Handlers ---
  const handleMenuClick = () => {
    setView((prev) => (prev === 'nowplaying' ? 'menu' : 'menu')); // Simplified nav
  };

  const handleCenterClick = () => {
    if (view === 'menu') {
      const item = IPOD_MENU_ITEMS[selectedIndex];
      if (item.id === 'nowplaying') {
        setView('nowplaying');
      } else {
        // Simulate entering a submenu (just flash for demo)
      }
    } else {
      // In Now Playing, toggle play (or maybe toggle display mode in real ipod, but play is intuitive)
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSongIdx((prev) => (prev + 1) % SONGS.length);
    setProgress(0);
    setCurrentPlayTime(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSongIdx((prev) => (prev - 1 + SONGS.length) % SONGS.length);
    setProgress(0);
    setCurrentPlayTime(0);
    setIsPlaying(true);
  };

  // --- Effects ---
  useEffect(() => {
    if (isDraggingRef.current) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, []);

  const currentSong = SONGS[currentSongIdx];

  // Helper: Format Time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate button positions based on wheel ring geometry
  // Wheel outer diameter: 176px (mobile) or 192px (desktop) = 11rem or 12rem
  // Center button diameter: 64px = 4rem (w-16 h-16)
  // Ring centerline radius = (outerRadius + innerRadius) / 2
  const buttonPositions = useMemo(() => {
    const isMobile = windowWidth <= 768;
    const wheelSize = isMobile ? 176 : 192; // px
    const centerButtonSize = 64; // px (w-16 h-16)
    const wheelRadius = wheelSize / 2; // 88px or 96px
    const centerButtonRadius = centerButtonSize / 2; // 32px
    const innerRadius = centerButtonRadius; // 32px
    const outerRadius = wheelRadius; // 88px or 96px
    // Ring centerline: middle of the ring (where buttons should be placed)
    const ringCenterlineRadius = (innerRadius + outerRadius) / 2; // 60px (mobile) or 64px (desktop)
    
    // Calculate button positions on ring centerline (90° apart)
    // 0° = right, 90° = bottom, 180° = left, 270° = top
    const getButtonPosition = (angleDegrees) => {
      const angleRad = (angleDegrees * Math.PI) / 180;
      const x = wheelRadius + ringCenterlineRadius * Math.cos(angleRad);
      const y = wheelRadius + ringCenterlineRadius * Math.sin(angleRad);
      return { x: `${x}px`, y: `${y}px` };
    };
    
    return {
      menu: getButtonPosition(270),    // Top (12 o'clock)
      next: getButtonPosition(0),       // Right (3 o'clock)
      play: getButtonPosition(90),      // Bottom (6 o'clock)
      prev: getButtonPosition(180)      // Left (9 o'clock)
    };
  }, [windowWidth]);


  return (
    <div className="h-full w-full flex items-center justify-center font-sans p-2 md:p-0 overflow-hidden">
      {/* --- The iPod Case --- */}
      <div 
        className="relative w-[280px] h-[448px] md:w-[300px] md:h-[480px] rounded-[30px] shadow-2xl select-none overflow-visible mx-auto flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #e3e3e3 0%, #d4d4d4 100%)',
          boxShadow: `
            inset 0 2px 4px rgba(255,255,255,0.9),
            inset 0 -2px 6px rgba(0,0,0,0.2),
            0 20px 40px rgba(0,0,0,0.6)
          `
        }}
        onMouseMove={handleWheelMove}
        onMouseUp={handleWheelEnd}
        onTouchMove={handleWheelMove}
        onTouchEnd={handleWheelEnd}
      >
        {/* --- Glossy Highlight on Case --- */}
        <div className="absolute top-0 left-0 w-full h-full rounded-[30px] pointer-events-none opacity-30"
             style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 40%)' }}></div>
        
        {/* --- Screen Area --- */}
        <div className="relative mx-auto mt-6 md:mt-8 w-[230px] h-[175px] md:w-[250px] md:h-[190px] bg-black rounded-lg overflow-hidden border-4 border-[#444] shadow-inner">
          {/* Actual LCD Content */}
          <div className="w-full h-full bg-white relative overflow-visible">
            {/* Top Bar (Global) */}
            <div className="h-6 bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-between px-2 border-b border-gray-400 z-10 relative">
              <div className="text-[10px] font-bold text-gray-700 flex items-center gap-1">
                {isPlaying ? <Play size={8} fill="currentColor" /> : <Pause size={8} fill="currentColor" />}
              </div>
              <div className="text-[10px] font-bold text-gray-700">{formatDisplayTime(currentTime)}</div>
              <div className="text-gray-700">
                 <div className="w-5 h-2 border border-gray-600 rounded-[1px] p-[1px] flex">
                    <div className="w-2/3 h-full bg-green-600"></div>
                 </div>
              </div>
            </div>

            {/* Views */}
            {view === 'menu' ? (
              <div className="flex h-full">
                {/* Left Side Menu */}
                <div className="flex-1 bg-white text-black pt-1">
                  <div className="px-2 py-1 text-sm font-bold text-center border-b border-gray-300 mb-1 shadow-sm">
                    iPod
                  </div>
                  <ul>
                    {IPOD_MENU_ITEMS.map((item, idx) => (
                      <li 
                        key={item.id}
                        className={`px-3 py-1 text-xs font-semibold flex justify-between items-center ${selectedIndex === idx ? 'bg-gradient-to-b from-[#5c94fa] to-[#2668e3] text-white' : 'text-black'}`}
                      >
                        <span>{item.label}</span>
                        {item.hasSub && <ChevronRight size={10} />}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Side Split (Visual only) */}
                <div className="w-1/2 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                   {/* Ken Burns effect placeholder */}
                   <div className="absolute inset-0 opacity-80" style={{background: 'radial-gradient(circle, #ccc 0%, #fff 100%)'}}></div>
                   <Music size={48} className="text-gray-300 opacity-50" />
                </div>
              </div>
            ) : (
              // Now Playing View - Screen: 250x190 → Content: 250x(190-24)=166px after top bar
              <div className="flex flex-col bg-white" style={{ height: 'calc(100% - 24px)' }}>
                {/* Main Info Area - Compact to leave room for progress */}
                <div className="flex p-2 gap-2 items-center" style={{ height: '100px' }}>
                   {/* Album Art */}
                   <div className={`w-20 h-20 shadow-lg ${currentSong.coverColor} flex items-center justify-center text-white/20 flex-shrink-0`}>
                      <Music size={32} />
                   </div>
                   {/* Song Info */}
                   <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h2 className="font-bold text-sm truncate text-black leading-tight mb-0.5">{currentSong.title}</h2>
                      <p className="text-[11px] text-gray-600 truncate font-medium">{currentSong.artist}</p>
                      <p className="text-[9px] text-gray-400 truncate mt-0.5">{currentSong.album}</p>
                   </div>
                </div>

                {/* Progress Area - Always visible at bottom */}
                <div className="px-3 pb-2.5 pt-1.5" style={{ 
                  height: '38px',
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #d1d5db'
                }}>
                   {/* Time Display */}
                   <div className="flex justify-between text-[9px] font-bold text-gray-600 mb-1.5 font-mono">
                      <span>{formatTime(currentPlayTime)}</span>
                      <span>-{formatTime(Math.max(0, currentSong.duration - currentPlayTime))}</span>
                   </div>
                   {/* Progress Bar - iPod Classic Style */}
                   <div 
                     ref={progressBarRef}
                     className="h-2 relative cursor-pointer group rounded-full"
                     onMouseDown={handleProgressBarStart}
                     onTouchStart={handleProgressBarStart}
                     onClick={handleProgressBarClick}
                     onMouseEnter={() => {
                       if (!isDraggingProgressRef.current) {
                         setIsDraggingProgress(true);
                       }
                     }}
                     onMouseLeave={() => {
                       if (!isDraggingProgressRef.current) {
                         setIsDraggingProgress(false);
                       }
                     }}
                     style={{ 
                       background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
                       border: '1px solid #9ca3af',
                       boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                     }}
                   >
                      {/* Progress Fill - Blue gradient matching menu selection */}
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${progress}%`, 
                          background: 'linear-gradient(to bottom, #5c94fa 0%, #2668e3 100%)',
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 1px rgba(0,0,0,0.1)',
                          transition: isDraggingProgress ? 'none' : 'width 0.1s ease-out'
                        }}
                      ></div>
                      {/* Drag Handle - Blue circle matching theme */}
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 rounded-full cursor-grab active:cursor-grabbing z-50 ${
                          isDraggingProgress ? 'opacity-100 w-3.5 h-3.5 shadow-md' : 'opacity-0 group-hover:opacity-100 w-3 h-3 shadow-sm'
                        }`}
                        style={{ 
                          left: `calc(${progress}% - ${isDraggingProgress ? '7px' : '6px'})`,
                          background: 'linear-gradient(to bottom, #5c94fa 0%, #2668e3 100%)',
                          border: '2px solid white',
                          boxShadow: isDraggingProgress 
                            ? '0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(92,148,250,0.5)' 
                            : '0 1px 2px rgba(0,0,0,0.2)',
                          transition: isDraggingProgress 
                            ? 'opacity 0.1s ease-out, box-shadow 0.1s ease-out' 
                            : 'left 0.1s ease-out, opacity 0.2s ease-out, width 0.2s ease-out, height 0.2s ease-out, box-shadow 0.2s ease-out'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleProgressBarStart(e);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleProgressBarStart(e);
                        }}
                      ></div>
                   </div>
                </div>
              </div>
            )}

            {/* LCD Overlay Effects (The "Authenticity" Layer) */}
            {/* 1. Inner Shadow for depth behind the plastic window */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"></div>
            {/* 2. Subtle Pixel Grid */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #000 25%, #000 26%, transparent 27%, transparent 74%, #000 75%, #000 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #000 25%, #000 26%, transparent 27%, transparent 74%, #000 75%, #000 76%, transparent 77%, transparent)', backgroundSize: '4px 4px' }}
            ></div>
          </div>
          
          {/* Physical Glass Reflection */}
          <div className="absolute top-0 right-0 w-[150%] h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none transform rotate-12 translate-x-10"></div>
        </div>

        {/* --- Click Wheel --- */}
        <div className="absolute bottom-10 md:bottom-12 left-1/2 transform -translate-x-1/2 shrink-0">
          <div 
            className="w-44 h-44 md:w-48 md:h-48 rounded-full relative active:scale-[0.99] transition-transform shrink-0"
            ref={wheelRef}
            onMouseDown={(e) => { e.stopPropagation(); handleWheelStart(e); }}
            onTouchStart={(e) => { e.stopPropagation(); handleWheelStart(e); }}
            style={{
              background: '#f2f2f2',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15), inset 0 2px 5px rgba(255,255,255,0.8), inset 0 -2px 5px rgba(0,0,0,0.05)'
            }}
          >
            {/* MENU Button - Top (270°) */}
            <button 
              className="absolute text-[11px] font-bold text-gray-400 tracking-widest hover:text-gray-600 whitespace-nowrap"
              style={{
                left: buttonPositions.menu.x,
                top: buttonPositions.menu.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => { e.stopPropagation(); handleMenuClick(); }}
              onTouchEnd={(e) => { e.stopPropagation(); }}
            >
              MENU
            </button>

            {/* Next Button - Right (0°) */}
            <button 
              className="absolute text-gray-400 hover:text-gray-600"
              style={{
                left: buttonPositions.next.x,
                top: buttonPositions.next.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              onTouchEnd={(e) => { e.stopPropagation(); }}
            >
              <FastForward size={14} fill="currentColor" />
            </button>

            {/* Prev Button - Left (180°) */}
            <button 
              className="absolute text-gray-400 hover:text-gray-600"
              style={{
                left: buttonPositions.prev.x,
                top: buttonPositions.prev.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              onTouchEnd={(e) => { e.stopPropagation(); }}
            >
              <Rewind size={14} fill="currentColor" />
            </button>

            {/* Play/Pause Button - Bottom (90°) */}
            <button 
              className="absolute text-gray-400 hover:text-gray-600 flex gap-[2px] items-center justify-center"
              style={{
                left: buttonPositions.play.x,
                top: buttonPositions.play.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
              onTouchEnd={(e) => { e.stopPropagation(); }}
            >
              <Play size={10} fill="currentColor" />
              <Pause size={10} fill="currentColor" />
            </button>

            {/* Center Button - Perfectly centered */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleCenterClick(); }}
              onTouchEnd={(e) => { e.stopPropagation(); }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-b from-[#e8e8e8] to-[#dcdcdc] active:bg-[#d0d0d0]"
              style={{
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,1), inset 0 -1px 2px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)'
              }}
            ></button>
          </div>
        </div>

        {/* --- Bottom Ports (Visual) --- */}
        {/* Just a subtle shadow at the bottom to suggest curvature */}
        <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-gray-400/20 to-transparent"></div>
      </div>
    </div>
  );
};

