/** The activity log areas, in the order they are shown as tabs. */
export const activityLogAreas = ['connections', 'request', 'maskinporten'] as const;

export type ActivityLogArea = (typeof activityLogAreas)[number];
