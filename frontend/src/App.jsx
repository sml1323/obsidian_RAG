import { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'


import { VaultProvider, useVault } from './context/VaultContext'
import { VaultConnector } from './components/VaultConnector'
import { SyncButton } from './components/SyncButton'
import { ModelSelector } from './components/ModelSelector'
import { FolderTree } from './components/FolderTree'
import { FileItem } from './components/FileItem'
import { ChatInterface } from './components/ChatInterface'
import { ProjectList } from './components/ProjectList'
import SettingsModal from './components/SettingsModal'
import './index.css'


const API_BASE = 'http://localhost:8000';

function FileViewer({ file }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file?.path) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // Determine if path is relative or absolute.
        // Our Scan logic returns relative paths usually, but file.path might be absolute depending on logic.
        // The API expects relative path usually? Or absolute? 
        // Let's pass the path we have. The backend handles security check.
        const res = await fetch(`${API_BASE}/api/vault/files/content?path=${encodeURIComponent(file.path)}`);
        if (!res.ok) throw new Error("Failed to load content");
        const data = await res.json();
        setContent(data.content);
      } catch (e) {
        setError(e.message);
        setContent('');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [file]);

  if (loading) return <div className="animate-pulse text-slate-500">Loading content...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return <ReactMarkdown>{content}</ReactMarkdown>;
}


export function AppContent() {
  const { isConnected, vaultPath, fileCount, tree, connect, setVaultTree } = useVault();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Embedding specific state
  const [modelType, setModelType] = useState('local'); // 'local' | 'openai'
  const [apiKey, setApiKey] = useState('');

  // Chat specific state configuration
  const [viewMode, setViewMode] = useState('files'); // 'files' | 'chat' | 'projects'
  const [chatModelType, setChatModelType] = useState('local');
  const [chatApiKey, setChatApiKey] = useState('');
  const [chatModelName, setChatModelName] = useState('');

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialVaultPath, setInitialVaultPath] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setInitialVaultPath(data.vault_path);

        // If connected or not, maybe we should try to connect if we have a path
        // But if we are already connected to same path, don't reconnect?
        // Actually, handleConnect handles idempotency check or failure?
        if (data.vault_path && !isConnected) {
          // Trigger auto-connect logic via effect or direct call?
          // Using effect on initialVaultPath change below handles it mostly, 
          // but we can force it here.
          await connectToVault(data.vault_path);
        }

        setModelType(data.model_type);
        if (data.api_keys?.openai) setApiKey(data.api_keys.openai);

        setChatModelType(data.model_type);
        if (data.api_keys?.openai) setChatApiKey(data.api_keys.openai);
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Re-trigger load and potential connect when settings change
  // Helper to Connect to Backend
  const connectToVault = async (path) => {
    try {
      const res = await fetch(`${API_BASE}/api/vault/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        connect(data); // Update Context

        // Fetch file tree immediately
        const treeRes = await fetch(`${API_BASE}/api/vault/files`);
        const treeData = await treeRes.json();
        if (treeData.success) {
          setVaultTree(treeData.tree);
        }
      }
    } catch (e) {
      console.error("Auto-connect failed", e);
    }
  };



  // Re-trigger load and potential connect when settings change
  const handleSettingsChanged = (newSettings) => {
    setInitialVaultPath(newSettings.vault_path);
    setModelType(newSettings.model_type);
    // Auto-connect if path changed or just force it
    if (newSettings.vault_path) {
      connectToVault(newSettings.vault_path);
    }
  };



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

          <div className="flex items-center gap-4">
            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
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
              <button
                onClick={() => setViewMode('projects')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'projects'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Projects
              </button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-80 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
            {!isConnected && !isLoadingSettings && (
              <VaultConnector
                onConnect={handleConnect}
                initialPath={initialVaultPath}
                autoConnect={!!initialVaultPath}
              />
            )}

            {isConnected && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm flex justify-between items-center">
                <span className="text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Connected
                </span>
                <span className="text-slate-400 text-xs truncate max-w-[140px]" title={vaultPath}>
                  {vaultPath}
                </span>
              </div>
            )}



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
                <div className="p-6 h-full flex flex-col">
                  <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                    <div className="mb-4 pb-4 border-b border-slate-800 flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedFile.name}</h2>
                        <p className="text-sm text-slate-500 font-mono">{selectedFile.path}</p>
                      </div>
                    </div>
                    <div className="prose prose-invert max-w-none flex-1 overflow-y-auto custom-scrollbar">
                      <FileViewer file={selectedFile} />
                    </div>
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
            ) : viewMode === 'chat' ? (
              <ChatInterface
                config={{
                  type: chatModelType,
                  api_key: chatApiKey,
                  model_name: chatModelName
                }}
              />
            ) : (
              <ProjectList onSelectFile={(file) => {
                setSelectedFile(file);
                setViewMode('files');
              }} />
            )}
          </main>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChanged={handleSettingsChanged}
      />

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
