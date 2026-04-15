import React, { useState, useEffect } from "react";

function App() {
  const [hoveredId, setHoveredId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    { id: 1, name: "Responza" },
    { id: 2, name: "DOMinex" },
    { id: 3, name: "FormLock" },
    { id: 4, name: "StylePeek" },
    { id: 5, name: "ShotStack" },
    { id: 6, name: "Translify" },
  ];

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`
        w-[400px] h-[525px] p-6 border-0 box-border flex flex-col 
        bg-[#f5f5f5] overflow-hidden transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
        boxShadow: "0 20px 35px -10px rgba(2, 26, 84, 0.2)",
      }}
    >
      {/* Decorative animated circle */}
      <div
        className="absolute top-[-85px] right-[-40px] w-[180px] h-[180px] rounded-full opacity-50 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #ff85bb 0%, #ffcee3 100%)",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />

      {/* Navbar */}
      <div className="flex justify-between items-center pb-8 relative z-10">
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
            className="absolute -bottom-1 left-0 h-[3px] rounded-full"
            style={{
              width: "85%",
              background: "linear-gradient(90deg, #ff85bb 0%, #ffcee3 60%, transparent 100%)",
              animation: "slideIn 0.8s ease-out",
            }}
          />
        </div>
        <button
          className="px-5 py-1.5 font-black text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "#021a54",
            color: "#ffffff",
            border: "none",
            borderRadius: "30px",
            boxShadow: "0 4px 10px rgba(2, 26, 84, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ff85bb";
            e.currentTarget.style.color = "#021a54";
            e.currentTarget.style.boxShadow = "0 6px 15px rgba(255, 133, 187, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#021a54";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(2, 26, 84, 0.3)";
          }}
        >
          Login
        </button>
      </div>

      {/* Features */}
      <div className="flex-1 flex flex-col gap-2 relative z-10">
        {features.map((item, index) => (
          <div
            key={item.id}
            className="group relative flex justify-between items-center py-2 px-2 rounded-xl transition-all duration-300"
            style={{
              background: hoveredId === item.id ? "#ffffff" : "transparent",
              boxShadow: hoveredId === item.id ? "0 8px 20px rgba(2, 26, 84, 0.08)" : "none",
              transform: hoveredId === item.id ? "translateX(4px)" : "translateX(0)",
              animation: `fadeInSlide 0.4s ease-out ${index * 0.05}s both`,
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span
              className="text-xl font-black transition-all duration-300"
              style={{
                color: hoveredId === item.id ? "#ff85bb" : "#021a54",
                letterSpacing: hoveredId === item.id ? "0.5px" : "0",
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
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 text-center relative z-10">
        <div
          className="w-full h-[2px] rounded-full mb-4"
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

      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
            opacity: 0.25;
          }
        }
        
        @keyframes slideIn {
          0% {
            width: 0%;
            opacity: 0;
          }
          100% {
            width: 85%;
            opacity: 1;
          }
        }
        
        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-pulse-slow {
          animation: pulseSoft 3s ease-in-out infinite;
        }
        
        @keyframes pulseSoft {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #ffcee3;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ff85bb;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #021a54;
        }
      `}</style>
    </div>
  );
}

export default App;