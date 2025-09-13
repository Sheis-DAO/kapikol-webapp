import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '(max-width: 640px) 150px, (max-width: 768px) 300px, 600px',
  loading = 'lazy',
  onError,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const getImageSrc = (originalSrc: string, size: 'thumb' | 'medium' | 'large' = 'medium') => {
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    const extension = originalSrc.includes('.') ? originalSrc.split('.').pop()?.toLowerCase() : '';
    const baseName = originalSrc.replace(/\.[^/.]+$/, '');
    
    switch (size) {
      case 'thumb':
        return `${baseName}_thumb.webp`;
      case 'medium':
        return `${baseName}_medium.webp`;
      case 'large':
        return `${baseName}_large.webp`;
      default:
        return `${baseName}_medium.webp`;
    }
  };

  const getFallbackSrc = (originalSrc: string, size: 'thumb' | 'medium' | 'large' = 'medium') => {
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    const extension = originalSrc.includes('.') ? originalSrc.split('.').pop()?.toLowerCase() : 'jpg';
    const baseName = originalSrc.replace(/\.[^/.]+$/, '');
    
    switch (size) {
      case 'thumb':
        return `${baseName}_thumb.${extension}`;
      case 'medium':
        return `${baseName}_medium.${extension}`;
      case 'large':
        return `${baseName}_large.${extension}`;
      default:
        return `${baseName}_medium.${extension}`;
    }
  };

  const handleError = () => {
    if (imgRef.current) {
      // Try fallback JPEG/JPG format
      const fallbackSrc = getFallbackSrc(src, 'medium');
      if (imgRef.current.src !== fallbackSrc) {
        imgRef.current.src = fallbackSrc;
        return;
      }
      
      // If medium fails, try original
      if (imgRef.current.src !== src) {
        imgRef.current.src = src;
        return;
      }
    }
    
    setImageError(true);
    onError?.();
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  if (imageError) {
    return (
      <div 
        className={`bg-gradient-to-br from-kapikol-400 to-kapikol-600 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-white font-bold text-lg">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center"
        >
          <div className="w-6 h-6 border-2 border-kapikol-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <picture>
        <source
          srcSet={`
            ${getImageSrc(src, 'thumb')} 150w,
            ${getImageSrc(src, 'medium')} 300w,
            ${getImageSrc(src, 'large')} 600w
          `}
          sizes={sizes}
          type="image/webp"
        />
        <source
          srcSet={`
            ${getFallbackSrc(src, 'thumb')} 150w,
            ${getFallbackSrc(src, 'medium')} 300w,
            ${getFallbackSrc(src, 'large')} 600w
          `}
          sizes={sizes}
          type="image/jpeg"
        />
        <img
          ref={imgRef}
          src={getFallbackSrc(src, 'medium')}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } w-full h-full object-cover`}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;