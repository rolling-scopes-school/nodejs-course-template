import { request } from '../lib';
import { categoriesRoutes } from '../endpoints';
import { StatusCodes } from 'http-status-codes';

const createCategoryDto = {
  name: 'TEST_CATEGORY',
  description: 'Test category description',
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Category (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };

  describe('GET all categories', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(categoriesRoutes.getAll)
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET category by id', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(categoriesRoutes.getById(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PUT', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .put(categoriesRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          name: createCategoryDto.name,
          description: 'Updated',
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(categoriesRoutes.delete(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
