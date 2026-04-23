// src/components/DOMTree.jsx
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import TreeNode from "./TreeNode";

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
        setExpandedNodes(prev => {
            const currentlyExpanded = prev[path] !== false;
            return { ...prev, [path]: !currentlyExpanded };
        });
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
            {/* Header */}
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

            {/* Hint */}
            <p className="text-sm mb-3" style={{ color: accent }}>
                Click ▼/▶ to Expand/Compress
            </p>

            {/* Start Analysis Button */}
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
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"
                        stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </button>

            {/* DOM Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden domtree-scroll pr-1">
                {domAnalysis && (
                    <>
                        {domAnalysis.error ? (
                            <div
                                className="p-4 rounded-lg border-2"
                                style={{
                                    background: '#ffffff',
                                    borderColor: accent,
                                    color: primary,
                                }}
                            >
                                <p className="font-semibold text-xl uppercase" style={{ color: accent }}>Error</p>
                                <p className="text-sm mt-1 font-semibold">{domAnalysis.error}</p>
                                {domAnalysis.details && (
                                    <p className="text-xs mt-1 opacity-60">{domAnalysis.details}</p>
                                )}
                            </div>
                        ) : (
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    background: '#ffffff',
                                    boxShadow: '0 4px 12px rgba(2, 26, 84, 0.1)',
                                    border: `1px solid ${lightPink}`,
                                }}
                            >
                                {domAnalysis.treeData ? (
                                    <TreeNode
                                        node={domAnalysis.treeData}
                                        path="root"
                                        expandedNodes={expandedNodes}
                                        toggleNode={toggleNode}
                                    />
                                ) : (
                                    <span className="text-sm font-bold opacity-50 italic">No tree data available</span>
                                )}
                            </div>
                        )}
                    </>
                )}

                {!domAnalysis && !isAnalyzing && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                            style={{ background: lightPink }}
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={primary}>
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-bold uppercase" style={{ color: primary }}>
                            Ready to scan
                        </p>
                        <p className="text-sm font-semibold mt-1" style={{ color: accent }}>
                            Works only on localhost
                        </p>
                    </div>
                )}
            </div>

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