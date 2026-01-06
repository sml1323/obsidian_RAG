import { formatRelativeTime } from '../utils/formatTime';

/**
 * FileItem Component - Displays file details with metadata
 */
export function FileItem({ file, isSelected, onClick }) {
    return (
        <div
            onClick={() => onClick?.(file)}
            className={`p-3 rounded-lg cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'}`}
            data-testid="file-item"
        >
            <div className="flex items-start gap-3">
                {/* File Icon */}
                <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>

                <div className="flex-1 min-w-0">
                    {/* Filename */}
                    <h3 className="text-white font-medium truncate" data-testid="file-name">
                        {file.name}
                    </h3>

                    {/* File Path */}
                    <p className="text-slate-500 text-xs truncate mt-0.5" data-testid="file-path">
                        {file.path}
                    </p>

                    {/* Modified Time */}
                    <p className="text-slate-400 text-xs mt-1" data-testid="file-modified">
                        {formatRelativeTime(file.modified)}
                    </p>
                </div>
            </div>
        </div>
    );
}
