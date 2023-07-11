import { Feed } from './feeds.interface';

export interface UnsubscribedFeedKey {
  user_id: string;
}

export interface UnsubscribedFeed extends UnsubscribedFeedKey {
  feeds: Feed[];
  created_at?: number;
}
