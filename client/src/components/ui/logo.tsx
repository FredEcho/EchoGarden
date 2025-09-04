import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Circular gradient logo with white plant sprout */}
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg`}>
        <span className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'} text-white`}>
          🌱
        </span>
      </div>
      
      {showText && (
        <div>
          <h1 className={`font-bold text-white ${textSizes[size]}`}>EchoGarden</h1>
          <p className="text-white/80 text-sm">Grow kindness together</p>
        </div>
      )}
    </div>
  );
}

// Small sprout icon for accent use
export function SproutIcon({ className = '', color = 'orange' }: { className?: string; color?: 'orange' | 'purple' | 'pink' | 'white' }) {
  const colorClasses = {
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    white: 'text-white'
  };

  return (
    <svg 
      className={`w-4 h-4 ${colorClasses[color]} ${className}`} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      {/* Filled plant sprout */}
      <path d="M12 20v-8" />
      <path d="M8 12c0-1 1-2 2-2s2 1 2 2" />
      <path d="M7 13c1-1 2-1 3 0" />
      <path d="M16 12c0-1-1-2-2-2s-2 1-2 2" />
      <path d="M17 13c-1-1-2-1-3 0" />
    </svg>
  );
}
