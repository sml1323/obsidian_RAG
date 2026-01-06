import { useState, useCallback } from 'react';

// PARA folder names for special styling
const PARA_FOLDERS = ['Project', 'Projects', 'Areas', 'Area', 'Resources', 'Resource', 'Archive', 'Archives'];

// PARA folder colors
const PARA_COLORS = {
    project: 'text-blue-400',
    area: 'text-green-400',
    resource: 'text-yellow-400',
    archive: 'text-slate-400',
};

function getPARAType(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('project')) return 'project';
    if (lowerName.startsWith('area')) return 'area';
    if (lowerName.startsWith('resource')) return 'resource';
    if (lowerName.startsWith('archive')) return 'archive';
    return null;
}

function isPARAFolder(name) {
    return PARA_FOLDERS.some(p => name.toLowerCase().startsWith(p.toLowerCase()));
}

/**
 * TreeNode Component - Renders a single folder or file in the tree
 */
function TreeNode({ node, level = 0, selectedPath, onSelect }) {
    const [isExpanded, setIsExpanded] = useState(level < 2);
    const isFolder = node.type === 'folder';
    const paraType = isFolder ? getPARAType(node.name) : null;
    const isSelected = selectedPath === node.path;

    const handleClick = () => {
        if (isFolder) {
            setIsExpanded(!isExpanded);
        } else {
            onSelect?.(node);
        }
    };

    return (
        <div className="select-none">
            <div
                onClick={handleClick}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors
          ${isSelected ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-slate-700/50'}
          ${paraType ? 'font-semibold' : ''}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                data-testid={isFolder ? 'folder-node' : 'file-node'}
            >
                {/* Expand/Collapse Icon for folders */}
                {isFolder && (
                    <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </span>
                )}

                {/* Folder/File Icon */}
                {isFolder ? (
                    <svg className={`w-4 h-4 ${paraType ? PARA_COLORS[paraType] : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                )}

                {/* Name */}
                <span className={`flex-1 truncate ${paraType ? PARA_COLORS[paraType] : 'text-slate-200'}`}>
                    {node.name}
                </span>

                {/* File count for folders */}
                {isFolder && node.file_count > 0 && (
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                        {node.file_count}
                    </span>
                )}
            </div>

            {/* Children */}
            {isFolder && isExpanded && node.children && (
                <div data-testid="folder-children">
                    {node.children.map((child, index) => (
                        <TreeNode
                            key={child.path || `${node.path}-${index}`}
                            node={child}
                            level={level + 1}
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * FolderTree Component - Main tree view for vault files
 */
export function FolderTree({ tree, onRefresh, isRefreshing, onFileSelect }) {
    const [selectedPath, setSelectedPath] = useState(null);

    const handleSelect = useCallback((node) => {
        setSelectedPath(node.path);
        onFileSelect?.(node);
    }, [onFileSelect]);

    if (!tree) {
        return (
            <div className="text-slate-400 text-center py-8">
                볼트를 연결하면 파일 목록이 표시됩니다.
            </div>
        );
    }

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg" data-testid="folder-tree">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <h2 className="font-semibold text-white">파일 목록</h2>
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
                    title="새로고침"
                    data-testid="refresh-button"
                >
                    <svg
                        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Tree Content */}
            <div className="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {tree.children && tree.children.length > 0 ? (
                    tree.children.map((child, index) => (
                        <TreeNode
                            key={child.path || index}
                            node={child}
                            level={0}
                            selectedPath={selectedPath}
                            onSelect={handleSelect}
                        />
                    ))
                ) : (
                    <div className="text-slate-400 text-center py-4 text-sm">
                        마크다운 파일이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
