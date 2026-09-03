// ===========================================
// Tests unitaires - Button (DESIGN.md)
// ===========================================

import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Participer</Button>);

    expect(screen.getByRole('button', { name: 'Participer' })).toBeInTheDocument();
  });

  it('uses the terracotta CTA style by default (DESIGN.md)', () => {
    render(<Button>CTA</Button>);

    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-terracotta-600');
    expect(button.className).toContain('rounded-full');
    expect(button.className).toContain('uppercase');
  });

  it('renders the outline variant with a terracotta border', () => {
    render(<Button variant="outline">Outline</Button>);

    expect(screen.getByRole('button').className).toContain('border-accent');
  });

  it('renders as the child element with asChild (Slot)', () => {
    render(
      <Button asChild>
        <a href="/dashboard">Mon compte</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: 'Mon compte' });
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link.className).toContain('bg-terracotta-600');
  });

  it('can be disabled', () => {
    render(<Button disabled>Patientez</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
