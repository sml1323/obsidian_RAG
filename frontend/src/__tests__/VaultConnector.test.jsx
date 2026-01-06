/**
 * Tests for VaultConnector component
 * Task 2.1: 3 focused tests for connection UI
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VaultConnector } from '../components/VaultConnector';

// Mock fetch
global.fetch = vi.fn();

describe('VaultConnector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render path input and connect button', () => {
        render(<VaultConnector />);

        expect(screen.getByTestId('vault-path-input')).toBeInTheDocument();
        expect(screen.getByTestId('connect-button')).toBeInTheDocument();
        expect(screen.getByText('연결')).toBeInTheDocument();
    });

    it('should display success state after successful connection', async () => {
        const mockResponse = {
            success: true,
            path: '/test/vault',
            file_count: 10,
            message: 'Successfully connected'
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const onConnect = vi.fn();
        render(<VaultConnector onConnect={onConnect} />);

        const input = screen.getByTestId('vault-path-input');
        const button = screen.getByTestId('connect-button');

        fireEvent.change(input, { target: { value: '/test/vault' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('status-message')).toBeInTheDocument();
        });

        expect(onConnect).toHaveBeenCalledWith(mockResponse);
    });

    it('should display error state when connection fails', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ detail: 'Path does not exist' })
        });

        render(<VaultConnector />);

        const input = screen.getByTestId('vault-path-input');
        const button = screen.getByTestId('connect-button');

        fireEvent.change(input, { target: { value: '/invalid/path' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('status-message')).toBeInTheDocument();
            expect(screen.getByText(/Path does not exist/)).toBeInTheDocument();
        });
    });
});
