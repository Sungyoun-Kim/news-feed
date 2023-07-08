export interface UserKey {
  id: string;
  email: string;
}

export interface User extends UserKey {
  password: string;
  role: number;
  subscribe_schools?: string[];
}
