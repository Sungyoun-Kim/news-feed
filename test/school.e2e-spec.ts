import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { getModelToken } from 'nestjs-dynamoose';

const mockRegionModel = {
  query: jest.fn(),
};
const mockSchoolModel = {
  create: jest.fn(),
};
describe('school (e2e)', () => {
  let app: INestApplication;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: getModelToken('Regions'), useValue: mockRegionModel },
        { provide: getModelToken('Schools'), useValue: mockSchoolModel },
      ],
    })
      .overrideProvider(getModelToken('Regions'))
      .useValue(mockRegionModel)
      .overrideProvider(getModelToken('Schools'))
      .useValue(mockSchoolModel)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  const getAdminAuth = async () =>
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'suj970@naver.com', password: '1234' });

  describe('/ (POST)', () => {
    it('성공적으로 학교 페이지를 생성하는 경우', async () => {
      jest.spyOn(mockRegionModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [
            {
              name: '서울특별시',
            },
          ],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          name: '성윤고등학교',
          region_name: '서울특별시',
        })
        .expect(201)
        .expect('"create school page successfully"');
    });
    it('지역이 존재하지 않는 경우', async () => {
      jest.spyOn(mockRegionModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          name: '성윤고등학교',
          region_name: '서울특별시',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'region does not exist',
          error: 'Bad Request',
        });
    });
  });
});