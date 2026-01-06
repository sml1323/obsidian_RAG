import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:8000';

/**
 * VaultConnector Component
 * Allows users to input an Obsidian vault path and connect to it.
 */
export function VaultConnector({ onConnect }) {
    const [path, setPath] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [fileCount, setFileCount] = useState(0);

    const handleConnect = useCallback(async () => {
        if (!path.trim()) {
            setStatus('error');
            setMessage('경로를 입력해주세요');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${API_BASE}/api/vault/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: path.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '연결에 실패했습니다');
            }

            setStatus('success');
            setMessage(data.message);
            setFileCount(data.file_count);

            if (onConnect) {
                onConnect(data);
            }
        } catch (error) {
            setStatus('error');
            setMessage(error.message || '연결 중 오류가 발생했습니다');
        }
    }, [path, onConnect]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleConnect();
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-white mb-3">
                Obsidian Vault 연결
            </h2>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="/path/to/your/vault"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-md 
                     text-white placeholder-slate-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={status === 'loading'}
                    data-testid="vault-path-input"
                />
                <button
                    onClick={handleConnect}
                    disabled={status === 'loading'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                     text-white font-medium rounded-md transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    data-testid="connect-button"
                >
                    {status === 'loading' ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            연결 중...
                        </span>
                    ) : (
                        '연결'
                    )}
                </button>
            </div>

            {/* Status Message */}
            {status !== 'idle' && status !== 'loading' && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'
                    }`} data-testid="status-message">
                    {status === 'success' ? (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{message} ({fileCount}개 파일)</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{message}</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
