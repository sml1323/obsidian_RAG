import { useState, useCallback } from 'react';
import { VaultProvider, useVault } from './context/VaultContext'
import { VaultConnector } from './components/VaultConnector'
import { SyncButton } from './components/SyncButton'
import { ModelSelector } from './components/ModelSelector'
import { FolderTree } from './components/FolderTree'
import { FileItem } from './components/FileItem'
import { ChatInterface } from './components/ChatInterface'
import './index.css'

const API_BASE = 'http://localhost:8000';

export function AppContent() {
  const { isConnected, vaultPath, fileCount, tree, connect, setVaultTree } = useVault();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Embedding specific state
  const [modelType, setModelType] = useState('local'); // 'local' | 'openai'
  const [apiKey, setApiKey] = useState('');

  // Chat specific state configuration
  const [viewMode, setViewMode] = useState('files'); // 'files' | 'chat'
  const [chatModelType, setChatModelType] = useState('local');
  const [chatApiKey, setChatApiKey] = useState('');
  const [chatModelName, setChatModelName] = useState('');

  const handleConnect = useCallback(async (data) => {
    connect(data);
    // Fetch file tree after connection
    try {
      const response = await fetch(`${API_BASE}/api/vault/files`);
      const result = await response.json();
      if (result.success) {
        setVaultTree(result.tree);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  }, [connect, setVaultTree]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE}/api/vault/files`);
      const result = await response.json();
      if (result.success) {
        setVaultTree(result.tree);
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [setVaultTree]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto bg-slate-950 rounded-xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)]">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Obsidian Vault Explorer</h1>
            {isConnected && (
              <span className="ml-3 text-sm text-slate-400 border-l border-slate-700 pl-3">
                {fileCount} files
              </span>
            )}
          </div>

          {/* View Toggle */}
          {isConnected && (
            <div className="flex bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('files')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'files'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Files
              </button>
              <button
                onClick={() => setViewMode('chat')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'chat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Chat Mode
              </button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-80 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
            <VaultConnector onConnect={handleConnect} />

            {isConnected && (
              <>
                <div className="flex-1 overflow-y-auto min-h-[200px]">
                  <FolderTree
                    tree={tree}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    onFileSelect={(file) => {
                      setSelectedFile(file);
                      if (viewMode === 'chat') setViewMode('files'); // optional: auto-switch
                    }}
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  {viewMode === 'files' ? (
                    <>
                      <ModelSelector
                        modelType={modelType}
                        setModelType={setModelType}
                        apiKey={apiKey}
                        setApiKey={setApiKey}
                        variant="embedding"
                      />
                      <SyncButton
                        modelType={modelType}
                        apiKey={apiKey}
                      />
                    </>
                  ) : (
                    <ModelSelector
                      modelType={chatModelType}
                      setModelType={setChatModelType}
                      apiKey={chatApiKey}
                      setApiKey={setChatApiKey}
                      modelName={chatModelName}
                      setModelName={setChatModelName}
                      variant="chat"
                    />
                  )}
                </div>
              </>
            )}
          </aside>

          {/* Main Panel */}
          <main className="flex-1 overflow-y-auto bg-slate-950 relative">
            {viewMode === 'files' ? (
              selectedFile ? (
                <div className="p-6">
                  <div className="max-w-3xl mx-auto">
                    <FileItem file={selectedFile} isSelected />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Select a file from the tree</p>
                  </div>
                </div>
              )
            ) : (
              <ChatInterface
                config={{
                  type: chatModelType,
                  api_key: chatApiKey,
                  model_name: chatModelName
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <VaultProvider>
      <AppContent />
    </VaultProvider>
  );
}

export default App
