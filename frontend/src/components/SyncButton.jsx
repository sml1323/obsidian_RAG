import { useState } from 'react';

const API_BASE = 'http://localhost:8000';

export function SyncButton({ onSyncComplete, modelType, apiKey }) {
    const [status, setStatus] = useState('idle'); // idle, syncing, success, error
    const [message, setMessage] = useState('');

    const handleSync = async () => {
        if (status === 'syncing') return;

        if (modelType === 'openai' && !apiKey) {
            setStatus('error');
            setMessage('OpenAI API Key가 필요합니다');
            return;
        }

        setStatus('syncing');
        setMessage('임베딩 동기화 중...');

        try {
            const response = await fetch(`${API_BASE}/api/embeddings/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model_type: modelType,
                    api_key: apiKey
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '동기화 실패');
            }

            setStatus('success');
            setMessage(`완료: ${data.files_processed}개 파일 (${data.chunks_generated} 청크)`);

            if (onSyncComplete) {
                onSyncComplete(data);
            }

            // Reset status after 3 seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);

        } catch (error) {
            setStatus('error');
            setMessage(error.message || '오류 발생');
        }
    };

    return (
        <div className="mt-4 border-t border-slate-700 pt-4">
            <button
                onClick={handleSync}
                disabled={status === 'syncing'}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2
                    ${status === 'syncing' ? 'bg-indigo-700 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}
                    ${status === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
                    ${status === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
                    text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
                {status === 'syncing' && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {status === 'idle' && '임베딩 동기화 (Sync)'}
                {status === 'syncing' && '동기화 중...'}
                {status === 'success' && '동기화 완료'}
                {status === 'error' && '동기화 실패'}
            </button>

            {message && (
                <p className={`mt-2 text-xs text-center ${status === 'error' ? 'text-red-400' :
                    status === 'success' ? 'text-green-400' : 'text-slate-400'
                    }`}>
                    {message}
                </p>
            )}
        </div>
    );
}
