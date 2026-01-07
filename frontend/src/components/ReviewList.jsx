
import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import ReviewCard from './ReviewCard';

const API_BASE = 'http://localhost:8000';

export default function ReviewList({ onOpen }) {
    const { isConnected, vaultPath } = useVault();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(5);

    const fetchReviews = async () => {
        if (!isConnected) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/reviews/random?count=${count}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [isConnected, count]); // Re-fetch if count changes or connection status changes

    if (!isConnected) return null;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Today's Review
                </h2>
                <div className="flex items-center gap-2">
                    <select
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 px-2 py-1 outline-none focus:border-indigo-500"
                    >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                    </select>
                    <button
                        onClick={fetchReviews}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="Shuffle Reviews"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {reviews.map((note) => (
                    <ReviewCard
                        key={note.path}
                        note={note}
                        onOpen={onOpen}
                    />
                ))}

                {reviews.length === 0 && !loading && (
                    <div className="col-span-full py-8 text-center text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                        No reviews available (check your vault content)
                    </div>
                )}
            </div>
        </div>
    );
}
