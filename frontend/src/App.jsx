import React, { useState, useEffect } from "react";
import { useClerk, useUser } from '@clerk/chrome-extension';

function App() {
  const [hoveredId, setHoveredId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();

  const features = [
    { id: 1, name: "Responza" },
    { id: 2, name: "DOMinex" },
    { id: 3, name: "FormLock" },
    { id: 4, name: "StylePeek" },
    { id: 5, name: "ShotStack" },
    { id: 6, name: "Translify" },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSignIn = () => {
    clerk.openSignIn();
  };

  const handleSignOut = () => {
    clerk.signOut();
  };

  return (
    <div
      className={`${isSignedIn && "h-[540px]"}
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
      <div className={isSignedIn ? "flex justify-between items-center pb-4 relative z-10" : "flex justify-between items-center pb-8 relative z-10"}>
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
              className="absolute -bottom-1 left-0 h-[3px] rounded-full"
              style={{
                width: "85%",
                background: "linear-gradient(90deg, #ff85bb 0%, #ffcee3 60%, transparent 100%)",
                animation: "slideIn 0.8s ease-out",
              }}
            />
          </div>
          {/* email showing */}
          {isSignedIn && (
            <div className="mt-2">
              <p
                className="text-xs font-medium truncate max-w-[180px]"
                style={{
                  color: "#021a54",
                  opacity: 0.9,
                  letterSpacing: "0.3px"
                }}
              >
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          )}
        </div>

        {/* Authentication buttons */}
        {!isSignedIn ? (
          <button
            onClick={handleSignIn}
            className=" cursor-pointer px-5 py-1.5 font-black text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
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
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className=" cursor-pointer px-3 py-1.5 font-black text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "#ff85bb",
                color: "#021a54",
                border: "none",
                borderRadius: "30px",
                boxShadow: "0 4px 10px rgba(255, 133, 187, 0.3)",
              }}
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Features - Only show when logged in */}
      {isSignedIn ? (
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
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
          {/* Animated lock icon */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #ff85bb 0%, #ffcee3 100%)",
                boxShadow: "0 10px 25px -5px rgba(255, 133, 187, 0.3)",
              }}
            >
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="#021a54"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                style={{
                  animation: "bounce 2s ease-in-out infinite",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div className="text-center">
            <p
              className="font-black text-lg mb-2"
              style={{ color: "#021a54" }}
            >
              Unlock the Future
            </p>
            <p
              className="font-medium text-sm px-6"
              style={{ color: "#021a54", opacity: 0.7 }}
            >
              Kindly login to access<br />NERD features
            </p>
          </div>

          {/* Decorative dots */}
          <div className="flex gap-2 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#ff85bb",
                  opacity: 0.4 + (i * 0.2),
                  animation: `fadeInOut 1.5s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

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
        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default App;