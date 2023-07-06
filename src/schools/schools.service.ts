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
    const result = await this.regionModel.query('name').eq(name).exec();

    return result;
  }
  async createSchoolPage(
    user_id: string,
    createSchoolPageDto: CreateSchoolPageDto,
  ) {
    createSchoolPageDto.id = v4();
    createSchoolPageDto.admins = [user_id];

    await this.schoolModel.create(createSchoolPageDto);
  }
}
