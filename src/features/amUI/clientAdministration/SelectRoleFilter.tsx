import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterProps, MenuItemProps, Toolbar, type FilterState } from '@altinn/altinn-components';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';

type SelectRoleFilterProps = {
  roleFilter: string[];
  setRoleFilter: (values: string[]) => void;
};
const ROLE_FILTER_KEY = 'roles';

export const SelectRoleFilter = ({ roleFilter, setRoleFilter }: SelectRoleFilterProps) => {
  const { t } = useTranslation();
  const { getRoleByCode } = useRoleMetadata();

  const optionsList = useMemo<Record<string, MenuItemProps>>(
    () => ({
      revisor: {
        label: getRoleByCode('revisor')?.name ?? 'revisor',
        value: 'revisor',
        name: ROLE_FILTER_KEY,
        role: 'checkbox',
      },
      regnskapsforer: {
        label: getRoleByCode('regnskapsforer')?.name ?? 'regnskapsforer',
        value: 'regnskapsforer',
        name: ROLE_FILTER_KEY,
        role: 'checkbox',
      },
      forretningsforer: {
        label: getRoleByCode('forretningsforer')?.name ?? 'forretningsforer',
        value: 'forretningsforer',
        name: ROLE_FILTER_KEY,
        role: 'checkbox',
      },
      rettighetshaver: {
        label: t('client_administration_page.rettighetshaver'),
        value: 'rettighetshaver',
        name: ROLE_FILTER_KEY,
        role: 'checkbox',
      },
    }),
    [getRoleByCode, t],
  );

  const options = useMemo(() => Object.values(optionsList), [optionsList]);

  const filters = useMemo<FilterProps[]>(
    () => [
      {
        id: ROLE_FILTER_KEY,
        name: ROLE_FILTER_KEY,
        label: t('client_administration_page.clients_filter_label'),
        removable: false,
        items: options,
      },
    ],
    [options, t],
  );

  const filterState = useMemo<FilterState>(() => ({ roles: roleFilter }), [roleFilter]);

  const handleFilterStateChange = (state: FilterState) => {
    setRoleFilter((state[ROLE_FILTER_KEY] ?? []) as string[]);
  };

  return (
    <Toolbar
      filter={{
        filters,
        filterState,
        onFilterStateChange: handleFilterStateChange,
        getFilterLabel: (_name, filtervalue) => {
          const selected = (filtervalue ?? [])
            .map((value) => optionsList[String(value)]?.label || String(value))
            .join(', ');
          return selected || t('client_administration_page.clients_filter_label');
        },
      }}
    />
  );
};
