import { Schema, model } from 'dynamoose';

export const SchoolSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
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
export const UserModel = model('Schools', SchoolSchema);
