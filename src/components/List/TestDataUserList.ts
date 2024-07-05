export interface UserType {
  name: string;
  role?: string;
  users?: UserType[];
}

export const testUsers: UserType[] = [
  {
    name: 'Dan Daglig Leder',
    role: 'Daglig leder',
  },
  {
    name: 'Helle Hansen',
    role: 'Styreleder',
  },
  {
    name: 'Lise Larsen',
    role: 'Styremedlem',
  },
  {
    name: 'Reidar Revisor',
    role: 'Revisor',
  },
  {
    name: 'Talleksperten',
    users: [
      {
        name: 'Annema Figma',
      },
      {
        name: 'Are Bruksfare',
      },
      {
        name: 'Bob Byggmester',
      },
      {
        name: 'Dan Eggen',
      },
      {
        name: 'Finn Feilbruk',
      },
      {
        name: 'Kåre Kontroller',
      },
      {
        name: 'Rolf Reiertsen',
      },
      {
        name: 'Sara Slemdal',
      },
    ],
  },
];
