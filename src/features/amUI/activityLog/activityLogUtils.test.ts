import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import {
  getActivityLogColor,
  getActivityLogCounterpart,
  getActivityLogEventKeys,
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
  subtype: 'Package',
  trigger: 'Created',
  when: '2025-01-15T11:15:00Z',
  byName: 'Helle Hovedadmin',
  fromId: 'reportee',
  fromName: 'Fysioterapeutene AS',
  toId: 'lise',
  toName: 'Lise Larsen AS',
  packageName: 'Lønn',
};

describe('getActivityLogColor', () => {
  it('is blue for access given and red for access removed', () => {
    expect(getActivityLogColor(baseEntry)).toBe('company');
    expect(getActivityLogColor({ ...baseEntry, trigger: 'Deleted' })).toBe('danger');
    expect(getActivityLogColor({ ...baseEntry, trigger: 'Updated' })).toBe('neutral');
  });

  it('follows the new status for request status changes', () => {
    const request: ActivityLogDto = { ...baseEntry, type: 'Request', trigger: 'Updated' };
    expect(getActivityLogColor({ ...request, status: 'Approved' })).toBe('company');
    expect(getActivityLogColor({ ...request, status: 'Rejected' })).toBe('danger');
    expect(getActivityLogColor({ ...request, status: 'Withdrawn' })).toBe('danger');
    expect(getActivityLogColor({ ...request, status: 'Pending' })).toBe('neutral');
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
  it('names the package, service or instance for child entries', () => {
    expect(getActivityLogObjectLabel(baseEntry, 'connections', t)).toBe(
      'activity_log_page.object.package({"name":"Lønn"})',
    );
    expect(
      getActivityLogObjectLabel(
        { ...baseEntry, subtype: 'Resource', resourceName: 'Sykmelding' },
        'connections',
        t,
      ),
    ).toBe('activity_log_page.object.resource({"name":"Sykmelding"})');
    expect(
      getActivityLogObjectLabel(
        { ...baseEntry, subtype: 'Instance', instanceId: 'skd/mva/1' },
        'connections',
        t,
      ),
    ).toBe('activity_log_page.object.instance({"name":"skd/mva/1"})');
  });

  it('calls a resource a scope in the Maskinporten area', () => {
    expect(
      getActivityLogObjectLabel(
        { ...baseEntry, subtype: 'Resource', resourceName: 'altinn:lonn:read' },
        'maskinporten',
        t,
      ),
    ).toBe('activity_log_page.object.scope({"name":"altinn:lonn:read"})');
  });

  it('names the role for main assignment entries', () => {
    expect(
      getActivityLogObjectLabel(
        { ...baseEntry, subtype: null, roleName: 'Rettighetshaver' },
        'connections',
        t,
      ),
    ).toBe('activity_log_page.object.role({"name":"Rettighetshaver"})');
  });
});

describe('getActivityLogEventKeys', () => {
  it('prefers the status-specific key for request entries', () => {
    expect(
      getActivityLogEventKeys({
        ...baseEntry,
        type: 'Request',
        trigger: 'Updated',
        status: 'Approved',
      }),
    ).toEqual([
      'activity_log_page.events.request.updated_approved',
      'activity_log_page.events.request.updated',
    ]);
  });

  it('uses only the trigger key when there is no status', () => {
    expect(getActivityLogEventKeys(baseEntry)).toEqual([
      'activity_log_page.events.assignment.created',
    ]);
  });
});

describe('getActivityLogSentence', () => {
  it('picks the first existing template and fills in the names', () => {
    const sentence = getActivityLogSentence({
      entry: baseEntry,
      area: 'connections',
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
      object: 'activity_log_page.object.package({"name":"Lønn"})',
      by: 'Helle Hovedadmin',
    });
  });

  it('falls back from the status-specific template to the trigger template', () => {
    const sentence = getActivityLogSentence({
      entry: { ...baseEntry, type: 'Request', trigger: 'Created', status: 'Pending' },
      area: 'request',
      direction: 'to',
      reporteeName: 'Fysioterapeutene AS',
      t,
      exists: (key) => !key.includes('created_pending'),
    });

    expect(sentence.key).toBe('activity_log_page.events.request.created.to');
  });

  it('uses the catalog name when no template exists', () => {
    const sentence = getActivityLogSentence({
      entry: { ...baseEntry, activityTypeId: 'type-1', byName: null },
      area: 'connections',
      direction: 'from',
      reporteeName: 'Fysioterapeutene AS',
      t,
      exists: (key) => key.startsWith('activity_log_page.events.fallback'),
      activityTypes: [
        {
          id: 'type-1',
          type: 'Assignment',
          subtype: 'Package',
          trigger: 'Created',
          name: 'Tilgangspakke tildelt',
          description: '',
        },
      ],
    });

    expect(sentence.key).toBe('activity_log_page.events.fallback.from');
    expect(sentence.byKey).toBeUndefined();
    expect(sentence.values.typeName).toBe('Tilgangspakke tildelt');
  });
});

describe('getActivityLogLocale', () => {
  it('maps the UI language to a date locale', () => {
    expect(getActivityLogLocale('nb')).toBe('nb-NO');
    expect(getActivityLogLocale('nn')).toBe('nn-NO');
    expect(getActivityLogLocale('en')).toBe('en-GB');
  });
});
