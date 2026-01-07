import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from '../ProjectCard';
import { ProjectList } from '../ProjectList';

vi.mock('../ReviewList', () => ({
    default: () => <div data-testid="mock-review-list">Mock Review List</div>
}));

describe('ProjectCard', () => {
    it('renders project details', () => {
        const props = {
            name: 'Project Alpha',
            fileCount: 5,
            lastModified: '2023-01-01T00:00:00',
            progress: 30,
            onProgressChange: vi.fn()
        };

        render(<ProjectCard {...props} />);

        expect(screen.getByText('Project Alpha')).toBeInTheDocument();
        expect(screen.getByText('5 notes')).toBeInTheDocument();
    });

    it('calls onProgressChange when input changes', () => {
        const onProgressChange = vi.fn();
        const props = {
            name: 'Project Alpha',
            progress: 30,
            onProgressChange
        };
        render(<ProjectCard {...props} />);

        // We expect an input for progress. 
        // Ideally role="spinbutton" (number input) or "slider" (range).
        // For now we'll try to find by role or placeholder.
        // Let's assume we implement it as <input type="number"> or range.
        // We can use getByDisplayValue for initial check or just querySelector.
        // To be precise, let's look for a spinbutton.
        const input = screen.getByRole('slider');
        fireEvent.change(input, { target: { value: '50' } });

        expect(onProgressChange).toHaveBeenCalled();
    });
});

describe('ProjectList', () => {
    it('renders list container', () => {
        render(<ProjectList />);
        expect(screen.getByTestId('project-list')).toBeInTheDocument();
    });
});
