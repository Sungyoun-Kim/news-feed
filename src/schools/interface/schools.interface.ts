export interface SchoolKey {
  id?: string;
}

export interface School extends SchoolKey {
  name: string;
  region_name: string;
  admins: string[];
}
