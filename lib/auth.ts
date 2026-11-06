import users from '../data/arabe/users.json';

export type UserRole = 'student' | 'parent' | 'teacher';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nom: string;
  groupe?: string;
  enfants?: string[];
  groupes?: string[];
}

export function loginWithEmail(email: string): User | null {
  const user = (users as User[]).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  return user || null;
}