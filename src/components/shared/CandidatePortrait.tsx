import React, { useState } from 'react';
import { User } from 'lucide-react';

interface CandidatePortraitProps {
  src: string;
  name: string;
  className?: string;
}

export const CandidatePortrait: React.FC<CandidatePortraitProps> = ({
  src,
  name,
  className = 'w-full h-full object-cover',
}) => {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#142B4D] to-[#2563EB] text-white ${className}`}
        aria-label={name}
      >
        <User className="w-6 h-6 opacity-80 mb-1" />
        <span className="text-xs font-semibold tracking-wider">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Live proctor feed for ${name}`}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
