// src/components/DOMTree.jsx
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const DOMTree = ({ theme, onBack }) => {
    const { primary, accent, lightPink, lightGray } = theme;

    const [domAnalysis, setDomAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState({});

    const analyzeDOM = async () => {
        setIsAnalyzing(true);
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url.includes('localhost') && !tab.url.includes('127.0.0.1')) {
                toast.error('DOM Tree only works on localhost');
                setDomAnalysis({
                    error: "DOM Tree only works on localhost",
                    current_url: tab.url,
                    tip: "Test on http://localhost"
                });
                setIsAnalyzing(false);
                return;
            }

            const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzeDOM' });

            if (response && response.success) {
                setDomAnalysis(response.data);
                setExpandedNodes({});
                toast.success('DOM analysis complete');
            } else {
                toast.error(response?.error || 'Analysis failed');
                setDomAnalysis({ error: response?.error || "Unknown error" });
            }
        } catch (e) {
            toast.error('Could not connect to page. Refresh and try again.');
            setDomAnalysis({
                error: "Could not connect to page. Make sure you're on localhost and refresh the page.",
                details: e.message
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleNode = (path) => {
        setExpandedNodes(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const TreeNode = ({ node, path = 'root' }) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes[path] !== false;

        return (
            <div className="ml-3 border-l-2 border-[#FFCEE3] pl-2 my-1">
                <div className="flex items-center gap-1">
                    {hasChildren && (
                        <button
                            onClick={() => toggleNode(path)}
                            className="text-[10px] font-black text-[#FF85BB] hover:text-[#021A54] focus:outline-none w-4 h-4 flex items-center justify-center cursor-pointer"
                        >
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    )}
                    {!hasChildren && <span className="w-4"></span>}
                    <span className="text-[10px] font-black text-[#021A54] bg-[#FFCEE3]/50 px-1 rounded">
                        &lt;{node.tagName}&gt;
                    </span>
                    {hasChildren && (
                        <span className="text-[8px] text-[#FF85BB] font-bold">
                            ({node.children.length})
                        </span>
                    )}
                </div>
                {isExpanded && hasChildren && node.children.map((child, i) => (
                    <TreeNode key={i} node={child} path={`${path}-${i}`} />
                ))}
            </div>
        );
    };

    const StatCard = ({ val, label }) => (
        <div className="bg-[#FFCEE3]/30 p-2 rounded border border-[#FFCEE3] min-w-0">
            <div className="text-sm font-black text-[#021A54] leading-tight truncate">{val}</div>
            <div className="text-[9px] uppercase tracking-wider text-[#021A54] opacity-70 font-bold truncate">{label}</div>
        </div>
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
            {/* Header with Back Button on right */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: primary }}>
                        DOM Tree
                    </h1>
                    <h2 className="text-xl font-semibold" style={{ color: accent }}>
                        Analysis
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

            {/* Start Analysis Button – EXACTLY like Add Collection */}
            <button
                onClick={analyzeDOM}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-2 mb-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer"
                style={{
                    background: '#ffffff',
                    border: `2px dashed ${primary}`,
                    color: primary,
                    opacity: isAnalyzing ? 0.7 : 1,
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C11.01 14 13 12.01 13 9.5S11.01 5 9.5 5 6 6.99 6 9.5 7.99 14 9.5 14z" fill="currentColor" />
                </svg>
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </button>

            {/* Rest of component remains identical */}
            {domAnalysis && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden domtree-scroll pr-1">
                    {domAnalysis.error ? (
                        <div
                            className="p-4 rounded-lg border-2"
                            style={{
                                background: '#ffffff',
                                borderColor: accent,
                                color: primary,
                            }}
                        >
                            <p className="font-black text-xs uppercase">⚠️ Error</p>
                            <p className="text-sm mt-1 font-bold">{domAnalysis.error}</p>
                            {domAnalysis.details && (
                                <p className="text-xs mt-1 opacity-60">{domAnalysis.details}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3 pb-4">
                            {/* DOM Tree Card */}
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    background: '#ffffff',
                                    boxShadow: '0 4px 12px rgba(2, 26, 84, 0.1)',
                                    border: `1px solid ${lightPink}`,
                                }}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <h3
                                        className="text-sm font-black uppercase tracking-widest"
                                        style={{ color: accent }}
                                    >
                                        🌲 DOM TREE
                                    </h3>
                                    <span className="text-[8px] font-bold opacity-40" style={{ color: primary }}>
                                        CLICK ▼/▶ TO EXPAND/COMPRESS
                                    </span>
                                </div>
                                <div
                                    className="max-h-48 overflow-auto p-3 rounded-lg"
                                    style={{
                                        background: lightGray,
                                        border: `1px solid ${lightPink}`,
                                    }}
                                >
                                    {domAnalysis.treeData ? (
                                        <TreeNode node={domAnalysis.treeData} />
                                    ) : (
                                        <span className="text-sm font-bold opacity-50 italic">No tree data available</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: primary,
                                        boxShadow: '0 4px 12px rgba(2, 26, 84, 0.15)',
                                    }}
                                >
                                    <div className="text-2xl font-black text-white truncate">{domAnalysis.total_elements}</div>
                                    <div className="text-xs font-bold uppercase tracking-tighter" style={{ color: lightPink }}>
                                        Elements
                                    </div>
                                </div>
                                <div
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: accent,
                                        boxShadow: '0 4px 12px rgba(2, 26, 84, 0.1)',
                                    }}
                                >
                                    <div className="text-2xl font-black text-white truncate">{domAnalysis.dom_depth}</div>
                                    <div className="text-xs font-bold uppercase tracking-tighter" style={{ color: lightPink }}>
                                        DOM Depth
                                    </div>
                                </div>
                                {['divs', 'spans', 'paragraphs', 'headings', 'links', 'images', 'buttons', 'inputs', 'forms', 'tables'].map(k => (
                                    <StatCard key={k} val={domAnalysis[k]} label={k} />
                                ))}
                            </div>

                            {/* Footer Meta Card */}
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    background: '#ffffff',
                                    boxShadow: '0 4px 12px rgba(2, 26, 84, 0.1)',
                                    border: `1px solid ${lightPink}`,
                                }}
                            >
                                <div className="flex justify-between text-sm" style={{ color: primary }}>
                                    <span>Unique IDs:</span>
                                    <span className="font-bold">{domAnalysis.elements_with_id}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-2" style={{ color: primary }}>
                                    <span>Class Names:</span>
                                    <span className="font-bold">{domAnalysis.elements_with_class}</span>
                                </div>
                                <div
                                    className="text-center mt-4 text-xs opacity-40 uppercase tracking-widest border-t pt-3"
                                    style={{ borderColor: lightGray }}
                                >
                                    Scanned: {domAnalysis.timestamp}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!domAnalysis && !isAnalyzing && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                        style={{ background: lightPink }}
                    >
                        <svg className="w-8 h-8" fill="none" stroke={accent} viewBox="0 0 24 24">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-lg font-black uppercase tracking-widest" style={{ color: primary }}>
                        Ready to scan
                    </p>
                    <p className="text-sm font-bold mt-1 italic" style={{ color: accent }}>
                        Environment: Localhost
                    </p>
                </div>
            )}

            {/* Custom Scrollbar */}
            <style>{`
        .domtree-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .domtree-scroll::-webkit-scrollbar-track {
          background: ${lightGray};
          border-radius: 4px;
        }
        .domtree-scroll::-webkit-scrollbar-thumb {
          background: ${accent};
          border-radius: 4px;
        }
        .domtree-scroll::-webkit-scrollbar-thumb:hover {
          background: ${primary};
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

export default DOMTree;