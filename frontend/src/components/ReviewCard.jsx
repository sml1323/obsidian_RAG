
import React from 'react';
import { formatTimeAgo } from '../utils/formatTime';

export default function ReviewCard({ note, onOpen }) {
    // If formatTimeAgo util exists, use it, otherwise simple date map
    // I noticed utils/formatTime.js in file list, trying to use it if applicable or just standard date
    const formattedDate = new Date(note.modified).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <button
            onClick={() => onOpen(note)}
            className="w-full text-left bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-md hover:shadow-lg hover:border-blue-500/50 hover:bg-slate-750 transition-all group flex flex-col gap-2"
        >
            <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="font-medium text-slate-200 group-hover:text-blue-400 truncate transition-colors">
                        {note.name}
                    </h3>
                </div>
            </div>

            <div className="flex items-center justify-between w-full text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                <span className="truncate max-w-[60%] font-mono opacity-80" title={note.path}>{note.path}</span>
                <span>{formattedDate}</span>
            </div>
        </button>
    );
}
