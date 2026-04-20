import React, { useState, useEffect } from 'react';

function LocalFormSaver({ theme, onBack }) {
    const { primary, accent, lightPink, lightGray } = theme;
    const [collections, setCollections] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteCollectionId, setDeleteCollectionId] = useState(null);

    // Load collections from localStorage
    useEffect(() => {
        const savedCollections = localStorage.getItem('formSaver_collections');
        if (savedCollections) {
            setCollections(JSON.parse(savedCollections));
        }
    }, []);

    // Save collections to localStorage
    const saveCollections = (newCollections) => {
        setCollections(newCollections);
        localStorage.setItem('formSaver_collections', JSON.stringify(newCollections));
    };

    // Add new collection
    const addCollection = () => {
        const newCollection = {
            id: Date.now(),
            name: 'New Collection',
            forms: 0
        };
        saveCollections([...collections, newCollection]);
    };

    // Start renaming
    const startRename = (collection) => {
        setEditingId(collection.id);
        setEditName(collection.name);
    };

    // Save renamed collection
    const saveRename = (id) => {
        if (editName.trim()) {
            const updatedCollections = collections.map(col =>
                col.id === id ? { ...col, name: editName.trim() } : col
            );
            saveCollections(updatedCollections);
        }
        setEditingId(null);
        setEditName('');
    };

    // Cancel rename
    const cancelRename = () => {
        setEditingId(null);
        setEditName('');
    };

    // Delete collection with confirmation
    const confirmDelete = (id) => {
        setDeleteCollectionId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteCollectionId) {
            const updatedCollections = collections.filter(col => col.id !== deleteCollectionId);
            saveCollections(updatedCollections);
        }
        setShowDeleteModal(false);
        setDeleteCollectionId(null);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeleteCollectionId(null);
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

            {/* Add Collection Button */}
            <button
                onClick={addCollection}
                className="flex items-center justify-center gap-2 mb-4 px-4 py-3 rounded-xl transition-all duration-300"
                style={{
                    background: '#ffffff',
                    border: `2px dashed ${primary}`,
                    color: primary,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = lightPink;
                    e.currentTarget.style.borderColor = accent;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = primary;
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
                </svg>
                Add Collection
            </button>

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
                {collections.map((collection) => (
                    <div
                        key={collection.id}
                        className="p-4 rounded-xl transition-all duration-300 relative"
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
                        {editingId === collection.id ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={() => saveRename(collection.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveRename(collection.id);
                                    if (e.key === 'Escape') cancelRename();
                                }}
                                autoFocus
                                className="w-full text-lg font-semibold mb-2 px-2 py-1 rounded border"
                                style={{
                                    color: primary,
                                    borderColor: accent,
                                    outline: 'none'
                                }}
                            />
                        ) : (
                            <h3
                                className="text-lg font-semibold mb-2"
                                style={{ color: primary }}
                                onClick={() => startRename(collection)}
                            >
                                {collection.name}
                            </h3>
                        )}
                        <p
                            className="text-sm"
                            style={{ color: accent }}
                        >
                            {collection.forms || 0} forms saved
                        </p>

                        {/* Delete Button */}
                        <button
                            onClick={() => confirmDelete(collection.id)}
                            className="absolute bottom-2 right-2 p-1 rounded-full transition-all duration-300"
                            style={{
                                background: 'transparent',
                            }}
                            title="Delete Collection"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ffcccc';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#dc3545" />
                            </svg>
                        </button>
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

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(2, 26, 84, 0.5)' }}
                    onClick={handleDeleteCancel}
                >
                    <div
                        className="p-6 rounded-xl shadow-lg"
                        style={{ backgroundColor: '#ffffff', minWidth: '300px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            className="text-xl font-bold mb-4"
                            style={{ color: primary }}
                        >
                            Delete Collection
                        </h3>
                        <p
                            className="mb-6"
                            style={{ color: primary }}
                        >
                            Are you sure you want to delete "{collections.find(c => c.id === deleteCollectionId)?.name}"?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                className="px-4 py-2 rounded-lg transition-all duration-300"
                                style={{
                                    background: 'transparent',
                                    border: `2px solid ${primary}`,
                                    color: primary,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = lightPink;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 rounded-lg transition-all duration-300"
                                style={{
                                    background: '#dc3545',
                                    border: 'none',
                                    color: '#ffffff',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#c82333';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#dc3545';
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LocalFormSaver;