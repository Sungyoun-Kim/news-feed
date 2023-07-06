import { Schema, model } from 'dynamoose';
import { SchoolModel } from './schools.schema';

export const FeedSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
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

  create_at: {
    type: Date,
    default: Date.now(),
    rangeKey: true,
  },
});

export const FeedModel = model('Feeds', FeedSchema);
