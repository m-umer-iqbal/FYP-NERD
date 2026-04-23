import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function CollectionDetail({ theme, collection, onBack }) {
    const { primary, accent, lightPink, lightGray } = theme;
    const [forms, setForms] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteFormId, setDeleteFormId] = useState(null);

    useEffect(() => {
        // Fetch the latest collection data from storage to ensure we have the most up‑to‑date forms
        if (collection && collection.id) {
            chrome.storage.local.get(['formSaver_collections'], (result) => {
                const collections = result.formSaver_collections || [];
                const updatedCollection = collections.find(c => c.id === collection.id);
                if (updatedCollection) {
                    setForms(updatedCollection.objects || []);
                } else if (collection.objects) {
                    setForms(collection.objects);
                }
            });
        }
    }, [collection.id]); // Only depend on collection.id, not the whole collection object

    const saveForms = (newForms) => {
        chrome.storage.local.get(['formSaver_collections'], (result) => {
            const collections = result.formSaver_collections || [];
            const updatedCollections = collections.map(col => {
                if (col.id === collection.id) {
                    return {
                        ...col,
                        objects: newForms,
                        forms: newForms.length
                    };
                }
                return col;
            });
            chrome.storage.local.set({ formSaver_collections: updatedCollections }, () => {
                setForms(newForms);
            });
        });
    };

    const addForm = () => {
        const newForm = {
            id: Date.now(),
            name: 'New Form',
            savedAt: new Date().toISOString(),
            data: {}
        };
        saveForms([...forms, newForm]);
        toast.success('Form created');
    };

    const startRename = (form) => {
        setEditingId(form.id);
        setEditName(form.name);
    };

    const saveRename = (id) => {
        if (editName.trim()) {
            const updatedForms = forms.map(form =>
                form.id === id ? { ...form, name: editName.trim() } : form
            );
            saveForms(updatedForms);
            toast.success('Form renamed');
        }
        setEditingId(null);
        setEditName('');
    };

    const cancelRename = () => {
        setEditingId(null);
        setEditName('');
    };

    const confirmDelete = (id) => {
        setDeleteFormId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteFormId) {
            const updatedForms = forms.filter(form => form.id !== deleteFormId);
            saveForms(updatedForms);
            toast.success('Form deleted');
        }
        setShowDeleteModal(false);
        setDeleteFormId(null);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeleteFormId(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const navigateToForm = (form) => {
        onBack({ id: 8, collection, form });
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
                        {collection?.name || 'Collection'}
                    </h1>
                    <h2 className="text-xl font-semibold" style={{ color: accent }}>
                        Forms
                    </h2>
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

            {/* Forms count (optional, kept for info) */}
            <p className="text-sm mb-3" style={{ color: accent }}>
                {forms.length} {forms.length === 1 ? 'form' : 'forms'} saved
            </p>

            {/* Add Form Button – now matches Add Collection button style */}
            <button
                onClick={addForm}
                className="flex items-center justify-center gap-2 mb-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer w-full"
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
                Add Form
            </button>

            {/* Forms Grid */}
            <div
                className="overflow-y-auto forms-scroll flex-1"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    paddingRight: '8px',
                    alignContent: 'start',
                }}
            >
                {forms.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12" style={{ color: accent }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-50">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-lg font-semibold">No forms saved yet</p>
                        <p className="text-sm mt-1">Forms saved from websites will appear here</p>
                    </div>
                ) : (
                    forms.map((form) => (
                        <div
                            key={form.id}
                            className="p-4 rounded-xl transition-all duration-300 relative"
                            style={{
                                background: '#ffffff',
                                boxShadow: '0 4px 12px rgba(2, 26, 84, 0.1)',
                                border: `1px solid ${lightPink}`,
                                cursor: editingId !== form.id ? 'pointer' : 'default',
                            }}
                            onClick={() => {
                                if (editingId !== form.id) {
                                    navigateToForm(form);
                                }
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
                            {editingId === form.id ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={() => saveRename(form.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveRename(form.id);
                                        if (e.key === 'Escape') cancelRename();
                                    }}
                                    onClick={(e) => e.stopPropagation()}
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
                                    className="text-lg font-semibold mb-2 cursor-default"
                                    style={{ color: primary }}
                                    title="Click to rename"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startRename(form);
                                    }}
                                >
                                    {form.name}
                                </h3>
                            )}
                            <p className="text-sm mb-2" style={{ color: accent }}>
                                Saved: {formatDate(form.savedAt)}
                            </p>
                            {form.data && Object.keys(form.data).length > 0 && (
                                <p className="text-xs" style={{ color: primary, opacity: 0.7 }}>
                                    {Object.keys(form.data).length} fields
                                </p>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(form.id);
                                }}
                                className="absolute bottom-2 right-2 p-1 rounded-full transition-all duration-300 cursor-pointer"
                                style={{ background: 'transparent' }}
                                title="Delete Form"
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
                    ))
                )}
            </div>

            {/* Scrollbar Styles */}
            <style>{`
                .forms-scroll::-webkit-scrollbar {
                    width: 8px;
                }
                .forms-scroll::-webkit-scrollbar-track {
                    background: ${lightGray};
                    border-radius: 4px;
                }
                .forms-scroll::-webkit-scrollbar-thumb {
                    background: ${accent};
                    border-radius: 4px;
                }
                .forms-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${primary};
                }
            `}</style>

            {/* Delete Confirmation Modal */}
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
                        <h3 className="text-xl font-bold mb-4" style={{ color: primary }}>
                            Delete Form
                        </h3>
                        <p className="mb-6" style={{ color: primary }}>
                            Are you sure you want to delete "{forms.find(f => f.id === deleteFormId)?.name}"?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                className="px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer"
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
                                className="px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer"
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

            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 2000,
                    style: {
                        background: primary,
                        color: '#fff',
                        borderRadius: '8px',
                    },
                }}
            />
        </div>
    );
}

export default CollectionDetail;