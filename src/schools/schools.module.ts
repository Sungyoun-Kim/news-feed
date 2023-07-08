import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { SchoolSchema } from './schema/schools.schema';
import { DynamooseModule } from 'nestjs-dynamoose';
import { RegionSchema } from './schema/regions.schema';
import { FeedSchema } from './schema/feeds.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    DynamooseModule.forFeature([
      {
        name: 'Schools',
        schema: SchoolSchema,
        options: {
          tableName: 'schools',
        },
      },
      {
        name: 'Regions',
        schema: RegionSchema,
        options: {
          tableName: 'regions',
        },
      },
      {
        name: 'Feeds',
        schema: FeedSchema,
        options: {
          tableName: 'feeds',
        },
      },
    ]),
  ],
  providers: [SchoolsService],
  controllers: [SchoolsController],
})
export class SchoolsModule {}
