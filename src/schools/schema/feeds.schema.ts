import { Schema, model } from 'dynamoose';
import { SchoolModel } from './schools.schema';
import { v4 } from 'uuid';

export const FeedSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
    default: () => v4(),
  },
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  school: {
    type: SchoolModel,
    required: true,
  },

  created_at: {
    type: Date,
    default: () => Date.now(),
    rangeKey: true,
  },
});

export const FeedModel = model('Feeds', FeedSchema);
