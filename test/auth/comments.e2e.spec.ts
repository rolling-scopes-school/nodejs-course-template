import { request } from '../lib';
import { commentsRoutes } from '../endpoints';
import { StatusCodes } from 'http-status-codes';

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Comment (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };

  describe('GET comments by articleId', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(commentsRoutes.getByArticle(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET comment by id', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(commentsRoutes.getById(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send({
          content: 'Test comment',
          articleId: randomUUID,
          authorId: null,
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(commentsRoutes.delete(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
