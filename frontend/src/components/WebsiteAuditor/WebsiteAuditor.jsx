import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const WebsiteAuditor = ({ theme = {}, onBack }) => {
    const {
        primary = '#021a54',
        accent = '#f472b6',
        lightPink = '#fce7f3',
        lightGray = '#f3f4f6'
    } = theme;

    const [issues, setIssues] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedIssue, setExpandedIssue] = useState(null);
    const [errorDetails, setErrorDetails] = useState(null);
    const activeTabId = useRef(null);

    const isTabAnalyzable = async (tab) => {
        if (!tab.url) {
            return { analyzable: false, reason: 'Tab URL is not available' };
        }

        const unanalyzablePatterns = [
            'chrome://',
            'about:',
            'edge://',
            'firefox://',
            'data:',
            'file://localhost/extensions/'
        ];

        const isUnanalyzable = unanalyzablePatterns.some(pattern =>
            tab.url.toLowerCase().startsWith(pattern)
        );

        if (isUnanalyzable) {
            return {
                analyzable: false,
                reason: `Cannot analyze ${tab.url.split('://')[0]} pages. Try a regular website.`
            };
        }

        return { analyzable: true };
    };

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        setErrorDetails(null);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            activeTabId.current = tab.id;   // store for hover actions

            if (!tab) {
                toast.error('No active tab found');
                setIsAnalyzing(false);
                return;
            }

            // FIXED: Check if tab is analyzable
            const { analyzable, reason } = await isTabAnalyzable(tab);
            if (!analyzable) {
                toast.error(reason, { duration: 4000 });
                setIsAnalyzing(false);
                return;
            }

            try {
                // Send message to content script
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'runWebsiteAuditor'
                });

                if (response && response.success) {
                    setIssues(response.issues);
                    setErrorDetails(null);
                    toast.success(`✓ Analysis complete – ${response.issues.length} issues found`, {
                        duration: 2000
                    });
                } else {
                    const errorMsg = response?.error || 'Analysis returned no data';
                    setErrorDetails(errorMsg);
                    toast.error('Analysis failed', { duration: 4000 });
                    setIssues([]);
                }
            } catch (msgErr) {
                // Content script not loaded or other communication error
                if (msgErr.message.includes('Could not establish connection')) {
                    const detailMsg = 'Content script not loaded. Please refresh the page and try again.';
                    setErrorDetails(detailMsg);
                    toast.error(detailMsg, { duration: 4000 });
                } else if (msgErr.message.includes('The tab was closed')) {
                    toast.error('Tab was closed. Please try again.', { duration: 4000 });
                } else {
                    setErrorDetails(msgErr.message);
                    toast.error(`Error: ${msgErr.message}`, { duration: 4000 });
                }
                setIssues([]);
            }
        } catch (err) {
            console.error('Performance analysis error:', err);
            const errorMsg = 'Could not communicate with the page. Is the extension properly installed?';
            setErrorDetails(errorMsg);
            toast.error(errorMsg, { duration: 4000 });
            setIssues([]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const filteredIssues = useMemo(() =>
        activeCategory === 'all'
            ? issues
            : issues.filter(issue => issue.category === activeCategory),
        [issues, activeCategory]
    );

    const counts = useMemo(() =>
        issues.reduce((acc, issue) => {
            acc[issue.category] = (acc[issue.category] || 0) + 1;
            return acc;
        }, {}),
        [issues]
    );

    const getCategoryColor = (category) => {
        switch (category) {
            case 'performance': return '#fbbf24';
            case 'accessibility': return '#34d399';
            case 'code-quality': return '#60a5fa';
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
                className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2"
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

    const toggleIssue = (id) => {
        setExpandedIssue(expandedIssue === id ? null : id);
    };

    const IconLocation = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
    );

    const IconSuggestion = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
            <path d="M12 2a7 7 0 0 0-7 7c0 2.4.8 4.5 2 6.2V20h10v-4.8c1.2-1.7 2-3.8 2-6.2a7 7 0 0 0-7-7z"></path>
        </svg>
    );

    const IconCodeFix = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
    );

    const IconImpact = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10"></path>
            <path d="M12 20V4"></path>
            <path d="M6 20v-6"></path>
        </svg>
    );

    const IconPerformance = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h5l-1 8 9-12h-5l1-8z" /></svg>
    );

    const IconAccessibility = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 7h-2.74c.42 1.05.67 2.17.74 3.35L18 14l-1.53-2.21c-.38.67-.82 1.3-1.31 1.88L17 18h-2l-1-3.25h-.5L12 18h-2l1.84-4.33A9.001 9.001 0 0 1 10.53 11.8L9 14l.01-1.65C9.54 11.36 10.22 10.45 11 9.61V9H5V7h6V5.5l1-1 1 1V7h6v2z" />
        </svg>
    );

    const IconSEO = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    );

    return (
        <div
            className="flex flex-col"
            style={{
                background: `linear-gradient(135deg, ${lightGray} 0%, #ffffff 100%)`,
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {/* Header unchanged */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: primary }}>
                        Website Auditor
                    </h1>
                    <h2 className="text-xl font-semibold" style={{ color: accent }}>
                        Smart Analysis
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
                {['all', 'performance', 'accessibility', 'code-quality'].map(cat => (
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
                        {cat === 'all' && issues.length > 0 ? ` (${issues.length})` : ''}
                    </button>
                ))}
            </div>

            {/* Action Button with Loading State */}
            <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-2 mb-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer w-full"
                style={{
                    background: '#ffffff',
                    border: `2px dashed ${primary}`,
                    color: primary,
                    opacity: isAnalyzing ? 0.6 : 1,
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                    if (!isAnalyzing) {
                        e.currentTarget.style.background = lightPink;
                        e.currentTarget.style.borderColor = accent;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isAnalyzing) {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = primary;
                    }
                }}
            >
                {isAnalyzing ? (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-spin">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity="0.8" />
                        </svg>
                        <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"
                                stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                        <span>Run Smart Analysis</span>
                    </>
                )}
            </button>

            {/* Error Message Display */}
            {errorDetails && (
                <div
                    className="mb-3 p-3 rounded-lg text-xs"
                    style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: `1px solid #fecaca`
                    }}
                >
                    <p className="font-semibold mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Error Details:
                    </p>
                    <p>{errorDetails}</p>
                </div>
            )}

            {/* Issues List */}
            <div className="flex-1 overflow-y-auto custom-scroll pr-1" style={{ maxHeight: '320px' }}>
                {!isAnalyzing && issues.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: lightPink }}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={primary}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-bold uppercase" style={{ color: primary }}>No issues yet</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: accent }}>
                            Run analysis to discover problems
                        </p>
                    </div>
                )}

                {filteredIssues.map(issue => {
                    const isExpanded = expandedIssue === issue.id;
                    const categoryColor = getCategoryColor(issue.category);

                    return (
                        <div
                            key={issue.id}
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
                                onClick={() => toggleIssue(issue.id)}
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
                                            {issue.title}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                                            style={{ background: lightPink, color: primary }}>
                                            {issue.category.replace('-', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs mt-1 line-clamp-2" style={{ color: accent }}>
                                        {issue.description}
                                    </p>
                                </div>
                                <button
                                    className="text-lg font-black shrink-0"
                                    style={{ color: primary }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleIssue(issue.id);
                                    }}
                                >
                                    {isExpanded ? '▲' : '▼'}
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div
                                    className="px-3 pb-3 pt-0 border-t animate-in fade-in"
                                    style={{ borderColor: lightPink }}
                                >
                                    {/* Location */}
                                    <div className="mt-3">
                                        <p className="flex text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            <IconLocation />
                                            <span className="ml-1">Location</span>
                                        </p>
                                        <p
                                            className="text-xs font-mono mt-1 break-all cursor-pointer"
                                            style={{ color: primary }}
                                            onMouseEnter={() => {
                                                if (activeTabId.current && issue.location.element) {
                                                    chrome.tabs.sendMessage(activeTabId.current, {
                                                        action: 'highlightElement',
                                                        selector: issue.location.element
                                                    }).catch(() => { }); // ignore disconnection errors
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                if (activeTabId.current && issue.location.element) {
                                                    chrome.tabs.sendMessage(activeTabId.current, {
                                                        action: 'unhighlightElement',
                                                        selector: issue.location.element
                                                    }).catch(() => { });
                                                }
                                            }}
                                        >
                                            {issue.location.element}
                                        </p>
                                    </div>

                                    {/* Suggestion */}
                                    <div className="mt-3">
                                        <p className="flex text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            <IconSuggestion />
                                            <span className="ml-1">Suggestion</span>
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: primary }}>
                                            {issue.suggestion}
                                        </p>
                                    </div>

                                    {/* Code Fix */}
                                    <div className="mt-3">
                                        <p className="flex text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            <IconCodeFix />
                                            <span className="ml-1">Code Fix</span>
                                        </p>
                                        <pre className="text-xs mt-1 p-2 rounded-lg overflow-x-auto" style={{
                                            background: lightGray,
                                            color: primary,
                                            border: `1px solid ${lightPink}`
                                        }}>
                                            <code>{issue.codeFix}</code>
                                        </pre>
                                    </div>

                                    {/* Impact */}
                                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                                        <p className="text-[10px] font-bold uppercase tracking-wider flex items-center" style={{ color: accent }}>
                                            <IconImpact />
                                            <span className="ml-1">Impact</span>
                                        </p>
                                        {issue.impact.performance && issue.impact.performance !== 'none' && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: primary }}>
                                                <IconPerformance />
                                                <span>Perf</span>
                                                {getImpactBadge(issue.impact.performance)}
                                            </div>
                                        )}
                                        {issue.impact.accessibility && issue.impact.accessibility !== 'none' && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: primary }}>
                                                <IconAccessibility />
                                                <span>A11y</span>
                                                {getImpactBadge(issue.impact.accessibility)}
                                            </div>
                                        )}
                                        {issue.impact.seo && issue.impact.seo !== 'none' && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: primary }}>
                                                <IconSEO />
                                                <span>SEO</span>
                                                {getImpactBadge(issue.impact.seo)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Scrollbar Styles – now includes horizontal styling */}
            <style>{`
                .custom-scroll::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;   /* horizontal scrollbar same thickness */
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
                /* Horizontal thumb uses same styles automatically, but ensure consistency */
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

export default WebsiteAuditor;