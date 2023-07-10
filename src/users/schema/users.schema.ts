import { Schema, model } from 'dynamoose';
import { v4 } from 'uuid';

export enum Role {
  admin = 200,
  student = 100,
}

export const UserSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
    default: () => v4(),
  },
  email: {
    type: String,
    rangeKey: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    required: true,
  },
  subscribe_schools: {
    type: Array,
    schema: [String],
    required: false,
    default: [],
  },
});
export const UserModel = model('Users', UserSchema);
