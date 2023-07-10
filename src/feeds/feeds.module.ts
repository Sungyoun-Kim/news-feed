import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { FeedSchema } from './schema/feeds.schema';
import { UsersModule } from '../users/users.module';
import { SchoolsModule } from '../schools/schools.module';

@Module({
  imports: [
    UsersModule,
    SchoolsModule,
    DynamooseModule.forFeature([
      {
        name: 'Feeds',
        schema: FeedSchema,
        options: {
          tableName: 'feeds',
        },
      },
    ]),
  ],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}
