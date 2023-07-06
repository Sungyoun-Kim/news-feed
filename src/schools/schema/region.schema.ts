import { Schema, model } from 'dynamoose';

export const RegionSchema = new Schema({
  // 도 단위
  name: {
    type: String,
    hashKey: true,
    required: true,
  },
});

export const RegionModel = model('Regions', RegionSchema);
