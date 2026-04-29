import React from 'react';

function Navbar() {
  return (
    <div className="flex justify-between items-center pb-8 relative z-10 cursor-default">
      <div>
        <div className="relative">
          <h1
            className="text-3xl font-black uppercase"
            style={{
              background: "linear-gradient(135deg, #021a54 0%, #021a54 70%, #ff85bb 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NERD
          </h1>
          <div
            className="absolute -bottom-1 left-0 h-0.75 rounded-full"
            style={{
              width: "85%",
              background: "linear-gradient(90deg, #ff85bb 0%, #ffcee3 60%, transparent 100%)",
              animation: "slideIn 0.8s ease-out",
            }}
          />
        </div>
      </div>
      <span
        className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full"
        style={{
          background: '#FF85BB',
          color: '#021A54',
          boxShadow: '0 4px 12px rgba(255,133,187,0.4), 0 1px 3px rgba(2,26,84,0.1)',
          border: '1px solid rgba(255,205,227,0.6)',
          letterSpacing: '1px',
          transform: 'scale(1)',
          transition: 'transform 0.2s ease',
        }}
      >
        v 6.0.0
      </span>
    </div>
  );
}

export default Navbar;