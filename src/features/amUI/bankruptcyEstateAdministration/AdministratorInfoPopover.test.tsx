import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AdministratorInfoPopover } from './AdministratorInfoPopover';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const iconLabel = 'bankruptcy_estate_administration_page.info_icon_label';

describe('AdministratorInfoPopover', () => {
  it('shows the text with the info icon and the description', () => {
    render(<AdministratorInfoPopover>intro text</AdministratorInfoPopover>);

    expect(screen.getByText(/intro text/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: iconLabel })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'bankruptcy_estate_administration_page.info_heading' }),
    ).toBeInTheDocument();
    expect(screen.getByText('bankruptcy_estate_administration_page.info_body')).toBeInTheDocument();
  });

  it('moves focus back to the info icon when the close button is clicked', async () => {
    render(<AdministratorInfoPopover>intro text</AdministratorInfoPopover>);

    await userEvent.click(screen.getByRole('button', { name: iconLabel }));
    await userEvent.click(screen.getByRole('button', { name: 'common.close' }));

    expect(screen.getByRole('button', { name: iconLabel })).toHaveFocus();
  });
});
