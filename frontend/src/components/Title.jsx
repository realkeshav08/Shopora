import React from 'react';

const Title = ({ text1, text2 }) => { // Destructure the props here
  return (
    <div className="flex flex-col items-center mb-10">
      <div className="inline-flex items-center gap-3">
        <p className="text-gray-400 text-sm tracking-[0.2em] uppercase font-light">{text1}</p>
        <span className="w-12 h-[1px] bg-primary/30"></span>
      </div>
      <h2 className="prata-regular text-4xl mt-2 text-gray-800">{text2}</h2>
    </div>
  );
};

export default Title;
