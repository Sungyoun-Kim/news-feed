import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema } from './schema/users.schema';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AuthModule } from '../auth/auth.module';
import { FeedSchema } from '../feeds/schema/feeds.schema';
import { UnsubscribedFeedSchema } from '../feeds/schema/unsubscribed-feeds.schema';

@Module({
  imports: [
    forwardRef(() => AuthModule),
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
      {
        name: 'Users',
        schema: UserSchema,
        options: {
          tableName: 'users',
        },
      },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
