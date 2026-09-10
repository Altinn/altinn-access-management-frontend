import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { RootProvider } from '@altinn/altinn-components';

import type { RegisteredSystem } from '../types';

import { RegisteredSystemSearch } from './RegisteredSystemSearch';

const vendors = [
  { name: 'Alfa Systemer AS', orgNumber: '910000001' },
  { name: 'Beta Regnskap AS', orgNumber: '910000002' },
  { name: 'Gamma Software AS', orgNumber: '910000003' },
];

// enough systems that the listbox has to scroll, and three of them share the exact same name
const manySystems: RegisteredSystem[] = [
  ...vendors.map((vendor, index) => ({
    systemId: `duplicate-${index + 1}`,
    name: 'Regnskap',
    systemVendorOrgName: vendor.name,
    systemVendorOrgNumber: vendor.orgNumber,
  })),
  ...Array.from({ length: 27 }, (_, index) => {
    const vendor = vendors[index % vendors.length];
    return {
      systemId: `system-${index + 1}`,
      name: `Fagsystem ${index + 1}`,
      systemVendorOrgName: vendor.name,
      systemVendorOrgNumber: vendor.orgNumber,
    };
  }),
];

const ControlledSearch = ({
  systems,
  isLoading,
}: {
  systems: RegisteredSystem[];
  isLoading?: boolean;
}) => {
  const [selectedSystem, setSelectedSystem] = useState<RegisteredSystem | undefined>(undefined);
  return (
    <div style={{ maxWidth: '27rem' }}>
      <RegisteredSystemSearch
        label='Velg fagsystem'
        placeholder='Søk etter fagsystem eller leverandør'
        systems={systems}
        selectedSystem={selectedSystem}
        onSelectSystem={setSelectedSystem}
        isLoading={isLoading}
      />
      <p>Valgt systemId: {selectedSystem?.systemId ?? '(ingen)'}</p>
    </div>
  );
};

const meta: Meta<typeof RegisteredSystemSearch> = {
  title: 'Features/SystemUser/RegisteredSystemSearch',
  component: RegisteredSystemSearch,
  decorators: [
    (Story) => (
      <RootProvider>
        <Story />
      </RootProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RegisteredSystemSearch>;

export const Default: Story = {
  render: () => <ControlledSearch systems={manySystems.slice(3, 8)} />,
};

/** Long list: the listbox scrolls, and dragging its scrollbar must not close it. */
export const ScrollingList: Story = {
  render: () => <ControlledSearch systems={manySystems} />,
};

/** Three systems named "Regnskap" from different vendors. */
export const DuplicateNames: Story = {
  render: () => <ControlledSearch systems={manySystems.slice(0, 3)} />,
};

export const Loading: Story = {
  render: () => (
    <ControlledSearch
      systems={[]}
      isLoading
    />
  ),
};
