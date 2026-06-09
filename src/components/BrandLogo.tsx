'use client';

import React from 'react';
import LogoSymbol from './LogoSymbol';
import LogoText from './LogoText';

interface BrandLogoProps {
  className?: string; // custom classes for the container
  logoHeightClass?: string; // height classes for the SVGs (e.g. 'h-8 md:h-10')
  fillClassName?: string;
}

export default function BrandLogo({ 
  className = '', 
  logoHeightClass = 'h-8 md:h-10', 
  fillClassName = 'fill-current' 
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 md:gap-3 group select-none ${className}`}>
      {/* Symbol positioned straight and upright on the left */}
      <LogoSymbol className={`${logoHeightClass} w-auto`} fillClassName={fillClassName} />
      {/* Text 'Conquête Voyages' positioned on the right */}
      <LogoText className={`${logoHeightClass} w-auto`} fillClassName={fillClassName} />
    </div>
  );
}
