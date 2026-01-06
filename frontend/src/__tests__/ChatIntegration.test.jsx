import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { AppContent } from '../App';
import { VaultContext } from '../context/VaultContext';

// Mock child components to isolate tests
vi.mock('../components/FolderTree', () => ({
    FolderTree: () => <div data-testid="folder-tree">Folder Tree</div>
}));
vi.mock('../components/VaultConnector', () => ({
    VaultConnector: () => <div data-testid="vault-connector">Vault Connector</div>
}));
vi.mock('../components/SyncButton', () => ({
    SyncButton: () => <div data-testid="sync-button">Sync</div>
}));
vi.mock('../components/ModelSelector', () => ({
    ModelSelector: ({ modelType, setModelType }) => (
        <div data-testid="model-selector">
            <button onClick={() => setModelType('openai')}>Switch to OpenAI</button>
        </div>
    )
}));

// Mock fetch
global.fetch = vi.fn();

const mockVaultContext = {
    isConnected: true,
    vaultPath: '/test/vault',
    fileCount: 10,
    tree: [],
    connect: vi.fn(),
    setVaultTree: vi.fn(),
};

describe('Chat UI Integration', () => {
    beforeEach(() => {
        fetch.mockClear();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    const renderApp = () => {
        return render(
            <VaultContext.Provider value={mockVaultContext}>
                <AppContent />
            </VaultContext.Provider>
        );
    };

    test('toggles between file view and chat mode', () => {
        renderApp();

        // Initially should be in file view (default)
        expect(screen.queryByTestId('chat-interface')).not.toBeInTheDocument();

        // Click toggle button (assuming we add one with test id)
        const toggleButton = screen.getByText(/Chat Mode/i); // We need to implement this button
        fireEvent.click(toggleButton);

        // Now should see chat interface
        expect(screen.getByTestId('chat-interface')).toBeInTheDocument();

        // Click again to go back
        fireEvent.click(screen.getByRole('button', { name: "Files" }));
        expect(screen.queryByTestId('chat-interface')).not.toBeInTheDocument();
    });

    test('sends message and displays response', async () => {
        // Mock chat API response
        fetch.mockImplementationOnce(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ role: 'assistant', content: 'AI Response' })
        }));

        renderApp();

        // Switch to chat
        fireEvent.click(screen.getByText(/Chat Mode/i));

        // Find input and send
        const input = screen.getByPlaceholderText(/Ask/i);
        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.click(screen.getByText(/Send/i));

        // Expect loading state or user message immediately
        expect(screen.getByText('Hello')).toBeInTheDocument();

        // Wait for response
        await waitFor(() => {
            expect(screen.getByText('AI Response')).toBeInTheDocument();
        });

        // Verify API call
        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/chat', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"message":"Hello"')
        }));
    });
});
