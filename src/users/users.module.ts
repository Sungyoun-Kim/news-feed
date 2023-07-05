import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema } from './schema/users.schema';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    DynamooseModule.forFeature([
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
