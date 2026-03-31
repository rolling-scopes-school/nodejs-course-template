import { request } from './lib';
import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';
import {
  getTokenAndUserId,
  shouldAuthorizationBeTested,
  removeTokenUser,
} from './utils';
import {
  articlesRoutes,
  categoriesRoutes,
  commentsRoutes,
} from './endpoints';

const createArticleDto = {
  title: 'TEST_ARTICLE',
  content: 'Test article content',
  status: 'draft',
  authorId: null,
  categoryId: null,
  tags: [],
};

const createCategoryDto = {
  name: 'TEST_CATEGORY',
  description: 'Test category description',
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Article (e2e)', () => {
  const unauthorizedRequest = request;
  const commonHeaders = { Accept: 'application/json' };
  let mockUserId: string | undefined;

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      const result = await getTokenAndUserId(unauthorizedRequest);
      commonHeaders['Authorization'] = result.token;
      mockUserId = result.mockUserId;
    }
  });

  afterAll(async () => {
    if (mockUserId) {
      await removeTokenUser(unauthorizedRequest, mockUserId, commonHeaders);
    }

    if (commonHeaders['Authorization']) {
      delete commonHeaders['Authorization'];
    }
  });

  describe('GET', () => {
    it('should correctly get all articles', async () => {
      const response = await unauthorizedRequest
        .get(articlesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should correctly get article by id', async () => {
      const creationResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto);

      const { id } = creationResponse.body;

      expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);

      const searchResponse = await unauthorizedRequest
        .get(articlesRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.OK);
      expect(searchResponse.body).toBeInstanceOf(Object);

      const cleanupResponse = await unauthorizedRequest
        .delete(articlesRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .get(articlesRoutes.getById('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if article doesn't exist", async () => {
      const response = await unauthorizedRequest
        .get(articlesRoutes.getById(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('GET (filtering)', () => {
    it('should correctly filter articles by status', async () => {
      const draftArticle = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({ ...createArticleDto, status: 'draft' });

      expect(draftArticle.status).toBe(StatusCodes.CREATED);
      const { id: draftId } = draftArticle.body;

      const publishedArticle = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({ ...createArticleDto, title: 'PUBLISHED_ARTICLE', status: 'published' });

      expect(publishedArticle.status).toBe(StatusCodes.CREATED);
      const { id: publishedId } = publishedArticle.body;

      const response = await unauthorizedRequest
        .get(`${articlesRoutes.getAll}?status=draft`)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);

      const hasDraft = response.body.some((a) => a.id === draftId);
      const hasPublished = response.body.some((a) => a.id === publishedId);

      expect(hasDraft).toBe(true);
      expect(hasPublished).toBe(false);

      // Cleanup
      await unauthorizedRequest.delete(articlesRoutes.delete(draftId)).set(commonHeaders);
      await unauthorizedRequest.delete(articlesRoutes.delete(publishedId)).set(commonHeaders);
    });

    it('should correctly filter articles by categoryId', async () => {
      const createCategoryResponse = await unauthorizedRequest
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto);

      expect(createCategoryResponse.status).toBe(StatusCodes.CREATED);
      const { id: categoryId } = createCategoryResponse.body;

      const articleWithCategory = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({ ...createArticleDto, categoryId });

      expect(articleWithCategory.status).toBe(StatusCodes.CREATED);
      const { id: articleWithCatId } = articleWithCategory.body;

      const articleWithoutCategory = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({ ...createArticleDto, title: 'NO_CATEGORY', categoryId: null });

      expect(articleWithoutCategory.status).toBe(StatusCodes.CREATED);
      const { id: articleWithoutCatId } = articleWithoutCategory.body;

      const response = await unauthorizedRequest
        .get(`${articlesRoutes.getAll}?categoryId=${categoryId}`)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);

      const hasWithCat = response.body.some((a) => a.id === articleWithCatId);
      const hasWithoutCat = response.body.some((a) => a.id === articleWithoutCatId);

      expect(hasWithCat).toBe(true);
      expect(hasWithoutCat).toBe(false);

      // Cleanup
      await unauthorizedRequest.delete(articlesRoutes.delete(articleWithCatId)).set(commonHeaders);
      await unauthorizedRequest.delete(articlesRoutes.delete(articleWithoutCatId)).set(commonHeaders);
      await unauthorizedRequest.delete(categoriesRoutes.delete(categoryId)).set(commonHeaders);
    });

    it('should correctly filter articles by tag', async () => {
      const articleWithTag = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({ ...createArticleDto, tags: ['nodejs', 'typescript'] });

      expect(articleWithTag.status).toBe(StatusCodes.CREATED);
      const { id: tagArticleId } = articleWithTag.body;

      const articleWithoutTag = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({ ...createArticleDto, title: 'NO_TAG', tags: ['python'] });

      expect(articleWithoutTag.status).toBe(StatusCodes.CREATED);
      const { id: noTagArticleId } = articleWithoutTag.body;

      const response = await unauthorizedRequest
        .get(`${articlesRoutes.getAll}?tag=nodejs`)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);

      const hasTagged = response.body.some((a) => a.id === tagArticleId);
      const hasUntagged = response.body.some((a) => a.id === noTagArticleId);

      expect(hasTagged).toBe(true);
      expect(hasUntagged).toBe(false);

      // Cleanup
      await unauthorizedRequest.delete(articlesRoutes.delete(tagArticleId)).set(commonHeaders);
      await unauthorizedRequest.delete(articlesRoutes.delete(noTagArticleId)).set(commonHeaders);
    });
  });

  describe('POST', () => {
    it('should correctly create article', async () => {
      const response = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto);

      const { id, title, content, status, authorId, categoryId, tags, createdAt, updatedAt } =
        response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      expect(title).toBe(createArticleDto.title);
      expect(content).toBe(createArticleDto.content);
      expect(status).toBe(createArticleDto.status);
      expect(authorId).toBe(createArticleDto.authorId);
      expect(categoryId).toBe(createArticleDto.categoryId);
      expect(tags).toBeInstanceOf(Array);
      expect(validate(id)).toBe(true);
      expect(typeof createdAt).toBe('number');
      expect(typeof updatedAt).toBe('number');

      const cleanupResponse = await unauthorizedRequest
        .delete(articlesRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST in case of invalid required data', async () => {
      const responses = await Promise.all([
        unauthorizedRequest
          .post(articlesRoutes.create)
          .set(commonHeaders)
          .send({}),
        unauthorizedRequest
          .post(articlesRoutes.create)
          .set(commonHeaders)
          .send({ title: 'TEST_ARTICLE' }),
        unauthorizedRequest
          .post(articlesRoutes.create)
          .set(commonHeaders)
          .send({ content: 'Test content' }),
        unauthorizedRequest
          .post(articlesRoutes.create)
          .set(commonHeaders)
          .send({ title: null, content: 12345 }),
      ]);

      expect(
        responses.every(
          ({ statusCode }) => statusCode === StatusCodes.BAD_REQUEST,
        ),
      ).toBe(true);
    });

    it('should respond with BAD_REQUEST for invalid status enum', async () => {
      const response = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({
          title: 'TEST',
          content: 'Test',
          status: 'invalid_status',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('PUT', () => {
    it('should correctly update article', async () => {
      // Create category for assignment
      const creationCategoryResponse = await unauthorizedRequest
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto);

      expect(creationCategoryResponse.statusCode).toBe(StatusCodes.CREATED);
      const { id: updateCategoryId } = creationCategoryResponse.body;

      // Create article
      const creationResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto);

      const { id: createdId } = creationResponse.body;

      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const updatedTitle = 'UPDATED_ARTICLE';
      const updatedContent = 'Updated content';

      const { statusCode } = await unauthorizedRequest
        .put(articlesRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          title: updatedTitle,
          content: updatedContent,
          status: 'published',
          categoryId: updateCategoryId,
          tags: ['updated'],
        });

      expect(statusCode).toBe(StatusCodes.OK);

      const updatedArticleResponse = await unauthorizedRequest
        .get(articlesRoutes.getById(createdId))
        .set(commonHeaders);

      const { id: updatedId, title, content, status, categoryId, tags } =
        updatedArticleResponse.body;

      expect(title).toBe(updatedTitle);
      expect(content).toBe(updatedContent);
      expect(status).toBe('published');
      expect(categoryId).toBe(updateCategoryId);
      expect(tags).toContain('updated');
      expect(validate(updatedId)).toBe(true);
      expect(createdId).toBe(updatedId);

      // Cleanup
      await unauthorizedRequest.delete(articlesRoutes.delete(createdId)).set(commonHeaders);
      await unauthorizedRequest.delete(categoriesRoutes.delete(updateCategoryId)).set(commonHeaders);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .put(articlesRoutes.update('some-invalid-id'))
        .set(commonHeaders)
        .send({
          title: 'TEST',
          content: 'Test',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should respond with BAD_REQUEST status code in case of invalid dto', async () => {
      const creationResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto);

      const { id: createdId } = creationResponse.body;

      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const response = await unauthorizedRequest
        .put(articlesRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          title: true,
          content: 12345,
          categoryId: 123,
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if article doesn't exist", async () => {
      const response = await unauthorizedRequest
        .put(articlesRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          title: 'TEST',
          content: 'Test',
        });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE', () => {
    it('should correctly delete article', async () => {
      const response = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto);

      const { id } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      const cleanupResponse = await unauthorizedRequest
        .delete(articlesRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const searchResponse = await unauthorizedRequest
        .get(articlesRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .delete(articlesRoutes.delete('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if article doesn't exist", async () => {
      const response = await unauthorizedRequest
        .delete(articlesRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should delete all associated comments after article deletion', async () => {
      const createArticleResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto);

      const { id: articleId } = createArticleResponse.body;

      expect(createArticleResponse.status).toBe(StatusCodes.CREATED);

      const createCommentDto = {
        content: 'Test comment',
        articleId,
        authorId: null,
      };

      const createCommentResponse = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send(createCommentDto);

      const { id: commentId } = createCommentResponse.body;

      expect(createCommentResponse.statusCode).toBe(StatusCodes.CREATED);

      const deleteResponse = await unauthorizedRequest
        .delete(articlesRoutes.delete(articleId))
        .set(commonHeaders);

      expect(deleteResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      // Verify comment is deleted
      const searchCommentResponse = await unauthorizedRequest
        .get(commentsRoutes.getById(commentId))
        .set(commonHeaders);

      expect(searchCommentResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
