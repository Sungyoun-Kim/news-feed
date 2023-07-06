import { School } from './schools.interface';

export interface FeedKey {
  id: string;
}

export interface Feed extends FeedKey {
  school: School;
  subject: string;
  content: string;
  created_at?: Date;
}
