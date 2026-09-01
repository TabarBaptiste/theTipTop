// ===========================================
// Tests unitaires - Page Profil
// ===========================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/dashboard/profile/page';
import { api } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/dashboard/account-sidebar', () => ({
  AccountSidebar: () => <aside />,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/lib/api', () => ({
  api: { put: jest.fn() },
}));

const user = {
  id: 'u1',
  email: 'camille@thetiptop.fr',
  firstName: 'Camille',
  lastName: 'Tran',
  role: 'CLIENT' as const,
  phone: '0612345678',
  createdAt: '2026-01-01T00:00:00.000Z',
};

jest.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: () => ({
    user,
    setUser: jest.fn(),
    isAuthenticated: true,
    isLoading: false,
  }),
}));

const mockedPut = api.put as jest.Mock;

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPut.mockResolvedValue({ data: user });
  });

  it('affiche l adresse enregistree sans permettre de la modifier', () => {
    render(<ProfilePage />);

    const champ = screen.getByLabelText('E-mail') as HTMLInputElement;
    expect(champ.value).toBe('camille@thetiptop.fr');
    expect(champ).toBeDisabled();
    expect(champ).toHaveAttribute('readonly');
  });

  it('explique pourquoi l adresse est verrouillee', () => {
    render(<ProfilePage />);

    expect(screen.getByText(/identifie votre compte/)).toBeInTheDocument();
  });

  // L invariant qui compte : meme si le champ redevenait editable par accident,
  // l adresse ne doit pas partir dans la requete. La changer sans reverification
  // permettrait une prise de controle depuis une session ouverte.
  it('n envoie jamais l adresse a l API', async () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(mockedPut).toHaveBeenCalled());

    const [url, payload] = mockedPut.mock.calls[0];
    expect(url).toBe('/users/u1');
    expect(payload).not.toHaveProperty('email');
    expect(payload.firstName).toBe('Camille');
  });
});
