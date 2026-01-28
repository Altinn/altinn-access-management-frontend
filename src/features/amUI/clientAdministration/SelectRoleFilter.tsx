import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Toolbar,
  type FilterState,
  type MenuOptionProps,
  type ToolbarFilterProps,
} from '@altinn/altinn-components';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';

type SelectRoleFilterProps = {
  roleFilter: string[];
  setRoleFilter: (values: string[]) => void;
};

export const SelectRoleFilter = ({ roleFilter, setRoleFilter }: SelectRoleFilterProps) => {
  const { t } = useTranslation();
  const { getRoleByCode } = useRoleMetadata();

  const optionsList = useMemo<Record<string, MenuOptionProps>>(
    () => ({
      revisor: {
        label: getRoleByCode('revisor')?.name ?? '',
        value: 'revisor',
      },
      regnskapsforer: {
        label: getRoleByCode('regnskapsforer')?.name ?? '',
        value: 'regnskapsforer',
      },
      forretningsforer: {
        label: getRoleByCode('forretningsforer')?.name ?? '',
        value: 'forretningsforer',
      },
      rettighetshaver: {
        label: t('client_administration_page.rettighetshaver'),
        value: 'rettighetshaver',
      },
    }),
    [getRoleByCode, t],
  );

  const options = useMemo(() => Object.values(optionsList), [optionsList]);

  const filters = useMemo<ToolbarFilterProps[]>(
    () => [
      {
        name: 'roles',
        label: t('client_administration_page.clients_filter_label'),
        optionType: 'checkbox',
        removable: false,
        options,
      },
    ],
    [options, t],
  );

  const filterState = useMemo<FilterState>(() => ({ roles: roleFilter }), [roleFilter]);

  const handleFilterStateChange = (state: FilterState) => {
    setRoleFilter(state.roles as string[]);
  };

  return (
    <Toolbar
      filters={filters}
      filterState={filterState}
      onFilterStateChange={handleFilterStateChange}
      getFilterLabel={(_name, filtervalue) => {
        return (filtervalue ?? [])
          .map((value) => optionsList[String(value)]?.label || String(value))
          .join(', ');
      }}
    />
  );
};
