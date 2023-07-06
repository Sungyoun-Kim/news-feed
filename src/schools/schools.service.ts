import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { School, SchoolKey } from './interface/schools.interface';
import { Region, RegionKey } from './interface/region.interface';
import { CreateSchoolPageDto } from './dto/schools.dto';
import { v4 } from 'uuid';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel('Schools')
    private readonly schoolModel: Model<School, SchoolKey>,
    @InjectModel('Regions')
    private readonly regionModel: Model<Region, RegionKey>,
  ) {}

  async findRegion(name: string) {
    try {
      const result = await this.regionModel.query('name').eq(name).exec();

      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }
  async createSchoolPage(
    user_id: string,
    createSchoolPageDto: CreateSchoolPageDto,
  ) {
    createSchoolPageDto.id = v4();
    createSchoolPageDto.admins = [user_id];
    try {
      await this.schoolModel.create(createSchoolPageDto);
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }
}
