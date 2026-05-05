import React, { useState, useEffect } from "react";
import DecorativeCircle from './components/DecorativeCircle';
import Navbar from './components/Navbar';
import FeatureList from './components/FeatureList';
import DOMTree from './components/DOMTree/DOMTree';
import Footer from './components/Footer';
import LocalFormSaver from './components/LocalFormSaver/LocalFormSaver';
import CollectionDetail from './components/LocalFormSaver/CollectionDetail';
import Form from './components/LocalFormSaver/Form';
import WebsiteAuditor from './components/WebsiteAuditor/WebsiteAuditor';
import DebuggingAssistant from "./components/DebuggingAssistant/DebuggingAssistant";
import Translify from './components/Translify/Translify';
import ScreenSizeEmulator from './components/ScreenSizeEmulator';

const THEME = {
  primary: '#021A54',
  accent: '#FF85BB',
  lightPink: '#FFCEE3',
  lightGray: '#F5F5F5'
};

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    { id: 1, name: "Local Form Saver" },
    { id: 2, name: "Website Auditor" },
    { id: 3, name: "Console Error Explainer" },
    // { id: 4, name: "DOM Tree" },
    // { id: 5, name: "Translify" },
    // { id: 6, name: "Screen Size Emulator" },
  ];

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
  };

  const handleBack = (data) => {
    if (data && (data.nativeEvent || data.type === 'click' || data.target)) {
      if (selectedFeature?.id === 8) {
        setSelectedFeature({ id: 7, collection: selectedFeature.collection });
      } else if (selectedFeature?.id === 7) {
        setSelectedFeature({ id: 1, name: "Local Form Saver" });
      } else {
        setSelectedFeature(null);
      }
      return;
    }

    if (data) {
      if (data.id === 7 && data.collection) {
        setSelectedFeature(data);
      } else if (data.id === 8 && data.collection && data.form) {
        setSelectedFeature(data);
      } else {
        setSelectedFeature(null);
      }
    } else {
      setSelectedFeature(null);
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const isFeaturePage = selectedFeature !== null;

  return (
    <div
      className={`
        w-100 p-6 border-0 box-border flex flex-col 
        bg-[#f5f5f5] transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
        boxShadow: "0 20px 35px -10px rgba(2, 26, 84, 0.2)",
        overflow: 'hidden',
        height: isFeaturePage ? '560px' : '355px',
      }}
    >
      <DecorativeCircle />

      {!isFeaturePage && <Navbar />}

      {selectedFeature ? (
        <>
          {selectedFeature.id === 1 && <LocalFormSaver theme={THEME} onBack={handleBack} />}
          {selectedFeature.id === 2 && <WebsiteAuditor theme={THEME} onBack={handleBack} />}
          {selectedFeature.id === 3 && <DebuggingAssistant theme={THEME} onBack={handleBack} />}
          {selectedFeature.id === 7 && <CollectionDetail theme={THEME} collection={selectedFeature.collection} onBack={handleBack} />}
          {selectedFeature.id === 8 && <Form theme={THEME} form={selectedFeature.form} collection={selectedFeature.collection} onBack={handleBack} />}
        </>
      ) : (
        <FeatureList features={features} onFeatureSelect={handleFeatureSelect} />
      )}

      {!isFeaturePage && <Footer />}

      <style>{`
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