import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import {
  getActivityLogColor,
  getActivityLogCounterpart,
  getActivityLogEventKey,
  getActivityLogLocale,
  getActivityLogObjectLabel,
  getActivityLogSentence,
} from './activityLogUtils';
import type { ActivityLogDto } from './types';

// Renders a key with its interpolation values so assertions can see what was passed.
const t = ((key: string, values?: Record<string, unknown>) =>
  values ? `${key}(${JSON.stringify(values)})` : key) as unknown as TFunction<
  'translation',
  undefined
>;

const baseEntry: ActivityLogDto = {
  id: 'entry-1',
  itemId: 'item-1',
  type: 'Assignment',
  subtype: 'Resource',
  trigger: 'Created',
  when: '2025-01-15T11:15:00Z',
  byName: 'Helle Hovedadmin',
  fromId: 'reportee',
  fromName: 'Fysioterapeutene AS',
  toId: 'lise',
  toName: 'Lise Larsen AS',
  resourceName: 'altinn:lonn:read',
};

describe('getActivityLogColor', () => {
  it('is blue for access given and red for access removed', () => {
    expect(getActivityLogColor(baseEntry)).toBe('company');
    expect(getActivityLogColor({ ...baseEntry, trigger: 'Deleted' })).toBe('danger');
    expect(getActivityLogColor({ ...baseEntry, trigger: 'Updated' })).toBe('neutral');
  });
});

describe('getActivityLogCounterpart', () => {
  it('is the receiver when the reportee gave access, and the giver when it received access', () => {
    expect(getActivityLogCounterpart(baseEntry, 'from')).toEqual({
      id: 'lise',
      name: 'Lise Larsen AS',
    });
    expect(getActivityLogCounterpart(baseEntry, 'to')).toEqual({
      id: 'reportee',
      name: 'Fysioterapeutene AS',
    });
  });

  it('is undefined when the side is missing', () => {
    expect(getActivityLogCounterpart({ ...baseEntry, toId: null }, 'from')).toBeUndefined();
  });
});

describe('getActivityLogObjectLabel', () => {
  it('names the scope for scope entries', () => {
    expect(getActivityLogObjectLabel(baseEntry, t)).toBe(
      'activity_log_page.object.scope({"name":"altinn:lonn:read"})',
    );
  });

  it('names the role for main assignment entries', () => {
    expect(
      getActivityLogObjectLabel({ ...baseEntry, subtype: null, roleName: 'Leverandør' }, t),
    ).toBe('activity_log_page.object.role({"name":"Leverandør"})');
  });

  it('falls back to a generic label when neither scope nor role is known', () => {
    expect(getActivityLogObjectLabel({ ...baseEntry, subtype: null }, t)).toBe(
      'activity_log_page.object.access',
    );
  });
});

describe('getActivityLogEventKey', () => {
  it('is built from the type and trigger', () => {
    expect(getActivityLogEventKey(baseEntry)).toBe('activity_log_page.events.assignment.created');
    expect(getActivityLogEventKey({ ...baseEntry, trigger: 'Deleted' })).toBe(
      'activity_log_page.events.assignment.deleted',
    );
  });
});

describe('getActivityLogSentence', () => {
  it('uses the event template and fills in the names', () => {
    const sentence = getActivityLogSentence({
      entry: baseEntry,
      direction: 'from',
      reporteeName: 'Fysioterapeutene AS',
      t,
      exists: () => true,
    });

    expect(sentence.key).toBe('activity_log_page.events.assignment.created.from');
    expect(sentence.byKey).toBe('activity_log_page.events.assignment.created.by');
    expect(sentence.values).toMatchObject({
      reportee: 'Fysioterapeutene AS',
      counterpart: 'Lise Larsen AS',
      object: 'activity_log_page.object.scope({"name":"altinn:lonn:read"})',
      by: 'Helle Hovedadmin',
    });
  });

  it('uses the catalog name when no template exists', () => {
    const sentence = getActivityLogSentence({
      entry: { ...baseEntry, activityTypeId: 'type-1', byName: null },
      direction: 'from',
      reporteeName: 'Fysioterapeutene AS',
      t,
      exists: (key) => key.startsWith('activity_log_page.events.fallback'),
      activityTypes: [
        {
          id: 'type-1',
          type: 'Assignment',
          subtype: 'Resource',
          trigger: 'Created',
          name: 'Scope tildelt',
          description: '',
        },
      ],
    });

    expect(sentence.key).toBe('activity_log_page.events.fallback.from');
    expect(sentence.byKey).toBeUndefined();
    expect(sentence.values.typeName).toBe('Scope tildelt');
  });
});

describe('getActivityLogLocale', () => {
  it('maps the UI language to a date locale', () => {
    expect(getActivityLogLocale('nb')).toBe('nb-NO');
    expect(getActivityLogLocale('nn')).toBe('nn-NO');
    expect(getActivityLogLocale('en')).toBe('en-GB');
  });
});
