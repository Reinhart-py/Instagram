
import React, { useState } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgClass: string;
  details: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, bgClass, details }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="h-[280px] perspective-1000 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ 
          transform: isFlipped ? 
            'rotateY(180deg)' : 
            isHovered ? 
              'rotateY(5deg) rotateX(5deg)' : 
              'rotateY(0) rotateX(0)',
          transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front */}
        <div 
          className={`absolute inset-0 backface-hidden glass-panel p-6 rounded-2xl flex flex-col items-center text-center ${bgClass}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-5">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <p className="text-gray-300">{description}</p>
          
          <div className="mt-4 text-sm text-indigo-300">
            Click to see more details
          </div>
        </div>
        
        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden glass-panel p-6 rounded-2xl flex flex-col justify-center rotate-y-180"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-xl font-bold mb-3 text-gradient">{title}</h3>
          <p className="text-gray-300">{details}</p>
          
          <div className="mt-5 text-sm text-indigo-300">
            Click to flip back
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
