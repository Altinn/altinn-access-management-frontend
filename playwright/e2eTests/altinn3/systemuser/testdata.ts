// Synthetic Tenor businesses and their daily managers. Verified in AT23 and TT02.
// Keep one owner per spec: parallel tests must not change another spec's language/data.
export const systemUserOwners = {
  creation: { orgNo: '312205130', pid: '20907398367', name: 'DEMOKRATISK GRATIS TIGER AS' },
  requests: { orgNo: '312740095', pid: '07816199810', name: 'ØKONOMISK OPPFYLLENDE TIGER AS' },
  changes: { orgNo: '313162206', pid: '12914399759', name: 'BESTEMT GENIERKLÆRT TIGER AS' },
  deletion: { orgNo: '313127826', pid: '05869699952', name: 'RETT FIRKANTET TIGER AS' },
} as const;
