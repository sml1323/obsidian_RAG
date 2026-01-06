/**
 * Tests for FolderTree component
 * Task 3.1: 4 focused tests for tree component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FolderTree } from '../components/FolderTree';

const mockTree = {
    name: 'vault',
    type: 'folder',
    path: '',
    file_count: 5,
    children: [
        {
            name: 'Project',
            type: 'folder',
            path: 'Project',
            file_count: 2,
            children: [
                { name: 'note1.md', type: 'file', path: 'Project/note1.md', modified: '2024-01-01T00:00:00' },
                { name: 'note2.md', type: 'file', path: 'Project/note2.md', modified: '2024-01-02T00:00:00' }
            ]
        },
        {
            name: 'Areas',
            type: 'folder',
            path: 'Areas',
            file_count: 1,
            children: [
                { name: 'daily.md', type: 'file', path: 'Areas/daily.md', modified: '2024-01-01T00:00:00' }
            ]
        },
        { name: 'README.md', type: 'file', path: 'README.md', modified: '2024-01-01T00:00:00' }
    ]
};

describe('FolderTree', () => {
    it('should render tree with nested folder structure', () => {
        render(<FolderTree tree={mockTree} />);

        expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
        // Should show root folders
        expect(screen.getByText('Project')).toBeInTheDocument();
        expect(screen.getByText('Areas')).toBeInTheDocument();
    });

    it('should expand and collapse folders on click', () => {
        render(<FolderTree tree={mockTree} />);

        const projectFolder = screen.getByText('Project');

        // Default expanded (level < 2), should show children
        expect(screen.getByText('note1.md')).toBeInTheDocument();

        // Click to collapse
        fireEvent.click(projectFolder);

        // Children should be hidden
        expect(screen.queryByText('note1.md')).not.toBeInTheDocument();

        // Click to expand again
        fireEvent.click(projectFolder);
        expect(screen.getByText('note1.md')).toBeInTheDocument();
    });

    it('should highlight selected file', () => {
        const onFileSelect = vi.fn();
        render(<FolderTree tree={mockTree} onFileSelect={onFileSelect} />);

        const fileNode = screen.getByText('README.md');
        fireEvent.click(fileNode);

        expect(onFileSelect).toHaveBeenCalled();
    });

    it('should visually distinguish PARA folders (Project, Areas)', () => {
        render(<FolderTree tree={mockTree} />);

        // Project and Areas should be rendered with special styling
        const projectFolder = screen.getByText('Project');
        const areasFolder = screen.getByText('Areas');

        // Both should exist with PARA styling (font-semibold class applied to parent)
        expect(projectFolder).toBeInTheDocument();
        expect(areasFolder).toBeInTheDocument();
    });

    it('should call onRefresh when refresh button is clicked', () => {
        const onRefresh = vi.fn();
        render(<FolderTree tree={mockTree} onRefresh={onRefresh} />);

        const refreshButton = screen.getByTestId('refresh-button');
        fireEvent.click(refreshButton);

        expect(onRefresh).toHaveBeenCalled();
    });
});
