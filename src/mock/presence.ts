export interface MockPresenceRecord {
  id: string;
  userId: string;
  date: string;
  present: boolean;
}

export const MOCK_PRESENCE_RECORDS: MockPresenceRecord[] = [
  { id: 'r1', userId: '2', date: '2026-07-20', present: true },
  { id: 'r2', userId: '3', date: '2026-07-20', present: false },
  { id: 'r3', userId: '4', date: '2026-07-20', present: true },
  { id: 'r4', userId: '5', date: '2026-07-20', present: true },
  { id: 'r5', userId: '6', date: '2026-07-20', present: false },
  { id: 'r6', userId: '7', date: '2026-07-20', present: true },
  { id: 'r7', userId: '8', date: '2026-07-20', present: true },
  { id: 'r8', userId: '2', date: '2026-07-13', present: true },
  { id: 'r9', userId: '3', date: '2026-07-13', present: false },
  { id: 'r10', userId: '4', date: '2026-07-13', present: true },
  { id: 'r11', userId: '5', date: '2026-07-13', present: true },
  { id: 'r12', userId: '6', date: '2026-07-13', present: false },
  { id: 'r13', userId: '7', date: '2026-07-13', present: true },
  { id: 'r14', userId: '8', date: '2026-07-13', present: true },
];
