import { Schema, model } from 'dynamoose';
import { SchoolModel } from '../../schools/schema/schools.schema';
import { v4 } from 'uuid';
import { FeedModel } from './feeds.schema';

export const UnsubscribedFeedSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    hashKey: true,
  },
  feeds: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          id: {
            type: String,
          },
          created_at: { type: Number },
          school: { type: Object, schema: { name: String, id: String } },
          content: { type: String },
          subject: { type: String },
        },
      },
    ],
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
    rangeKey: true,
  },
});
