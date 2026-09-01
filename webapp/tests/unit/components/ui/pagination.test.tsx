// ===========================================
// Tests unitaires - Pagination
// ===========================================

import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/ui/pagination';

describe('Pagination', () => {
  const props = {
    page: 3,
    totalPages: 12,
    total: 234,
    onPageChange: jest.fn(),
    label: 'lots remis',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le total et la page courante', () => {
    render(<Pagination {...props} />);

    expect(screen.getByText('234')).toBeInTheDocument();
    expect(screen.getByText('Page 3 sur 12')).toBeInTheDocument();
  });

  it('ne rend aucune navigation quand tout tient sur une page', () => {
    render(<Pagination {...props} page={1} totalPages={1} total={7} />);

    expect(screen.queryByLabelText('Page suivante')).not.toBeInTheDocument();
    // Le compteur, lui, reste utile meme sans navigation.
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('desactive le retour en arriere sur la premiere page', () => {
    render(<Pagination {...props} page={1} />);

    expect(screen.getByLabelText('Première page')).toBeDisabled();
    expect(screen.getByLabelText('Page précédente')).toBeDisabled();
    expect(screen.getByLabelText('Page suivante')).not.toBeDisabled();
  });

  it('desactive l avance sur la derniere page', () => {
    render(<Pagination {...props} page={12} />);

    expect(screen.getByLabelText('Page suivante')).toBeDisabled();
    expect(screen.getByLabelText('Dernière page')).toBeDisabled();
  });

  // La raison d etre des boutons extremes : avec des milliers de lots, la fin
  // de la liste doit rester atteignable sans cliquer page par page.
  it('saute directement a la derniere page', () => {
    render(<Pagination {...props} />);

    fireEvent.click(screen.getByLabelText('Dernière page'));

    expect(props.onPageChange).toHaveBeenCalledWith(12);
  });

  it('avance et recule d une page', () => {
    render(<Pagination {...props} />);

    fireEvent.click(screen.getByLabelText('Page suivante'));
    expect(props.onPageChange).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByLabelText('Page précédente'));
    expect(props.onPageChange).toHaveBeenCalledWith(2);
  });
});
