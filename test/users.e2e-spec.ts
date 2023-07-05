import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from 'nestjs-dynamoose';

const mockUserModel = {
  scan: jest.fn(),
  create: jest.fn(),
};

describe('User (e2e)', () => {
  let app: INestApplication;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [{ provide: getModelToken('Users'), useValue: mockUserModel }],
    })
      .overrideProvider(getModelToken('Users'))
      .useValue(mockUserModel)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/sign-up (POST)', () => {
    it(' 가입하려는 이메일이 존재하는 경우', () => {
      jest.spyOn(mockUserModel, 'scan').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [
            {
              id: 'uuid',
              email: 'email',
              password: 'password',
              role: 200,
            },
          ],
        }),
      }));

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send({
          email: 'email@naver.com',
          password: 'password',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'email already exist',
          error: 'Bad Request',
        });
    });

    it('가입에 성공한 경우', () => {
      jest.spyOn(mockUserModel, 'scan').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send({
          email: 'email@naver.com',
          password: 'password',
        })
        .expect(201)
        .expect('"user has been signed up"');
    });
  });
});
