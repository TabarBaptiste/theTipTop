// ===========================================
// Tests unitaires - UserEditDialog
// ===========================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserEditDialog, type EditableUser } from '@/components/admin/user-edit-dialog';

const utilisateur: EditableUser = {
  id: 'u1',
  email: 'camille@thetiptop.fr',
  firstName: 'Camille',
  lastName: 'Tran',
  role: 'CLIENT',
  gender: 'FEMALE',
  birthDate: '1990-05-15T00:00:00.000Z',
  phone: '0612345678',
  consentEmail: true,
};

function renderDialog(overrides: Partial<React.ComponentProps<typeof UserEditDialog>> = {}) {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const props = { user: utilisateur, isSaving: false, onSubmit, onCancel, ...overrides };

  render(<UserEditDialog {...props} />);
  return { onSubmit, onCancel };
}

describe('UserEditDialog', () => {
  it('pré-remplit le formulaire avec les valeurs enregistrées', () => {
    renderDialog();

    expect(screen.getByLabelText('Prénom')).toHaveValue('Camille');
    expect(screen.getByLabelText('Nom')).toHaveValue('Tran');
    expect(screen.getByLabelText('Adresse e-mail')).toHaveValue('camille@thetiptop.fr');
    expect(screen.getByLabelText('Téléphone')).toHaveValue('0612345678');
    // L'API renvoie un ISO datetime, l'input date attend AAAA-MM-JJ.
    expect(screen.getByLabelText('Date de naissance')).toHaveValue('1990-05-15');
    expect(screen.getByLabelText('Genre')).toHaveValue('FEMALE');
    expect(screen.getByLabelText('Rôle')).toHaveValue('CLIENT');
    expect(screen.getByLabelText(/e-mails commerciaux/)).toBeChecked();
  });

  it('remonte les valeurs modifiées, rôle compris', async () => {
    const { onSubmit } = renderDialog();

    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Camille-Anne' } });
    fireEvent.change(screen.getByLabelText('Rôle'), { target: { value: 'EMPLOYEE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual(
      expect.objectContaining({ firstName: 'Camille-Anne', role: 'EMPLOYEE' }),
    );
  });

  it('refuse une adresse e-mail invalide sans appeler la sauvegarde', async () => {
    const { onSubmit } = renderDialog();

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'pas-un-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Adresse e-mail invalide')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('ferme la modale au clavier, sans passer par la souris', () => {
    const { onCancel } = renderDialog();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('verrouille les actions pendant la sauvegarde', () => {
    renderDialog({ isSaving: true });

    expect(screen.getByRole('button', { name: /Enregistrer/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });
});
