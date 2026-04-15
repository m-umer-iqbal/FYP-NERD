import React from 'react';

function Navbar({ isSignedIn, user, onSignIn, onSignOut }) {
  return (
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
            className="absolute -bottom-1 left-0 h-0.75 rounded-full"
            style={{
              width: "85%",
              background: "linear-gradient(90deg, #ff85bb 0%, #ffcee3 60%, transparent 100%)",
              animation: "slideIn 0.8s ease-out",
            }}
          />
        </div>
        
        {isSignedIn && (
          <div className="mt-2">
            <p
              className="text-xs font-medium truncate max-w-45"
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

      {!isSignedIn ? (
        <button
          onClick={onSignIn}
          className="cursor-pointer px-5 py-1.5 font-black text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
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
            onClick={onSignOut}
            className="cursor-pointer px-3 py-1.5 font-black text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
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
  );
}

export default Navbar;