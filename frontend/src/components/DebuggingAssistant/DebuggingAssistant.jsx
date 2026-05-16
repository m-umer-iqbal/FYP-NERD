import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const DebuggingAssistant = ({ theme = {}, onBack }) => {
    const {
        primary = '#021a54',
        accent = '#f472b6',
        lightPink = '#fce7f3',
        lightGray = '#f3f4f6'
    } = theme;

    const [errors, setErrors] = useState([]);
    const [monitoringActive, setMonitoringActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedError, setExpandedError] = useState(null);

    const activeTabId = useRef(null);

    // On mount: capture the active tab ID, then ask its content script for errors
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (!tab) return;
            activeTabId.current = tab.id;

            chrome.tabs.sendMessage(tab.id, { action: 'getErrors' }, (response) => {
                if (chrome.runtime.lastError) return;
                if (response && response.success) {
                    setErrors(response.errors || []);
                }
            });

            chrome.tabs.sendMessage(tab.id, { action: 'getMonitoringStatus' }, (res) => {
                if (chrome.runtime.lastError) return;
                if (res && res.success) {
                    setMonitoringActive(res.isMonitoring);
                }
            });
        });
    }, []);

    // Live subscription to errors – only accept those from the current tab
    useEffect(() => {
        const messageHandler = (message, sender) => {
            if (sender.tab && sender.tab.id === activeTabId.current) {
                if (message.type === 'ERRORS_UPDATED' && message.errors) {
                    setErrors(message.errors);
                }
            }
        };

        chrome.runtime.onMessage.addListener(messageHandler);
        return () => chrome.runtime.onMessage.removeListener(messageHandler);
    }, []);

    // Toggle monitoring start / stop
    const toggleMonitoring = useCallback(async () => {
        setIsLoading(true);
        const action = monitoringActive ? 'stopErrorMonitoring' : 'startErrorMonitoring';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                toast.error('No active tab found');
                setIsLoading(false);
                return;
            }

            const response = await chrome.tabs.sendMessage(tab.id, { action });

            if (response && response.success) {
                if (action === 'startErrorMonitoring') {
                    setErrors(response.errors || []);
                    setMonitoringActive(true);
                    toast.success('Monitoring started', { duration: 2000 });
                } else {
                    setMonitoringActive(false);
                    toast.success('Monitoring stopped', { duration: 2000 });
                }
            } else {
                toast.error(`Failed to ${monitoringActive ? 'stop' : 'start'} monitoring`, { duration: 4000 });
            }
        } catch (msgErr) {
            if (msgErr.message.includes('Could not establish connection')) {
                toast.error('Content script not loaded. Refresh the page and try again.', { duration: 4000 });
            } else {
                toast.error(`Error: ${msgErr.message}`, { duration: 4000 });
            }
        } finally {
            setIsLoading(false);
        }
    }, [monitoringActive]);

    // ---------------- Filtering & helpers (unchanged) ----------------
    const filteredErrors = useMemo(() =>
        activeCategory === 'all'
            ? errors
            : errors.filter(error => error.category === activeCategory),
        [errors, activeCategory]
    );

    const counts = useMemo(() =>
        errors.reduce((acc, error) => {
            acc[error.category] = (acc[error.category] || 0) + 1;
            return acc;
        }, {}),
        [errors]
    );

    const getCategoryColor = (category) => {
        switch (category) {
            case 'runtime-error': return '#ef4444';
            case 'syntax-error': return '#8b5cf6';
            case 'logic-error': return '#f59e0b';
            case 'type-error': return '#06b6d4';
            default: return accent;
        }
    };

    const getImpactBadge = (level) => {
        if (!level || level === 'none') return null;
        const colors = {
            high: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
            medium: { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
            low: { bg: '#e0e7ff', text: '#4f46e5', border: '#c7d2fe' }
        };
        const style = colors[level] || colors.low;
        return (
            <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                    background: style.bg,
                    color: style.text,
                    border: `1px solid ${style.border}`
                }}
            >
                {level.toUpperCase()}
            </span>
        );
    };

    const toggleError = (id) => {
        setExpandedError(expandedError === id ? null : id);
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
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: primary }}>
                        Debugging Assistant
                    </h1>
                    <h2 className="text-xl font-semibold" style={{ color: accent }}>
                        Console Error Explainer
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scroll">
                {['all', 'runtime-error', 'syntax-error', 'logic-error'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="px-2 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0"
                        style={{
                            background: activeCategory === cat ? primary : '#fff',
                            color: activeCategory === cat ? '#fff' : primary,
                            border: `1px solid ${primary}`,
                        }}
                        onMouseEnter={(e) => {
                            if (activeCategory !== cat) {
                                e.currentTarget.style.background = lightPink;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeCategory !== cat) {
                                e.currentTarget.style.background = '#fff';
                            }
                        }}
                    >
                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                        {cat !== 'all' && counts[cat] ? ` (${counts[cat]})` : ''}
                        {cat === 'all' && errors.length > 0 ? ` (${errors.length})` : ''}
                    </button>
                ))}
            </div>

            {/* Action Button – Start / Stop */}
            <button
                onClick={toggleMonitoring}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 mb-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer w-full"
                style={{
                    background: '#ffffff',
                    border: `2px dashed ${primary}`,
                    color: primary,
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.background = lightPink;
                        e.currentTarget.style.borderColor = accent;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = primary;
                    }
                }}
            >
                {isLoading ? (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-spin">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity="0.8" />
                        </svg>
                        <span>{monitoringActive ? 'Stopping...' : 'Starting...'}</span>
                    </>
                ) : (
                    <>
                        {monitoringActive ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                                </svg>
                                <span>Stop Monitoring</span>
                            </>
                        ) : (
                            <>
                                {/* Play icon replaces search icon */}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                <span>Start Monitoring</span>
                            </>
                        )}
                    </>
                )}
            </button>

            {/* Errors List (unchanged) */}
            <div className="flex-1 overflow-y-auto custom-scroll pr-1" style={{ maxHeight: '320px' }}>
                {!monitoringActive && errors.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: lightPink }}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={primary}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg font-bold uppercase" style={{ color: primary }}>No errors detected</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: accent }}>
                            Run monitoring to discover console errors
                        </p>
                    </div>
                )}

                {filteredErrors.map(error => {
                    const isExpanded = expandedError === error.id;
                    const categoryColor = getCategoryColor(error.category);

                    return (
                        <div
                            key={error.id}
                            className="mb-3 rounded-xl overflow-hidden transition-all duration-300"
                            style={{
                                background: '#ffffff',
                                boxShadow: '0 4px 12px rgba(2, 26, 84, 0.1)',
                                border: `1px solid ${lightPink}`,
                            }}
                        >
                            {/* Collapsed Header */}
                            <div
                                className="p-3 flex items-start gap-3 cursor-pointer"
                                onClick={() => toggleError(error.id)}
                                onMouseEnter={(e) => e.currentTarget.style.background = lightGray}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                style={{ transition: 'background 0.2s' }}
                            >
                                <div
                                    className="w-2 mt-1 rounded-full shrink-0"
                                    style={{ height: '20px', background: categoryColor }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-bold" style={{ color: primary }}>
                                            {error.type}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                                            style={{ background: lightPink, color: primary }}>
                                            {error.category.replace('-', ' ')}
                                        </span>
                                        {error.count > 1 && (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                style={{ background: accent + '20', color: accent }}>
                                                ×{error.count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs mt-1 line-clamp-2" style={{ color: accent }}>
                                        {error.message}
                                    </p>
                                </div>
                                <button
                                    className="text-lg font-black shrink-0"
                                    style={{ color: primary }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleError(error.id);
                                    }}
                                >
                                    {isExpanded ? '▲' : '▼'}
                                </button>
                            </div>

                            {/* Expanded Details – emojis replaced by SVG icons */}
                            {isExpanded && (
                                <div
                                    className="px-3 pb-3 pt-0 border-t animate-in fade-in"
                                    style={{ borderColor: lightPink }}
                                >
                                    {/* Location (SVG icon already present, unchanged) */}
                                    <div className="mt-3">
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            Location
                                        </div>
                                        <p
                                            className="text-xs font-mono mt-1 break-all"
                                            style={{ color: primary }}
                                        >
                                            {error.file}:{error.line}:{error.column}
                                        </p>
                                    </div>

                                    {/* Meaning */}
                                    <div className="mt-3">
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            {/* Lightbulb icon */}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 18h6" />
                                                <path d="M10 22h4" />
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V15a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" />
                                            </svg>
                                            What's Happening
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: primary }}>
                                            {error.meaning}
                                        </p>
                                    </div>

                                    {/* Root Causes */}
                                    <div className="mt-3">
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            {/* Search/magnifier icon */}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="11" cy="11" r="8" />
                                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                            </svg>
                                            Possible Causes
                                        </div>
                                        <ul className="list-disc list-inside text-xs mt-1" style={{ color: primary }}>
                                            {error.rootCauses.map((cause, i) => (
                                                <li key={i}>{cause}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Fixes */}
                                    <div className="mt-3">
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            {/* Wrench icon */}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" />
                                            </svg>
                                            Fix Suggestions
                                        </div>
                                        {error.fixes.map((fix, idx) => (
                                            <div key={idx} className="mt-2 p-2 rounded-lg" style={{ background: lightGray }}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold" style={{ color: primary }}>{fix.description}</span>
                                                    {getImpactBadge(fix.confidence)}
                                                </div>
                                                <pre className="text-xs mt-1 p-2 rounded overflow-x-auto" style={{
                                                    background: '#fff',
                                                    color: primary,
                                                    border: `1px solid ${lightPink}`,
                                                    fontFamily: 'monospace'
                                                }}>
                                                    <code>{fix.code}</code>
                                                </pre>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Impact */}
                                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            {/* Bar chart icon */}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="20" x2="18" y2="10" />
                                                <line x1="12" y1="20" x2="12" y2="4" />
                                                <line x1="6" y1="20" x2="6" y2="14" />
                                            </svg>
                                            Impact
                                        </div>
                                        {error.impact.functionality && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#d97706' }}>
                                                ⚠️ Breaks Functionality
                                            </span>
                                        )}
                                        {error.impact.crash && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>
                                                🔴 Runtime Crash
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Scrollbar Styles (unchanged) */}
            <style>{`
                .custom-scroll::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                  background: ${lightGray};
                  border-radius: 4px;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                  background: ${accent};
                  border-radius: 4px;
                  cursor: pointer;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                  background: ${primary};
                }
                .custom-scroll::-webkit-scrollbar-corner {
                  background: transparent;
                }

                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }

                .animate-spin {
                  animation: spin 1s linear infinite;
                }

                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }

                .animate-in.fade-in {
                  animation: fadeIn 0.2s ease-in;
                }

                .line-clamp-2 {
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
            `}</style>

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
};

export default DebuggingAssistant;