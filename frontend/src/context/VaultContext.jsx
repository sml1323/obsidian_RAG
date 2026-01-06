import { createContext, useContext, useState, useCallback } from 'react';

export const VaultContext = createContext(null);

/**
 * VaultProvider - Provides vault connection state to child components
 */
export function VaultProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [vaultPath, setVaultPath] = useState(null);
    const [fileCount, setFileCount] = useState(0);
    const [tree, setTree] = useState(null);

    const connect = useCallback((data) => {
        setIsConnected(true);
        setVaultPath(data.path);
        setFileCount(data.file_count);
    }, []);

    const setVaultTree = useCallback((treeData) => {
        setTree(treeData);
    }, []);

    const disconnect = useCallback(() => {
        setIsConnected(false);
        setVaultPath(null);
        setFileCount(0);
        setTree(null);
    }, []);

    const value = {
        isConnected,
        vaultPath,
        fileCount,
        tree,
        connect,
        setVaultTree,
        disconnect,
    };

    return (
        <VaultContext.Provider value={value}>
            {children}
        </VaultContext.Provider>
    );
}

/**
 * useVault - Hook to access vault context
 */
export function useVault() {
    const context = useContext(VaultContext);
    if (!context) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
}
