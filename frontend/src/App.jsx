import React, { useState, useEffect } from "react";
import { useClerk, useUser } from '@clerk/chrome-extension';
import DecorativeCircle from './components/DecorativeCircle';
import Navbar from './components/Navbar';
import FeatureList from './components/FeatureList';
import LoginPrompt from './components/LoginPrompt';
import Footer from './components/Footer';

function App() {
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
    if (!navigator.onLine) {
      alert("No internet connection. Please check your network and try again.");
      return;
    }
    clerk.openSignIn();
  };

  const handleSignOut = () => {
    clerk.signOut();
  };

  return (
    <div
      className={`${isSignedIn && "h-135"}
        w-100 h-131.25 p-6 border-0 box-border flex flex-col 
        bg-[#f5f5f5] overflow-hidden transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
        boxShadow: "0 20px 35px -10px rgba(2, 26, 84, 0.2)",
      }}
    >
      <DecorativeCircle />

      <Navbar
        isSignedIn={isSignedIn}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {isSignedIn ? (
        <FeatureList features={features} />
      ) : (
        <LoginPrompt />
      )}

      <Footer />

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
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}

export default App;