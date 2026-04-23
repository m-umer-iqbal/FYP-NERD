import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function Form({ theme, form, collection, onBack }) {
    const { primary, accent, lightPink, lightGray } = theme;
    const [formData, setFormData] = useState(form?.data || {});
    const [editingFieldKey, setEditingFieldKey] = useState(null);
    const [newFieldKey, setNewFieldKey] = useState('');
    const [editFieldValue, setEditFieldValue] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteFieldKey, setDeleteFieldKey] = useState(null);

    // Format date
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

    // Save form data to storage
    const saveFormData = (newData) => {
        chrome.storage.local.get(['formSaver_collections'], (result) => {
            const collections = result.formSaver_collections || [];
            const updatedCollections = collections.map(col => {
                if (col.id === collection.id) {
                    const updatedObjects = col.objects.map(obj => {
                        if (obj.id === form.id) {
                            return { ...obj, data: newData };
                        }
                        return obj;
                    });
                    return { ...col, objects: updatedObjects };
                }
                return col;
            });
            chrome.storage.local.set({ formSaver_collections: updatedCollections }, () => {
                setFormData(newData);
            });
        });
    };

    // Update field value
    const updateFieldValue = (key, value) => {
        const newData = { ...formData, [key]: value };
        saveFormData(newData);
        toast.success('Field updated');
    };

    // Rename field key
    const renameFieldKey = (oldKey, newKey) => {
        if (oldKey === newKey || !newKey.trim()) {
            setEditingFieldKey(null);
            return;
        }
        const newData = {};
        Object.keys(formData).forEach(key => {
            if (key === oldKey) {
                newData[newKey.trim()] = formData[oldKey];
            } else {
                newData[key] = formData[key];
            }
        });
        saveFormData(newData);
        toast.success('Field renamed');
        setEditingFieldKey(null);
    };

    // Start editing field value
    const startEditValue = (key, value) => {
        setEditFieldValue(key);
        setEditValue(value || '');
    };

    // Save edited field value
    const saveEditValue = () => {
        if (editFieldValue) {
            updateFieldValue(editFieldValue, editValue);
            setEditFieldValue(null);
            setEditValue('');
        }
    };

    // Cancel editing value
    const cancelEditValue = () => {
        setEditFieldValue(null);
        setEditValue('');
    };

    const addNewField = () => {
        // Generate a default name like "New Field" (or "New Field 2", "New Field 3", ...)
        let baseName = 'New Field';
        let newName = baseName;
        let counter = 1;
        while (formData.hasOwnProperty(newName)) {
            counter++;
            newName = `${baseName} ${counter}`;
        }
        const newData = { ...formData, [newName]: '' };
        saveFormData(newData);
        toast.success('Field added');
    };

    // Delete a field
    const deleteField = (key) => {
        if (window.confirm(`Delete field "${key}"?`)) {
            const newData = { ...formData };
            delete newData[key];
            saveFormData(newData);
            toast.success('Field deleted');
        }
    };

    const confirmDelete = (key) => {
        setDeleteFieldKey(key);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteFieldKey) {
            const newData = { ...formData };
            delete newData[deleteFieldKey];
            saveFormData(newData);
            toast.success('Field deleted');
        }
        setShowDeleteModal(false);
        setDeleteFieldKey(null);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeleteFieldKey(null);
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
                        {form?.name || 'Form'}
                    </h1>
                    <h2 className="text-xl font-semibold" style={{ color: accent }}>
                        {collection?.name || 'Collection'}
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

            {/* Form Info */}
            <div className="mb-4 flex justify-between items-center">
                <p className="text-sm" style={{ color: accent }}>
                    Saved: {formatDate(form?.savedAt)}
                </p>
                <p className="text-sm" style={{ color: accent }}>
                    {Object.keys(formData).length} {Object.keys(formData).length === 1 ? 'field' : 'fields'}
                </p>
            </div>

            {/* Add Field Button (matching Add Collection/Form style) */}
            <button
                onClick={addNewField}
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
                Add Field
            </button>

            {/* Form Fields - Scrollable list */}
            <div
                className="overflow-y-auto form-fields-scroll flex-1"
                style={{ paddingRight: '8px' }}
            >
                {Object.keys(formData).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12" style={{ color: accent }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-50">
                            <path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="currentColor" />
                        </svg>
                        <p className="text-lg font-semibold">No fields yet</p>
                        <p className="text-sm mt-1">Add fields to store form data</p>
                    </div>
                ) : (
                    Object.entries(formData).map(([key, value]) => (
                        <div
                            key={key}
                            className="mb-4 p-4 rounded-xl transition-all duration-300 relative"
                            style={{
                                background: '#ffffff',
                                boxShadow: '0 4px 12px rgba(2, 26, 84, 0.1)',
                                border: `1px solid ${lightPink}`,
                            }}
                        >
                            {/* Field Name - editable inline */}
                            <div className="flex justify-between items-start mb-2">
                                {editingFieldKey === key ? (
                                    <input
                                        type="text"
                                        value={newFieldKey}
                                        onChange={(e) => setNewFieldKey(e.target.value)}
                                        onBlur={() => renameFieldKey(key, newFieldKey)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') renameFieldKey(key, newFieldKey);
                                            if (e.key === 'Escape') setEditingFieldKey(null);
                                        }}
                                        autoFocus
                                        className="text-lg font-semibold px-2 py-1 rounded border"
                                        style={{
                                            color: primary,
                                            borderColor: accent,
                                            outline: 'none',
                                            width: 'auto',
                                        }}
                                    />
                                ) : (
                                    <h3
                                        className="text-lg font-semibold cursor-default"
                                        style={{ color: primary }}
                                        title="Click to rename field"
                                        onClick={() => {
                                            setEditingFieldKey(key);
                                            setNewFieldKey(key);
                                        }}
                                    >
                                        {key}
                                    </h3>
                                )}
                                <div className="flex gap-2">
                                    {/* Edit Value Button */}
                                    <button
                                        onClick={() => startEditValue(key, value)}
                                        className="p-1 rounded-full transition-all duration-300 cursor-pointer"
                                        style={{ background: 'transparent' }}
                                        title="Edit value"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = lightPink;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill={primary} />
                                        </svg>
                                    </button>
                                    {/* Delete Field Button */}
                                    <button
                                        onClick={() => confirmDelete(key)}
                                        className="p-1 rounded-full transition-all duration-300 cursor-pointer"
                                        style={{ background: 'transparent' }}
                                        title="Delete field"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#ffcccc';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#dc3545" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Field Value - Editable */}
                            {editFieldValue === key ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={saveEditValue}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEditValue();
                                            if (e.key === 'Escape') cancelEditValue();
                                        }}
                                        autoFocus
                                        className="flex-1 px-3 py-2 rounded-lg border"
                                        style={{
                                            color: primary,
                                            borderColor: accent,
                                            outline: 'none',
                                            background: lightGray,
                                        }}
                                    />
                                    <button
                                        onClick={saveEditValue}
                                        className="px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer"
                                        style={{
                                            background: primary,
                                            color: '#ffffff',
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEditValue}
                                        className="px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer"
                                        style={{
                                            background: 'transparent',
                                            border: `2px solid ${primary}`,
                                            color: primary,
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <p
                                    className="text-sm p-2 rounded-lg break-all"
                                    style={{
                                        color: accent,
                                        background: lightGray,
                                    }}
                                >
                                    {typeof value === 'object' ? JSON.stringify(value) : (value || '(empty)')}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Scrollbar Styles */}
            <style>{`
                .form-fields-scroll::-webkit-scrollbar {
                    width: 8px;
                }
                .form-fields-scroll::-webkit-scrollbar-track {
                    background: ${lightGray};
                    border-radius: 4px;
                }
                .form-fields-scroll::-webkit-scrollbar-thumb {
                    background: ${accent};
                    border-radius: 4px;
                }
                .form-fields-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${primary};
                }
            `}</style>

            {/* Delete Field Confirmation Modal */}
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
                            Delete Field
                        </h3>
                        <p className="mb-6" style={{ color: primary }}>
                            Are you sure you want to delete field "{deleteFieldKey}"?
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

export default Form;