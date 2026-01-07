import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsModal from '../SettingsModal';
import React from 'react';

// Mock generic Modal to just render children if open
vi.mock('../Modal', () => ({
    default: ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;
        return (
            <div role="dialog" aria-label={title}>
                <button onClick={onClose} aria-label="Close">X</button>
                <h1>{title}</h1>
                {children}
            </div>
        );
    }
}));

describe('SettingsModal', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('fetches settings on mount', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                vault_path: "/test/vault",
                model_type: "local",
                api_keys: { openai: "", gemini: "" }
            })
        });

        render(<SettingsModal isOpen={true} onClose={() => { }} />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/settings');
        });

        expect(screen.getByDisplayValue('/test/vault')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Local (Ollama)')).toBeInTheDocument();
    });

    it('updates settings on save', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                vault_path: "/initial",
                model_type: "openai",
                api_keys: { openai: "sk-old", gemini: "" }
            })
        });

        render(<SettingsModal isOpen={true} onClose={() => { }} />);

        // Wait for load
        await waitFor(() => expect(screen.getByDisplayValue('/initial')).toBeInTheDocument());

        // Change values
        fireEvent.change(screen.getByLabelText(/Vault Path/i), { target: { value: '/new/path' } });
        fireEvent.change(screen.getByLabelText(/AI Model/i), { target: { value: 'openai' } });

        // Mock save response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true })
        });

        fireEvent.click(screen.getByText('Save Settings'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenLastCalledWith('http://localhost:8000/api/settings', expect.objectContaining({
                method: 'PATCH',
                body: expect.stringContaining('/new/path')
            }));
        });
    });
});
