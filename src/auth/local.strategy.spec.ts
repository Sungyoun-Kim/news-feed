import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/users/users.service';

describe('localStrategy', () => {
  let userService: UsersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    userService = app.get<UsersService>(UsersService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
