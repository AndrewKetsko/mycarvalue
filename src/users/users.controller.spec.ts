import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';
import exp from 'constants';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne(id: number) {
        return Promise.resolve({
          id,
          email: 'some@mail.com',
          password: 'somePass',
        } as User);
      },
      find(email: string) {
        return Promise.resolve([
          { id: 1, email, password: 'somePass' } as User,
        ]);
      },
      // remove(id: number) {},
      // update() {},
    };
    fakeAuthService = {
      // signup() {},
      signin(email: string, password: string) {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers list of users with email', async () => {
    const users = await controller.findAllUsers('some@mail.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('some@mail.com');
  });

  it('find user by id', async () => {
    const user = await controller.findUser(1);
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser(1)).rejects.toThrow(NotFoundException);
  });

  it('signin, update sessin, return user', async () => {
    const session = { userId: 0 };
    const user = await controller.signin(
      {
        email: 'some@mail.com',
        password: 'somePass',
      },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
