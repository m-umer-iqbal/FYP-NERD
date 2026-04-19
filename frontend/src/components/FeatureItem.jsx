import React from 'react';

function FeatureItem({ item, isHovered, onMouseEnter, onMouseLeave, index }) {
  return (
    <div
      className="group relative flex justify-between items-center py-2 px-2 rounded-xl transition-all duration-300"
      style={{
        background: isHovered ? "#ffffff" : "transparent",
        boxShadow: isHovered ? "0 8px 20px rgba(2, 26, 84, 0.08)" : "none",
        transform: isHovered ? "translateX(4px)" : "translateX(0)",
        animation: `fadeInSlide 0.4s ease-out ${index * 0.05}s both`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        className="text-xl font-semibold transition-all duration-300"
        style={{
          color: isHovered ? "#ff85bb" : "#021a54",
          letterSpacing: isHovered ? "0.5px" : "0",
        }}
      >
        {item.name}
      </span>

      <button
        className="cursor-pointer px-6 py-2 font-black text-xs uppercase tracking-wider transition-all duration-300 group-hover:scale-105"
        style={{
          background: "transparent",
          border: "2px solid #021a54",
          color: "#021a54",
          borderRadius: "30px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ff85bb";
          e.currentTarget.style.borderColor = "#ff85bb";
          e.currentTarget.style.color = "#021a54";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 133, 187, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "#021a54";
          e.currentTarget.style.color = "#021a54";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        GO →
      </button>
    </div>
  );
}

export default FeatureItem;