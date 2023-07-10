import { Schema, model } from 'dynamoose';
import { v4 } from 'uuid';

export const SchoolSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
    default: () => v4(),
  },

  name: {
    type: String,
    rangeKey: true,
    required: true,
  },

  region_name: {
    type: String,
    required: true,
  },

  admins: {
    type: Array,
    schema: [String],
    required: true,
  },
});
export const SchoolModel = model('Schools', SchoolSchema);
