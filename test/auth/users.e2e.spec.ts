import { request } from '../lib';
import { StatusCodes } from 'http-status-codes';
import { usersRoutes } from '../endpoints';

const createUserDto = {
  login: 'TEST_LOGIN',
  password: 'TEST_PASSWORD',
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Users (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };

  describe('GET all users', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(usersRoutes.getAll)
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET user by id', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(usersRoutes.getById(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(usersRoutes.create)
        .set(commonHeaders)
        .send(createUserDto)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PUT', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .put(usersRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          oldPassword: createUserDto.password,
          newPassword: 'NEW_PASSWORD',
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(usersRoutes.delete(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
