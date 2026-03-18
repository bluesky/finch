import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LinuxMonitor from '../../components/LinuxMonitor';

describe('LinuxMonitor Component', () => {
  it('renders an iframe with the default url', () => {
    render(<LinuxMonitor />);
    const iframe = screen.getByTitle('Linux Monitor Terminal');
    expect(iframe).toHaveAttribute('src', 'http://localhost:7681/');
  });

  it('renders an iframe with a custom url', () => {
    render(<LinuxMonitor url="http://myserver:9000/" />);
    expect(screen.getByTitle('Linux Monitor Terminal')).toHaveAttribute('src', 'http://myserver:9000/');
  });

  it('renders without crashing when no props are provided', () => {
    const { container } = render(<LinuxMonitor />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
