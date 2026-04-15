import React from 'react';

function DecorativeCircle() {
  return (
    <div
      className="absolute -top-21.25 -right-10 w-45 h-45 rounded-full opacity-50 pointer-events-none"
      style={{
        background: "radial-gradient(circle, #ff85bb 0%, #ffcee3 100%)",
        animation: "pulse 8s ease-in-out infinite",
      }}
    />
  );
}

export default DecorativeCircle;