import { School } from './schools.interface';

export interface FeedKey {
  id: string;
  created_at?: number;
}

export interface Feed extends FeedKey {
  school: School;
  subject: string;
  content: string;
}
