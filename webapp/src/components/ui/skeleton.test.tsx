// ===========================================
// Tests unitaires - Skeleton
// ===========================================

import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonList } from './skeleton';

describe('Skeleton', () => {
  // L'animation a deja saute une fois : un style inline avait ecrase
  // animate-pulse par une animation absente du CSS. On la verrouille.
  it('porte la classe d animation', () => {
    render(<Skeleton data-testid="sk" />);

    const el = screen.getByTestId('sk');
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('bg-warm-beige/50');
    expect(el.getAttribute('style')).toBeNull();
  });

  it('fusionne la className fournie', () => {
    render(<Skeleton data-testid="sk" className="h-8 w-48" />);

    const el = screen.getByTestId('sk');
    expect(el).toHaveClass('h-8', 'w-48', 'animate-pulse');
  });
});

describe('SkeletonList', () => {
  it('rend autant de blocs que demande', () => {
    const { container } = render(<SkeletonList count={5} />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5);
  });

  it('rend 3 blocs par defaut', () => {
    const { container } = render(<SkeletonList />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });
});
