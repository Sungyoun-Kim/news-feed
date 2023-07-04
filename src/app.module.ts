import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { DynamooseService } from './databases/databases.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: DynamooseService,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
