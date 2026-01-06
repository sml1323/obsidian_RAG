import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyncButton } from '../components/SyncButton';
import { vi } from 'vitest';

// Mock fetch global
global.fetch = vi.fn();

describe('SyncButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<SyncButton />);
        expect(screen.getByText('임베딩 동기화 (Sync)')).toBeDefined();
    });

    it('handles sync success', async () => {
        const mockOnSyncComplete = vi.fn();

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                status: 'success',
                files_processed: 10,
                chunks_generated: 20
            }),
        });

        render(<SyncButton onSyncComplete={mockOnSyncComplete} />);

        const button = screen.getByText('임베딩 동기화 (Sync)');
        fireEvent.click(button);

        expect(screen.getByText('동기화 중...')).toBeDefined();

        await waitFor(() => {
            expect(screen.getByText(/완료: 10개 파일/)).toBeDefined();
        });

        expect(mockOnSyncComplete).toHaveBeenCalled();
    });

    it('handles sync error', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'Failed' }),
        });

        render(<SyncButton />);

        const button = screen.getByText('임베딩 동기화 (Sync)');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('동기화 실패')).toBeDefined();
        });
    });
});
