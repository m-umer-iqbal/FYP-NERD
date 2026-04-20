import React from 'react';

function StylePeek({ theme, onBack }) {
    const { primary, accent, lightPink, lightGray } = theme;

    return (
        <div
            className="flex flex-col"
            style={{
                background: `linear-gradient(135deg, ${lightGray} 0%, #ffffff 100%)`,
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {/* Header with Back Button on right */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: primary }}
                    >
                        StylePeek
                    </h1>
                </div>

                <button
                    onClick={onBack}
                    className="font-semibold text-xs flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300"
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

            {/* Content area - to be customized later */}
            <div className="flex-1 flex items-center justify-center">
                <p style={{ color: primary, opacity: 0.6 }}>StylePeek interface coming soon...</p>
            </div>
        </div>
    );
}

export default StylePeek;