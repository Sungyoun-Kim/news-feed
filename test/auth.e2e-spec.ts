import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { getModelToken } from 'nestjs-dynamoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const mockUserModel = {
  scan: jest.fn(),
  create: jest.fn(),
  query: jest.fn(),
};
describe('auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ConfigModule],
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

  describe('/login (POST)', () => {
    it('아이디 또는 비밀번호가 올바르지 않을 경우', () => {
      jest.spyOn(mockUserModel, 'scan').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [
            {
              id: 'uuid',
              email: 'suj970@naver.com',
              password: 'password',
              role: 200,
            },
          ],
        }),
      }));

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'suj970@naver.com', password: 'password' })
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'id or password is incorrect',
          error: 'Unauthorized',
        });
    });

    it('로그인에 성공한 경우', () => {
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

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(JwtService.prototype, 'sign').mockReturnValue('refresh_token');

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'suj970@naver.com', password: 'password' })
        .expect(201)
        .expect({
          refresh_token: { token: 'refresh_token', expires_in: '6000000' },
        });
    });

    it('이메일 형식이 올바르지 않은 경우', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'naver.com', password: 'password' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'email is invalid',
          error: 'Bad Request',
        });
    });
  });

  describe('/refresh (GET)', () => {
    it('성공적으로 토큰을 재발급한 경우', () => {
      jest
        .spyOn(JwtService.prototype, 'verify')
        .mockReturnValue({ type: 'refresh', sub: 'uuid' });

      jest.spyOn(JwtService.prototype, 'sign').mockReturnValue('uuid');
      jest.spyOn(mockUserModel, 'query').mockImplementationOnce(() => ({
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
        .get('/auth/refresh')
        .query({ token: 'token' })
        .expect(200)
        .expect({ refresh_token: { token: 'uuid', expires_in: '6000000' } });
    });

    it('리프레쉬 토큰이 아닌 경우', () => {
      jest
        .spyOn(JwtService.prototype, 'verify')
        .mockReturnValue({ type: 'access', sub: 'uuid' });

      return request(app.getHttpServer())
        .get('/auth/refresh')
        .query({ token: 'token' })
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'token is not refresh token',
          error: 'Unauthorized',
        });
    });

    it('토큰 페이로드의 유저가 올바르지 않은 경우', () => {
      jest
        .spyOn(JwtService.prototype, 'verify')
        .mockReturnValue({ type: 'refresh', sub: 'uuid' });

      jest.spyOn(mockUserModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));
      return request(app.getHttpServer())
        .get('/auth/refresh')
        .query({ token: 'token' })
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'user is invalid',
          error: 'Unauthorized',
        });
    });
  });
});
