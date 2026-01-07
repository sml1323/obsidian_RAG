import React, { useState, useEffect, useCallback } from 'react';
import { ProjectCard } from './ProjectCard';
import ReviewList from './ReviewList';

const API_BASE = 'http://localhost:8000/api';

export function ProjectList({ onSelectFile }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rootPath, setRootPath] = useState('Projects'); // Default per requirement
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/projects?root_path=${encodeURIComponent(rootPath)}`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data.projects || []);
        } catch (err) {
            setError(err.message);
            // If error (e.g. folder not found), we might want to clear projects or show error
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, [rootPath]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleUpdateProgress = async (path, newProgress) => {
        // Optimistic update
        setProjects(prev => prev.map(p =>
            p.path === path ? { ...p, progress: newProgress } : p
        ));

        try {
            const res = await fetch(`${API_BASE}/projects`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, progress: newProgress })
            });
            if (!res.ok) throw new Error('Failed to save progress');
        } catch (err) {
            console.error("Failed to update progress:", err);
            // Revert on error? Or just show toast. For PoC, console log is fine.
            // Ideally revert optimistic update...
        }
    };

    return (
        <div className="p-6 h-full flex flex-col" data-testid="project-list">
            <div className="mb-8">
                <ReviewList onOpen={onSelectFile} />
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Project Monitor
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {projects.length} active projects in <span className="font-mono text-slate-300">{rootPath}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1.5 pl-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Root</span>
                    <input
                        type="text"
                        value={rootPath}
                        onChange={(e) => setRootPath(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchProjects()}
                        className="bg-transparent text-sm text-white focus:outline-none w-32 md:w-48 placeholder-slate-600"
                        placeholder="Folder Path"
                    />
                    <button
                        onClick={fetchProjects}
                        className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
                        title="Refresh Projects"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <div className="text-red-400 mb-2">⚠️ {error}</div>
                    <p className="text-sm">Check if the folder path exists in your vault.</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p>No projects found in this folder.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8 pr-2">
                    {projects.map((proj) => (
                        <ProjectCard
                            key={proj.path}
                            name={proj.name}
                            fileCount={proj.file_count}
                            lastModified={proj.last_modified}
                            progress={proj.progress}
                            onProgressChange={(newVal) => handleUpdateProgress(proj.path, newVal)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
