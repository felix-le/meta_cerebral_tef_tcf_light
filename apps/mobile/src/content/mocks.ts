/**
 * Published mock-test catalogue (contest build: everything free, no Pro,
 * no balance, no locks). Static content, same role as exam content.
 */

export interface MockSession {
  id: string;
  year: string;
  month: string;
  items: number;
  mins: number;
}

export const EXAM_NAME = 'TEF Canada';

export const MOCKS: MockSession[] = [
  { id: 'm2504', year: '2025', month: 'April', items: 84, mins: 175 },
  { id: 'm2503', year: '2025', month: 'March', items: 84, mins: 175 },
  { id: 'm2502', year: '2025', month: 'February', items: 84, mins: 175 },
  { id: 'm2501', year: '2025', month: 'January', items: 84, mins: 175 },
  { id: 'm2411', year: '2024', month: 'November', items: 84, mins: 175 },
  { id: 'm2409', year: '2024', month: 'September', items: 84, mins: 175 },
  { id: 'm2406', year: '2024', month: 'June', items: 84, mins: 175 },
];
