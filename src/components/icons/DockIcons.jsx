import React, { useState, useEffect } from 'react';

export const IconImage = ({ src, alt, fallback, eager = false }) => {
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

export const FinderIcon = () => (
  <IconImage 
    src="/icons/finder-icon.png" 
    alt="Finder"
    eager={true}
  />
);

export const AOLIcon = () => (
  <IconImage 
    src="/icons/chatgpt-icon.png" 
    alt="ChatGPT"
    eager={true}
  />
);

export const IEIcon = () => (
  <IconImage 
    src="/icons/ie-icon.png" 
    alt="Internet Explorer"
    eager={true}
  />
);

export const AppsIcon = () => (
  <IconImage 
    src="/icons/applications-icon.png" 
    alt="Applications"
    eager={true}
  />
);

export const TrashIcon = () => (
  <IconImage 
    src="/icons/trash-icon.png" 
    alt="Trash"
    eager={true}
  />
);

