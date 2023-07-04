import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamooseOptionsFactory,
  DynamooseModuleOptions,
} from 'nestjs-dynamoose';

@Injectable()
export class DynamooseService implements DynamooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createDynamooseOptions(): DynamooseModuleOptions {
    return {
      aws: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
        region: this.configService.get<string>('AWS_REGION'),
      },
    };
  }
}
