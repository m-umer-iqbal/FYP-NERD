import React from 'react';

function Footer() {
  return (
    <div className="mt-4 pt-4 text-center relative z-10">
      <div
        className="w-full h-0.5 rounded-full mb-4"
        style={{
          background: "linear-gradient(90deg, transparent, #ff85bb, #ffcee3, #ff85bb, transparent)",
        }}
      />
      <p
        className="font-black text-xs tracking-wider animate-pulse-slow"
        style={{ color: "#021a54", opacity: 0.7 }}
      >
        © {new Date().getFullYear()} NERD. All Rights Reserved.
      </p>
    </div>
  );
}

export default Footer;