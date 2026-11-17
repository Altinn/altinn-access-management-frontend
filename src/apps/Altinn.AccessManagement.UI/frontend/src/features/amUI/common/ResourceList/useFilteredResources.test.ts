import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { useFilteredResources } from './useFilteredResources';
import {
  extractDescription,
  extractOrgCode,
  extractOwnerName,
  extractResourceName,
  matchesAnySearchWord,
} from './utils';

const resource = (overrides: Partial<ServiceResource>) =>
  ({
    title: 'Tjeneste',
    identifier: 'id',
    resourceOwnerName: 'Eier',
    resourceOwnerOrgcode: 'ttd',
    rightDescription: '',
    ...overrides,
  }) as ServiceResource;

const resources = [
  resource({ title: 'Skattemelding', identifier: 'a', resourceOwnerOrgcode: 'skd' }),
  resource({ title: 'Portal', identifier: 'b' }),
  resource({ title: 'Annet', identifier: 'devtest_c' }),
  resource({ title: 'Annet', identifier: 'd', rightDescription: 'Gir innsyn' }),
  resource({ title: 'Annet', identifier: 'e', keywords: ['bolig'] }),
];

const filter = (
  searchString: string,
  options: { anyWord?: boolean; serviceOwnerFilter?: string[] } = {},
) =>
  renderHook(() =>
    useFilteredResources({
      resources,
      searchString,
      serviceOwnerFilter: options.serviceOwnerFilter,
      getResourceName: extractResourceName,
      getOwnerName: extractOwnerName,
      getOwnerOrgCode: extractOrgCode,
      getDescription: extractDescription,
      matchesSearch: options.anyWord ? matchesAnySearchWord : undefined,
    }),
  ).result.current.resources.map((r) => r.identifier);

describe('useFilteredResources', () => {
  it('matches the whole search on name, owner and description by default', () => {
    expect(filter('skatt portal')).toEqual([]);
    expect(filter('devtest')).toEqual([]);
    expect(filter('portal')).toEqual(['b']);
  });

  describe('with matchesAnySearchWord', () => {
    it('matches any of the words', () => {
      expect(filter('skatt portal', { anyWord: true })).toEqual(['a', 'b']);
    });

    it.each([
      ['identifier', 'devtest', 'devtest_c'],
      ['right description', 'innsyn', 'd'],
      ['keywords', 'bolig', 'e'],
    ])('matches on %s', (_field, searchString, expected) => {
      expect(filter(searchString, { anyWord: true })).toEqual([expected]);
    });

    it('still applies the service owner filter', () => {
      expect(filter('skatt portal', { anyWord: true, serviceOwnerFilter: ['SKD'] })).toEqual(['a']);
      expect(filter('', { anyWord: true, serviceOwnerFilter: ['skd'] })).toEqual(['a']);
    });
  });
});
