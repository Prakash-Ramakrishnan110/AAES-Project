import React from 'react';

interface AvatarProps {
  src?: string;
  fallbackInitials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getImageUrl = (path: string) => {
    if (!path) return '';
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const cleanAPI = API.endsWith('/') ? API.slice(0, -1) : API;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanAPI}${cleanPath}`;
};

export const Avatar = ({ src, fallbackInitials, size = 'md', className = '' }: AvatarProps) => {
  const sizeMap = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-[12px]",
    lg: "w-10 h-10 text-[14px]",
  };

  return (
    <div className={`${sizeMap[size]} rounded bg-primary border border-border flex items-center justify-center text-white font-medium overflow-hidden ${className}`}>
      {src ? (
        <img 
          src={getImageUrl(src)} 
          alt="Avatar" 
          className="w-full h-full object-cover" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span>{fallbackInitials.toUpperCase()}</span>
      )}
    </div>
  );
};
