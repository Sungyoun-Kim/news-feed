export interface UserKey {
  id?: string;
}

export interface User extends UserKey {
  email?: string;
  password: string;
  role: number;
  subscribe_schools?: string[];
}
