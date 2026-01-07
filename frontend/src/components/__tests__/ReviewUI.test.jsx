
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReviewCard from '../ReviewCard';
import ReviewList from '../ReviewList';
import { VaultContext } from '../../context/VaultContext';

// Mock fetch
global.fetch = vi.fn();

const mockVaultContext = {
    vaultPath: '/test/vault',
    isConnected: true
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('ReviewCard', () => {
    it('renders note information correctly', () => {
        const note = {
            name: 'Test Note.md',
            path: 'Folder/Test Note.md',
            modified: '2024-01-01T12:00:00'
        };
        const onOpen = vi.fn();

        render(<ReviewCard note={note} onOpen={onOpen} />);

        expect(screen.getByText('Test Note.md')).toBeInTheDocument();
        expect(screen.getByText('Folder/Test Note.md')).toBeInTheDocument();
    });

    it('calls onOpen when clicked', () => {
        const note = {
            name: 'Test Note.md',
            path: 'Folder/Test Note.md',
            modified: '2024-01-01T12:00:00'
        };
        const onOpen = vi.fn();

        render(<ReviewCard note={note} onOpen={onOpen} />);

        fireEvent.click(screen.getByRole('button')); // Assuming the card is clickable or has a button
        expect(onOpen).toHaveBeenCalledWith(note);
    });
});

describe('ReviewList', () => {
    it('fetches and displays reviews on mount', async () => {
        const mockNotes = [
            { name: 'Note 1', path: 'folder/Note 1.md', modified: '2024-01-01T12:00:00' },
            { name: 'Note 2', path: 'folder/Note 2.md', modified: '2024-01-01T12:00:00' }
        ];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockNotes
        });

        render(
            <VaultContext.Provider value={mockVaultContext}>
                <ReviewList />
            </VaultContext.Provider>
        );

        expect(screen.getByText("Today's Review")).toBeInTheDocument();

        // Use findByText which waits automatically
        expect(await screen.findByText('Note 1')).toBeInTheDocument();
        expect(screen.getByText('Note 2')).toBeInTheDocument();
    });

    it('refreshes list when shuffle is clicked', async () => {
        const mockNotes1 = [{ name: 'Note 1', path: 'folder/Note 1.md', modified: '2024-01-01T12:00:00' }];
        const mockNotes2 = [{ name: 'New Note', path: 'folder/New Note.md', modified: '2024-01-01T12:00:00' }];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockNotes1
        }).mockResolvedValueOnce({
            ok: true,
            json: async () => mockNotes2
        });

        render(
            <VaultContext.Provider value={mockVaultContext}>
                <ReviewList />
            </VaultContext.Provider>
        );

        expect(await screen.findByText('Note 1')).toBeInTheDocument();

        const shuffleButton = screen.getByTitle('Shuffle Reviews');
        fireEvent.click(shuffleButton);

        expect(await screen.findByText('New Note')).toBeInTheDocument();

        expect(fetch).toHaveBeenCalledTimes(2);
    });
});
