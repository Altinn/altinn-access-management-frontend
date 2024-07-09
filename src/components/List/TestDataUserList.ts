export interface UserType {
  id: string;
  name: string;
  roles?: string[];
  users?: UserType[];
}

export const testUsers: UserType[] = [
  {
    id: '1111',
    name: 'Dan Daglig Leder',
    roles: ['Daglig leder'],
  },
  {
    id: '2222',
    name: 'Helle Hansen',
    roles: ['Styreleder'],
  },
  {
    id: '3333',
    name: 'Lise Larsen',
    roles: ['Styremedlem'],
  },
  {
    id: '4444',
    name: 'Reidar Revisor',
    roles: ['Revisor', 'Styremedlem', 'Kakespiser', 'Norsk representant for utenlandsk enhet'],
  },
  {
    id: '5555',
    name: 'Talleksperten',
    roles: ['Regnskapsfører'],
    users: [
      { id: '5555-1', name: 'Annema Figma' },
      { id: '5555-2', name: 'Are Bruksfare' },
      { id: '5555-3', name: 'Bob Byggmester' },
      { id: '5555-4', name: 'Dan Eggen' },
      { id: '5555-5', name: 'Finn Feilbruk' },
      { id: '5555-6', name: 'Kåre Kontroller' },
      { id: '5555-7', name: 'Rolf Reiertsen' },
      { id: '5555-8', name: 'Sara Slemdal' },
    ],
  },
];
