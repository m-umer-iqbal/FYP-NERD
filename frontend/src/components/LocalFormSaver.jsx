import React, { useState, useEffect } from 'react';

function LocalFormSaver({ theme, onBack }) {
    const { primary, accent, lightPink, lightGray } = theme;
    const [collections, setCollections] = useState([]);

    // Load collections from localStorage
    useEffect(() => {
        const savedCollections = localStorage.getItem('formSaver_collections');
        if (savedCollections) {
            setCollections(JSON.parse(savedCollections));
        }
    }, []);

    // Sample collections for display (if none exist)
    const displayCollections = collections.length > 0 ? collections : [
        { id: 1, name: 'Sample Collection 1', forms: 3 },
        { id: 2, name: 'Sample Collection 2', forms: 5 },
        { id: 1, name: 'Sample Collection 1', forms: 3 },
        { id: 2, name: 'Sample Collection 2', forms: 5 },
        { id: 1, name: 'Sample Collection 1', forms: 3 },
        { id: 2, name: 'Sample Collection 2', forms: 5 },
        { id: 1, name: 'Sample Collection 1', forms: 3 },
        { id: 2, name: 'Sample Collection 2', forms: 5 },
        { id: 1, name: 'Sample Collection 1', forms: 3 },
        { id: 2, name: 'Sample Collection 2', forms: 5 },
    ];

    return (
        <div
            className="flex flex-col"
            style={{
                background: `linear-gradient(135deg, ${lightGray} 0%, #ffffff 100%)`,
                height: 'calc(100% - 60px)',
                overflow: 'hidden',
            }}
        >
            {/* Header with Back Button on right */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    {/* Main Heading - Feature Name */}
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: primary }}
                    >
                        Local Form Saver
                    </h1>

                    {/* Subheading - Collection */}
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: accent }}
                    >
                        Collections
                    </h2>
                </div>

                {/* Back Button - positioned like logout button */}
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

            {/* Collections Grid - 2 side by side with scroll */}
            <div
                className="overflow-y-auto collections-scroll flex-1"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    paddingRight: '8px',
                    alignContent: 'start',
                }}
            >
                {displayCollections.map((collection) => (
                    <div
                        key={collection.id}
                        className="p-4 rounded-xl transition-all duration-300 cursor-pointer"
                        style={{
                            background: '#ffffff',
                            boxShadow: '0 4px 12px rgba(2, 26, 84, 0.1)',
                            border: `1px solid ${lightPink}`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 8px 20px rgba(2, 26, 84, 0.15)`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 26, 84, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <h3
                            className="text-lg font-semibold mb-2"
                            style={{ color: primary }}
                        >
                            {collection.name}
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: accent }}
                        >
                            {collection.forms || 0} forms saved
                        </p>
                    </div>
                ))}
            </div>

            {/* Custom Scrollbar Styling - Only for collections */}
            <style>{`
        .collections-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .collections-scroll::-webkit-scrollbar-track {
          background: ${lightGray};
          border-radius: 4px;
        }
        .collections-scroll::-webkit-scrollbar-thumb {
          background: ${accent};
          border-radius: 4px;
        }
        .collections-scroll::-webkit-scrollbar-thumb:hover {
          background: ${primary};
        }
      `}</style>
        </div>
    );
}

export default LocalFormSaver;