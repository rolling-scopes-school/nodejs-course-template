import { validate } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { request } from './lib';
import {
  getTokenAndUserId,
  shouldAuthorizationBeTested,
  removeTokenUser,
} from './utils';
import { commentsRoutes, articlesRoutes } from './endpoints';

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Comments (e2e)', () => {
  const unauthorizedRequest = request;
  const commonHeaders = { Accept: 'application/json' };
  let mockUserId: string | undefined;
  let testArticleId: string;

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      const result = await getTokenAndUserId(unauthorizedRequest);
      commonHeaders['Authorization'] = result.token;
      mockUserId = result.mockUserId;
    }

    // Create a test article for comments
    const createArticleResponse = await unauthorizedRequest
      .post(articlesRoutes.create)
      .set(commonHeaders)
      .send({
        title: 'TEST_ARTICLE_FOR_COMMENTS',
        content: 'Test content',
        status: 'draft',
        authorId: null,
        categoryId: null,
        tags: [],
      });

    expect(createArticleResponse.status).toBe(StatusCodes.CREATED);
    testArticleId = createArticleResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup test article
    if (testArticleId) {
      await unauthorizedRequest
        .delete(articlesRoutes.delete(testArticleId))
        .set(commonHeaders);
    }

    if (mockUserId) {
      await removeTokenUser(unauthorizedRequest, mockUserId, commonHeaders);
    }

    if (commonHeaders['Authorization']) {
      delete commonHeaders['Authorization'];
    }
  });

  describe('GET', () => {
    it('should correctly get comments by articleId', async () => {
      const response = await unauthorizedRequest
        .get(commentsRoutes.getByArticle(testArticleId))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should correctly get comment by id', async () => {
      const createCommentDto = {
        content: 'Test comment for GET',
        articleId: testArticleId,
        authorId: null,
      };

      const creationResponse = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send(createCommentDto);

      const { id } = creationResponse.body;

      expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);

      const searchResponse = await unauthorizedRequest
        .get(commentsRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.OK);
      expect(searchResponse.body).toBeInstanceOf(Object);

      const cleanupResponse = await unauthorizedRequest
        .delete(commentsRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .get(commentsRoutes.getById('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if comment doesn't exist", async () => {
      const response = await unauthorizedRequest
        .get(commentsRoutes.getById(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return only comments for the specified article', async () => {
      // Create another article
      const anotherArticleResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({
          title: 'ANOTHER_ARTICLE',
          content: 'Another content',
          status: 'draft',
          authorId: null,
          categoryId: null,
          tags: [],
        });

      expect(anotherArticleResponse.status).toBe(StatusCodes.CREATED);
      const { id: anotherArticleId } = anotherArticleResponse.body;

      // Create comment on test article
      const comment1Response = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send({
          content: 'Comment on first article',
          articleId: testArticleId,
          authorId: null,
        });

      expect(comment1Response.status).toBe(StatusCodes.CREATED);
      const { id: comment1Id } = comment1Response.body;

      // Create comment on another article
      const comment2Response = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send({
          content: 'Comment on second article',
          articleId: anotherArticleId,
          authorId: null,
        });

      expect(comment2Response.status).toBe(StatusCodes.CREATED);
      const { id: comment2Id } = comment2Response.body;

      // Get comments for test article only
      const response = await unauthorizedRequest
        .get(commentsRoutes.getByArticle(testArticleId))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);

      const hasComment1 = response.body.some((c) => c.id === comment1Id);
      const hasComment2 = response.body.some((c) => c.id === comment2Id);

      expect(hasComment1).toBe(true);
      expect(hasComment2).toBe(false);

      // Cleanup
      await unauthorizedRequest.delete(commentsRoutes.delete(comment1Id)).set(commonHeaders);
      await unauthorizedRequest.delete(commentsRoutes.delete(comment2Id)).set(commonHeaders);
      await unauthorizedRequest.delete(articlesRoutes.delete(anotherArticleId)).set(commonHeaders);
    });
  });

  describe('POST', () => {
    it('should correctly create comment', async () => {
      const createCommentDto = {
        content: 'Test comment',
        articleId: testArticleId,
        authorId: null,
      };

      const response = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send(createCommentDto);

      expect(response.status).toBe(StatusCodes.CREATED);

      const { id, content, articleId, authorId, createdAt } = response.body;
      expect(validate(id)).toBe(true);
      expect(content).toBe(createCommentDto.content);
      expect(articleId).toBe(createCommentDto.articleId);
      expect(authorId).toBe(createCommentDto.authorId);
      expect(typeof createdAt).toBe('number');

      const cleanupResponse = await unauthorizedRequest
        .delete(commentsRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST in case of invalid required data', async () => {
      const responses = await Promise.all([
        unauthorizedRequest
          .post(commentsRoutes.create)
          .set(commonHeaders)
          .send({}),
        unauthorizedRequest
          .post(commentsRoutes.create)
          .set(commonHeaders)
          .send({ content: 'Test comment' }),
        unauthorizedRequest
          .post(commentsRoutes.create)
          .set(commonHeaders)
          .send({ articleId: testArticleId }),
        unauthorizedRequest
          .post(commentsRoutes.create)
          .set(commonHeaders)
          .send({ content: null, articleId: 12345 }),
      ]);

      expect(
        responses.every(
          ({ statusCode }) => statusCode === StatusCodes.BAD_REQUEST,
        ),
      ).toBe(true);
    });

    it('should respond with UNPROCESSABLE_ENTITY if articleId does not exist', async () => {
      const response = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send({
          content: 'Test comment',
          articleId: randomUUID,
          authorId: null,
        });

      expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('should respond with BAD_REQUEST if articleId is invalid UUID', async () => {
      const response = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send({
          content: 'Test comment',
          articleId: 'invalid-uuid',
          authorId: null,
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('DELETE', () => {
    it('should correctly delete comment', async () => {
      const createCommentDto = {
        content: 'Comment to delete',
        articleId: testArticleId,
        authorId: null,
      };

      const response = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send(createCommentDto);

      const { id } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      const cleanupResponse = await unauthorizedRequest
        .delete(commentsRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const searchResponse = await unauthorizedRequest
        .get(commentsRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .delete(commentsRoutes.delete('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if comment doesn't exist", async () => {
      const response = await unauthorizedRequest
        .delete(commentsRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
