import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GoogleDoc from '../../components/GoogleDoc';
import { doc } from '../../components/GoogleDoc';

const sampleDocs: doc[] = [
    { title: 'Doc One', url: 'https://example.com/doc1' },
    { title: 'Doc Two', url: 'https://example.com/doc2' },
    { title: 'Doc Three', url: 'https://example.com/doc3' },
];

describe('GoogleDoc Component', () => {
    describe('single url mode (no docs prop)', () => {
        it('renders an iframe with the given url', () => {
            render(<GoogleDoc url="https://example.com/single" />);
            const iframe = screen.getByTitle('Google Doc Viewer');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('src', 'https://example.com/single');
        });

        it('does not render a select element', () => {
            render(<GoogleDoc url="https://example.com/single" />);
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });

        it('renders without crashing when neither url nor docs are provided', () => {
            const { container } = render(<GoogleDoc />);
            expect(container.firstChild).toBeInTheDocument();
        });
    });

    describe('multi-doc mode (docs prop)', () => {
        it('renders a select with one option per doc', () => {
            render(<GoogleDoc docs={sampleDocs} />);
            const options = screen.getAllByRole('option');
            expect(options).toHaveLength(3);
            expect(options[0]).toHaveTextContent('Doc One');
            expect(options[1]).toHaveTextContent('Doc Two');
            expect(options[2]).toHaveTextContent('Doc Three');
        });

        it('defaults to the first doc url in the iframe', () => {
            render(<GoogleDoc docs={sampleDocs} />);
            const iframe = screen.getByTitle('Google Doc Viewer');
            expect(iframe).toHaveAttribute('src', 'https://example.com/doc1');
        });

        it('defaults to the url prop over the first doc when both are provided', () => {
            render(<GoogleDoc url="https://example.com/override" docs={sampleDocs} />);
            const iframe = screen.getByTitle('Google Doc Viewer');
            expect(iframe).toHaveAttribute('src', 'https://example.com/override');
        });

        it('updates the iframe src when a different doc is selected', () => {
            render(<GoogleDoc docs={sampleDocs} />);
            const select = screen.getByRole('combobox');
            fireEvent.change(select, { target: { value: 'https://example.com/doc2' } });
            const iframe = screen.getByTitle('Google Doc Viewer');
            expect(iframe).toHaveAttribute('src', 'https://example.com/doc2');
        });

        it('renders the Google Doc icon image', () => {
            render(<GoogleDoc docs={sampleDocs} />);
            const img = screen.getByAltText('Google Doc');
            expect(img).toBeInTheDocument();
        });

        it('select value reflects the currently selected doc url', () => {
            render(<GoogleDoc docs={sampleDocs} />);
            const select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select.value).toBe('https://example.com/doc1');

            fireEvent.change(select, { target: { value: 'https://example.com/doc3' } });
            expect(select.value).toBe('https://example.com/doc3');
        });

        it('falls back to single iframe mode when docs is an empty array', () => {
            render(<GoogleDoc url="https://example.com/fallback" docs={[]} />);
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
            const iframe = screen.getByTitle('Google Doc Viewer');
            expect(iframe).toHaveAttribute('src', 'https://example.com/fallback');
        });
    });
});
