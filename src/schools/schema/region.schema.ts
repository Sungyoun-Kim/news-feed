import { Schema, model } from 'dynamoose';

export const RegionSchema = new Schema({
  // 도 단위
  name: {
    type: String,
    hashKey: true,
    required: true,
  },
});

export const UserModel = model('Regions', RegionSchema);
