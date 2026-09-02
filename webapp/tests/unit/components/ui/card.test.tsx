// ===========================================
// Tests unitaires - PrizeCard (DESIGN.md)
// ===========================================

import { render, screen } from '@testing-library/react';
import { PrizeCard } from '@/components/ui/card';

describe('PrizeCard', () => {
  const baseProps = {
    image: '/img/infuseur.jpg',
    imageAlt: 'Infuseur à thé',
    category: 'accessoire' as const,
    title: 'Infuseur à thé premium',
    value: '12€',
    odds: '60%',
  };

  it('renders the category label in plain terracotta text (no tag)', () => {
    render(<PrizeCard {...baseProps} />);

    const category = screen.getByText('Accessoire');
    expect(category.className).toContain('text-terracotta-600');
    expect(category.className).not.toContain('rounded');
  });

  it('renders the title, value and odds', () => {
    render(<PrizeCard {...baseProps} />);

    expect(screen.getByText('Infuseur à thé premium')).toBeInTheDocument();
    expect(screen.getByText('Valeur 12€')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('hides the value when it is null', () => {
    render(<PrizeCard {...baseProps} value={null} />);

    expect(screen.queryByText(/Valeur/)).not.toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders the image with its alt text', () => {
    render(<PrizeCard {...baseProps} />);

    expect(screen.getByAltText('Infuseur à thé')).toBeInTheDocument();
  });

  it('renders a placeholder gradient when no image is provided', () => {
    render(<PrizeCard {...baseProps} image={undefined} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('supports StaticImageData-like objects', () => {
    render(<PrizeCard {...baseProps} image={{ src: '/static/infuseur.jpg' }} />);

    expect(screen.getByAltText('Infuseur à thé')).toHaveAttribute('src', '/static/infuseur.jpg');
  });

  it.each([
    ['signature', 'Thé Signature'],
    ['grandprix', 'Grand Prix'],
  ] as const)('maps the %s category to its label', (category, label) => {
    render(<PrizeCard {...baseProps} category={category} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
