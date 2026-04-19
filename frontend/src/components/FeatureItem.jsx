import React from 'react';

function FeatureItem({ item, isHovered, onMouseEnter, onMouseLeave, index, onClick }) {
  return (
    <div
      className="group relative flex justify-between items-center py-2 px-2 rounded-xl transition-all duration-300 cursor-pointer"
      style={{
        background: isHovered ? "#ffffff" : "transparent",
        boxShadow: isHovered ? "0 8px 20px rgba(2, 26, 84, 0.08)" : "none",
        transform: isHovered ? "translateX(4px)" : "translateX(0)",
        animation: `fadeInSlide 0.4s ease-out ${index * 0.05}s both`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
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
        className="cursor-pointer px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
        style={{
          background: "transparent",
          border: "2px solid #021a54",
          color: "#021a54",
          borderRadius: "8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ff85bb";
          e.currentTarget.style.borderColor = "#ff85bb";
          e.currentTarget.style.color = "#021a54";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "#021a54";
          e.currentTarget.style.color = "#021a54";
        }}
      >
        GO
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

export default FeatureItem;