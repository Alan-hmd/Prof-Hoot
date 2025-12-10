import React from 'react';

interface AvatarProps {
  talking: boolean;
  mood?: 'happy' | 'thinking' | 'neutral';
}

// Simple SVG Owl that animates when "talking"
const Avatar: React.FC<AvatarProps> = ({ talking, mood = 'neutral' }) => {
  return (
    <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto transition-transform duration-300 hover:scale-105">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <ellipse cx="100" cy="110" rx="70" ry="80" fill="#A78BFA" />
        <ellipse cx="100" cy="110" rx="50" ry="60" fill="#DDD6FE" />

        {/* Ears */}
        <path d="M40 50 L70 80 L30 90 Z" fill="#A78BFA" />
        <path d="M160 50 L130 80 L170 90 Z" fill="#A78BFA" />

        {/* Eyes */}
        <g className={mood === 'thinking' ? 'animate-pulse' : ''}>
          <circle cx="70" cy="90" r="25" fill="white" stroke="#4C1D95" strokeWidth="4" />
          <circle cx="130" cy="90" r="25" fill="white" stroke="#4C1D95" strokeWidth="4" />
          
          {/* Pupils - move if talking/thinking */}
          <circle cx="70" cy="90" r="10" fill="black" className={talking ? "animate-bounce" : ""} />
          <circle cx="130" cy="90" r="10" fill="black" className={talking ? "animate-bounce" : ""} />
        </g>

        {/* Beak */}
        <path d="M90 115 L110 115 L100 130 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />

        {/* Wings */}
        <path d="M30 110 Q 10 150 40 160" fill="none" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" />
        <path d="M170 110 Q 190 150 160 160" fill="none" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" />

        {/* Feet */}
        <path d="M80 190 L70 200 L90 200 Z" fill="#FBBF24" />
        <path d="M120 190 L110 200 L130 200 Z" fill="#FBBF24" />

        {/* Glasses (Professor look) */}
        <g fill="none" stroke="#1E293B" strokeWidth="3">
          <circle cx="70" cy="90" r="28" />
          <circle cx="130" cy="90" r="28" />
          <line x1="98" y1="90" x2="102" y2="90" />
        </g>
      </svg>
      {/* Speech Bubble Tail if needed */}
    </div>
  );
};

export default Avatar;
