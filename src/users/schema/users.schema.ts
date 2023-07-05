import { Schema, model } from 'dynamoose';

export enum Role {
  superAdmin = 300,
  admin = 200,
  user = 100,
}

export const UserSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
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
    type: Array<string>,
    required: false,
  },
});
export const UserModel = model('Users', UserSchema);
