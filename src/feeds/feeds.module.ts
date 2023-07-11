import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { FeedSchema } from './schema/feeds.schema';
import { UsersModule } from '../users/users.module';
import { SchoolsModule } from '../schools/schools.module';
import { UnsubscribedFeedSchema } from './schema/unsubscribed-feeds.schema';

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
      {
        name: 'UnsubscribedFeeds',
        schema: UnsubscribedFeedSchema,
        options: {
          tableName: 'unsubscribed-feeds',
        },
      },
    ]),
  ],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}
