import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    //create fake copy of usersService
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: users.length, email, password } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create new user with hached password', async () => {
    const user = await service.signup('some@some.com', 'somePass');

    expect(user.password).not.toEqual('somePass');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('some@some.com', 'somePass');
    await expect(service.signup('some@some.com', 'somePass')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws an error if signin is called with an unused email', async () => {
    await expect(
      service.signin('someWrongEmail@mail.com', 'somePass'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws an error if invalid password provided', async () => {
    await service.signup('some@mail.com', 'somePass');
    await expect(
      service.signin('some@mail.com', 'someWrongPass'),
    ).rejects.toThrow(BadRequestException);
  });

  it('return a user if correct password provided', async () => {
    await service.signup('some@mail.com', 'somePass');
    const user = await service.signin('some@mail.com', 'somePass');
    expect(user).toBeDefined();
  });
});
