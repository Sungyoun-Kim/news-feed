import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { Item, getModelToken } from 'nestjs-dynamoose';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/interface/user.interface';

const mockFeedModel = {
  create: jest.fn(),
  query: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  scan: jest.fn(),
};

const mockSchoolModel = {
  create: jest.fn(),
  query: jest.fn(),
  scan: jest.fn(),
  get: jest.fn(),
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
        { provide: getModelToken('Schools'), useValue: mockSchoolModel },
        { provide: getModelToken('Feeds'), useValue: mockFeedModel },
      ],
    })
      .overrideProvider(getModelToken('Schools'))
      .useValue(mockSchoolModel)
      .overrideProvider(getModelToken('Feeds'))
      .useValue(mockFeedModel)

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

  const getInvalidAdminAuth = async () =>
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'suj9730@naver.com', password: '1234' });

  const getUserAuth = async () =>
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@email.com', password: '1234' });

  const getAdminAuth = async () =>
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'suj970@naver.com', password: '1234' });

  describe('/schools/:id/feed (POST)', () => {
    it('성공적으로 피드를 작성하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest.spyOn(mockFeedModel, 'create').mockImplementationOnce(() => ({
        subject: '페이지 생성 후 첫 소식',
        content: '페이지 생성 후 첫 소식이에요',
        school: {
          id: '27683a25-3d9d-48c6-9913-e60602445dca',
          name: '123123',
        },
        id: '1b14ab6c-3671-4a05-8edc-2532f1407a91',
        created_at: 1688961826662,
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          subject: '제목',
          content: '내용',
        })
        .expect(201)
        .expect({
          subject: '페이지 생성 후 첫 소식',
          content: '페이지 생성 후 첫 소식이에요',
          school: {
            id: '27683a25-3d9d-48c6-9913-e60602445dca',
            name: '123123',
          },
          id: '1b14ab6c-3671-4a05-8edc-2532f1407a91',
          created_at: 1688961826662,
        });
    });

    it('작성하려는 학교 존재하지 않는 경우', async () => {
      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          subject: '제목',
          content: '내용',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'school does not exist',
          error: 'Bad Request',
        });
    });

    it('id를 가진 회사의 관리자가 아닌 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      const response = await getInvalidAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          subject: '제목',
          content: '내용',
        })
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'no permission',
          error: 'Forbidden',
        });
    });

    it('유저의 권한이 부족한 경우 ', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          message: 'insufficient permission',
          error: 'Forbidden',
          statusCode: 403,
        });
    });
  });

  describe('/schools/:schoolId/feeds/:feedId (DELETE)', () => {
    it('성공적으로 피드를 삭제하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest.spyOn(mockFeedModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [
            {
              id: 'c24788ba-62bb-49c5-a08f-2a9f82a0a44c',
              created_at: 1688736027197,
              content: '내용',
              school: {
                name: '행복고등학교',
                id: '82d9823c-6f22-4c33-9f8c-f1c5ffce171b',
              },
              subject: '제목',
            },
          ],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(204);
    });

    it('학교가 존재하지 않는 경우', async () => {
      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'school does not exist',
          error: 'Bad Request',
        });
    });

    it('id를 가진 회사의 관리자가 아닌 경우 ', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      const response = await getInvalidAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'no permission',
          error: 'Forbidden',
        });
    });

    it('삭제하려는 피드가 존재하지 않는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest.spyOn(mockFeedModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'feed does not exist',
          error: 'Bad Request',
        });
    });

    it('유저의 권한이 부족한 경우 ', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          message: 'insufficient permission',
          error: 'Forbidden',
          statusCode: 403,
        });
    });
  });

  describe('/schools/:schoolId/feeds/:feedId (PATCH)', () => {
    it('성공적으로 피드를 수정하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest.spyOn(mockFeedModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [
            {
              id: 'c24788ba-62bb-49c5-a08f-2a9f82a0a44c',
              created_at: 1688736027197,
              content: '내용',
              school: {
                name: '행복고등학교',
                id: '82d9823c-6f22-4c33-9f8c-f1c5ffce171b',
              },
              subject: '제목',
            },
          ],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(204);
    });

    it('학교가 존재하지 않는 경우', async () => {
      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'school does not exist',
          error: 'Bad Request',
        });
    });

    it('id를 가진 회사의 관리자가 아닌 경우 ', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      const response = await getInvalidAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'no permission',
          error: 'Forbidden',
        });
    });

    it('수정하려는 피드가 존재하지 않는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest.spyOn(mockFeedModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'feed does not exist',
          error: 'Bad Request',
        });
    });
    it('유저의 권한이 부족한 경우 ', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          message: 'insufficient permission',
          error: 'Forbidden',
          statusCode: 403,
        });
    });
  });

  describe('/schools/:schoolId/feed', () => {
    it('유저가 성공적으로 소식을 조회하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest
        .spyOn(UsersService.prototype, 'findUserByIdAndEmail')
        .mockResolvedValue({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: ['uuid'],
        } as Item<User>);

      jest.spyOn(mockFeedModel, 'scan').mockImplementationOnce(() => ({
        exec: () => [
          {
            region_name: '경상남도',
            id: 'uuid',
            name: '행복고등학교',
            admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
          },
        ],
      }));

      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .get('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(200)
        .expect([
          {
            region_name: '경상남도',
            id: 'uuid',
            name: '행복고등학교',
            admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
          },
        ]);
    });

    it('schoolId를 가진 학교가 존재하지 않는 경우', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .get('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          message: 'school does not exist',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
    it('유저가 schoolId를 가진 학교 페이지를 구독하지 않은 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));
      jest
        .spyOn(UsersService.prototype, 'findUserByIdAndEmail')
        .mockResolvedValue({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: [],
        } as Item<User>);

      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .get('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          message: 'should subscribe school page',
          error: 'Forbidden',
          statusCode: 403,
        });
    });
  });
});
