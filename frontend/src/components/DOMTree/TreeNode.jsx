// src/components/DOMTree/TreeNode.jsx
import React from 'react';

const TreeNode = ({ node, path, expandedNodes, toggleNode }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[path] !== false;

    return (
        <div className="ml-3 border-l-2 border-[#FFCEE3] pl-2 my-1">
            {/* Opening tag */}
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

            {/* Children (only if expanded) */}
            {isExpanded && hasChildren && (
                <>
                    {node.children.map((child, i) => (
                        <TreeNode
                            key={i}
                            node={child}
                            path={`${path}-${i}`}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                        />
                    ))}
                </>
            )}

            {/* Closing tag (always shown for nodes with children) */}
            {hasChildren && (
                <div className="flex items-center gap-1 mt-1">
                    <span className="w-4"></span>
                    <span className="text-[10px] font-black text-[#021A54] bg-[#FFCEE3]/50 px-1 rounded">
                        &lt;/{node.tagName}&gt;
                    </span>
                </div>
            )}
        </div>
    );
};

export default TreeNode;