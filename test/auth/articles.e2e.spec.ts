import { request } from '../lib';
import { articlesRoutes } from '../endpoints';
import { StatusCodes } from 'http-status-codes';

const createArticleDto = {
  title: 'TEST_ARTICLE',
  content: 'Test article content',
  status: 'draft',
  authorId: null,
  categoryId: null,
  tags: [],
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Article (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };

  describe('GET all articles', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(articlesRoutes.getAll)
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET article by id', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(articlesRoutes.getById(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PUT', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .put(articlesRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          title: 'Updated',
          content: 'Updated content',
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(articlesRoutes.delete(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
