import React from 'react';
import Logo from './Logo';

// Full-screen branded loading screen shown for ~1s on every page reload,
// then fades out to reveal the admin panel.
const SplashScreen = ({ fading }) => {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fff1f6]
        transition-opacity duration-500 ease-out ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="animate-pulse">
        <Logo className="scale-[1.4]" />
      </div>
      <div className="mt-10 h-8 w-8 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
    </div>
  );
};

export default SplashScreen;
