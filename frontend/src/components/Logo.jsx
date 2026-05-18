import React from 'react';

// Shopora logo — a vector shopping-bag icon + the "shopora" wordmark.
//
// Built entirely from transparent SVG + text (no baked-in background colour),
// so it sits cleanly on any surface. When the navbar background fades on
// scroll, there is no opaque box around the logo any more.
//
// Text and two-tone styling are unchanged: "shop" dark, "ora" in the brand
// pink, in the site's Outfit font.
const Logo = ({ className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="shopora-bag-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {/* bag handle */}
        <path
          d="M16 15v-2.5a8 8 0 0 1 16 0V15"
          fill="none"
          stroke="url(#shopora-bag-gradient)"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        {/* bag body */}
        <rect x="7" y="14" width="34" height="27" rx="9" fill="url(#shopora-bag-gradient)" />
        {/* S monogram */}
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fontFamily="Outfit, sans-serif"
          fontSize="20"
          fontWeight="800"
          fill="#ffffff"
        >
          S
        </text>
      </svg>
      <span className="text-[1.65rem] font-bold leading-none tracking-tight">
        <span className="text-gray-900">shop</span>
        <span className="text-primary">ora</span>
      </span>
    </span>
  );
};

export default Logo;
