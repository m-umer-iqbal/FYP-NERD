import React from 'react';

function LoginPrompt() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
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
  );
}

export default LoginPrompt;