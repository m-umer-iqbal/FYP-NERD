import React, { useState } from 'react';

function Translify({ theme, onBack }) {
    const { primary, accent, lightPink, lightGray } = theme;
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Top 6 languages spoken in the world (excluding English) with native names
    const languages = [
        { name: "Urdu", native: "اردو" },
        { name: "Mandarin Chinese", native: "普通话" },
        { name: "Spanish", native: "Español" },
        { name: "Hindi", native: "हिन्दी" },
        { name: "Arabic", native: "العربية" },
        { name: "French", native: "Français" }
    ];

    const handleLanguageClick = async (language) => {
        const langMap = {
            "Urdu": "ur",
            "Mandarin Chinese": "zh-CN",
            "Spanish": "es",
            "Hindi": "hi",
            "Arabic": "ar",
            "French": "fr"
        };
        const targetLang = langMap[language.name];
        if (!targetLang) return;

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, {
            action: "translate",
            targetLang: targetLang
        });
    };

    const handleReset = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: "reset" });
    };

    return (
        <div
            className="flex flex-col"
            style={{
                background: `linear-gradient(135deg, ${lightGray} 0%, #ffffff 100%)`,
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {/* Header with Back Button */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: primary }}>
                        Translify
                    </h1>
                    <p className="text-xl font-semibold" style={{ color: accent }}>
                        Translate Pages
                    </p>
                </div>

                <button
                    onClick={onBack}
                    className="font-semibold text-xs flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer"
                    style={{
                        background: 'transparent',
                        border: `2px solid ${primary}`,
                        color: primary,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = accent;
                        e.currentTarget.style.borderColor = accent;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = primary;
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Language List */}
            <div className="flex-1 flex flex-col gap-2 relative z-10 cursor-default overflow-y-hidden pr-2">
                {languages.map((language, index) => (
                    <div
                        key={language.name}
                        className="group relative flex justify-between items-center py-2 px-2 rounded-xl transition-all duration-300 cursor-pointer"
                        style={{
                            background: hoveredIndex === index ? "#ffffff" : "transparent",
                            boxShadow: hoveredIndex === index ? "0 8px 20px rgba(2, 26, 84, 0.08)" : "none",
                            transform: hoveredIndex === index ? "translateX(4px)" : "translateX(0)",
                            animation: `fadeInSlide 0.4s ease-out ${index * 0.05}s both`,
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span
                            className="text-xl font-semibold transition-all duration-300"
                            style={{
                                color: hoveredIndex === index ? accent : primary,
                                letterSpacing: hoveredIndex === index ? "0.5px" : "0",
                            }}
                        >
                            {language.name} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>({language.native})</span>
                        </span>

                        <button
                            onClick={() => handleLanguageClick(language)}
                            className="cursor-pointer px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 rounded-lg"
                            style={{
                                background: "transparent",
                                border: `2px solid ${primary}`,
                                color: primary,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = accent;
                                e.currentTarget.style.borderColor = accent;
                                e.currentTarget.style.color = primary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.borderColor = primary;
                                e.currentTarget.style.color = primary;
                            }}
                        >
                            GO
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer hint + Reset button (styled like GO/Back) */}
            <div className="mt-4 text-center text-xs flex flex-col items-center gap-3" style={{ color: accent }}>
                <span>Click "GO" to translate the current page</span>
                <button
                    onClick={handleReset}
                    className="font-semibold text-xs flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer"
                    style={{
                        background: "transparent",
                        border: `2px solid ${primary}`,
                        color: primary,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = accent;
                        e.currentTarget.style.borderColor = accent;
                        e.currentTarget.style.color = primary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = primary;
                        e.currentTarget.style.color = primary;
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.65 6.35C16.02 4.72 13.71 4 11.5 4C7.36 4 4 7.36 4 11.5C4 15.64 7.36 19 11.5 19C15.64 19 19 15.64 19 11.5H17.65C17.65 14.27 15.27 16.5 12.5 16.5C9.73 16.5 7.35 14.27 7.35 11.5C7.35 8.73 9.73 6.5 12.5 6.5C13.93 6.5 15.23 7.08 16.15 8.05L13.5 10.7H20V4.2L17.65 6.35Z" fill="currentColor" />
                    </svg>
                    Reset
                </button>
            </div>

            {/* Required keyframe animation */}
            <style>{`
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
            `}</style>
        </div>
    );
}

export default Translify;