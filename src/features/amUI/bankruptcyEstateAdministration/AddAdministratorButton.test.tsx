import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddAdministratorButton } from './AddAdministratorButton';

const addAdministrator = vi.fn();

vi.mock('lottie-react', () => ({ Lottie: () => null }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

vi.mock('@/rtk/features/lookupApi', () => ({
  useGetOrganizationQuery: () => ({ data: undefined, isFetching: false, isError: false }),
}));

vi.mock('@/rtk/features/bankruptcyEstateApi', () => ({
  useAddAdministratorMutation: () => [addAdministrator, { isLoading: false }],
}));

const buttonText = 'bankruptcy_estate_administration_page.add_administrator_button';
const descriptionText = 'bankruptcy_estate_administration_page.add_administrator_description';

/*** The mutation hands back an object whose unwrap() gives the promise the component awaits */
const succeed = () =>
  addAdministrator.mockReturnValue({
    unwrap: vi.fn().mockResolvedValue({ id: 'assignment-uuid' }),
  });

const failWith = (response: unknown) =>
  addAdministrator.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(response) });

const openAndSubmit = async () => {
  await userEvent.click(screen.getByRole('button', { name: buttonText }));
  await userEvent.type(screen.getByLabelText('new_user_modal.person_identifier'), '20838198385');
  await userEvent.type(screen.getByLabelText('common.last_name'), 'Medaljong');
  await userEvent.click(screen.getByRole('button', { name: 'common.give_poa' }));
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AddAdministratorButton', () => {
  it('keeps the form out of the page until the button is clicked', async () => {
    render(<AddAdministratorButton />);

    expect(screen.queryByText(descriptionText)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: buttonText }));

    expect(screen.getByText(descriptionText)).toBeInTheDocument();
  });

  it('sends the person as typed and closes the dialog when the person is added', async () => {
    succeed();
    render(<AddAdministratorButton />);

    await openAndSubmit();

    expect(addAdministrator).toHaveBeenCalledWith({
      personIdentifier: '20838198385',
      lastName: 'Medaljong',
    });
    expect(screen.queryByText(descriptionText)).toBeNull();
  });

  it.each([
    {
      name: 'a person who is not found',
      response: { status: 400, data: { validationErrors: [{ code: 'AM.VLD-00034' }] } },
      expectedText: 'new_user_modal.not_found_error_person',
    },
    {
      name: 'an identifier that is not a person',
      response: { status: 400, data: { validationErrors: [{ code: 'AM.VLD-00008' }] } },
      expectedText: 'bankruptcy_estate_administration_page.add_administrator_not_person_error',
    },
    {
      name: 'too many failed attempts',
      response: { status: 429 },
      expectedText: 'new_user_modal.too_many_requests_error',
    },
    {
      name: 'an unexpected error',
      response: { status: 500, data: { title: 'Internal Server Error' } },
      expectedText: 'common.general_error_paragraph',
    },
  ])('keeps the dialog open and explains $name', async ({ response, expectedText }) => {
    failWith(response);
    render(<AddAdministratorButton />);

    await openAndSubmit();

    expect(screen.getByText(expectedText)).toBeInTheDocument();
    expect(screen.getByText(descriptionText)).toBeInTheDocument();
  });
});
