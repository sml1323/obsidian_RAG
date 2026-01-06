import { useState, useEffect } from 'react';

export function ModelSelector({
    modelType,
    setModelType,
    apiKey,
    setApiKey,
    modelName,
    setModelName,
    variant = 'embedding' // 'embedding' | 'chat'
}) {
    const isChat = variant === 'chat';
    const title = isChat ? 'Chat Model' : 'Embedding Model';

    // Default model names if not provided
    useEffect(() => {
        if (isChat && !modelName) {
            setModelName?.(modelType === 'local' ? 'llama3.1' : 'gpt-3.5-turbo');
        }
    }, [isChat, modelType, modelName, setModelName]);

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {title}
            </h2>

            <div className="space-y-3">
                {/* Model Selection */}
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name={`model-${variant}`}
                            value="local"
                            checked={modelType === 'local'}
                            onChange={(e) => setModelType(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-600"
                        />
                        <div className="flex flex-col">
                            <span className="text-white font-medium">
                                {isChat ? 'Local (Ollama)' : 'Local (BAAI/bge-m3)'}
                            </span>
                            <span className="text-xs text-slate-400">
                                {isChat ? 'Runs locally, requires Ollama' : 'Runs locally, initial download required'}
                            </span>
                        </div>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name={`model-${variant}`}
                            value="openai"
                            checked={modelType === 'openai'}
                            onChange={(e) => setModelType(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-600"
                        />
                        <div className="flex flex-col">
                            <span className="text-white font-medium">
                                {isChat ? 'OpenAI (GPT)' : 'OpenAI (text-embedding-3-small)'}
                            </span>
                            <span className="text-xs text-slate-400">Cloud-based, requires API Key</span>
                        </div>
                    </label>
                </div>

                {/* Model Name Input (Chat parameters) */}
                {isChat && setModelName && (
                    <div className="mt-2 animate-fadeIn">
                        <label className="block text-xs text-slate-400 mb-1">Model Name</label>
                        <input
                            type="text"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            placeholder={modelType === 'local' ? "llama3.1" : "gpt-3.5-turbo"}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md 
                                     text-white placeholder-slate-500 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}

                {/* API Key Input */}
                {modelType === 'openai' && (
                    <div className="mt-2 animate-fadeIn">
                        <label className="block text-xs text-slate-400 mb-1">OpenAI API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md 
                                     text-white placeholder-slate-500 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
