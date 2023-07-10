export interface UnsubscribedFeedKey {
  user_id: string;
}

export interface UnsubscribedFeed extends UnsubscribedFeedKey {
  feeds: object[];
  created_at?: number;
}
