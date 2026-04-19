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
              className="text-xs font-semibold truncate max-w-45"
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
          className="cursor-pointer px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-all duration-300"
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
          Login
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={onSignOut}
            className="cursor-pointer px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-all duration-300"
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
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;