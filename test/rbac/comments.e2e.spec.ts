import request from '../lib/request';
import { StatusCodes } from 'http-status-codes';
import {
  shouldAuthorizationBeTested,
  getTokenAndUserId,
  getUserTokenByRole,
  removeTokenUser,
} from '../utils';
import { commentsRoutes, articlesRoutes } from '../endpoints';

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('RBAC - Comments (e2e)', () => {
  const headers = { Accept: 'application/json' };
  let adminHeaders: Record<string, string>;
  let editorHeaders: Record<string, string>;
  let viewerHeaders: Record<string, string>;

  let adminUserId: string;
  let editorUserId: string;
  let viewerUserId: string;
  let testArticleId: string;

  beforeAll(async () => {
    if (!shouldAuthorizationBeTested) return;

    const adminResult = await getTokenAndUserId(request);
    adminHeaders = { ...headers, Authorization: adminResult.token };
    adminUserId = adminResult.mockUserId;

    const editorResult = await getUserTokenByRole(request, 'editor', adminHeaders);
    editorHeaders = { ...headers, Authorization: editorResult.token };
    editorUserId = editorResult.userId;

    const viewerResult = await getUserTokenByRole(request, 'viewer', adminHeaders);
    viewerHeaders = { ...headers, Authorization: viewerResult.token };
    viewerUserId = viewerResult.userId;

    // Create test article for comments
    const createArticleResponse = await request
      .post(articlesRoutes.create)
      .set(adminHeaders)
      .send({
        title: 'TEST_ARTICLE_FOR_RBAC_COMMENTS',
        content: 'Test content',
        status: 'draft',
        authorId: null,
        categoryId: null,
        tags: [],
      });

    testArticleId = createArticleResponse.body.id;
  });

  afterAll(async () => {
    if (!shouldAuthorizationBeTested) return;

    if (testArticleId) {
      await request.delete(articlesRoutes.delete(testArticleId)).set(adminHeaders);
    }
    if (viewerUserId) {
      await removeTokenUser(request, viewerUserId, adminHeaders);
    }
    if (editorUserId) {
      await removeTokenUser(request, editorUserId, adminHeaders);
    }
    if (adminUserId) {
      await removeTokenUser(request, adminUserId, adminHeaders);
    }
  });

  describe('Viewer role', () => {
    it('should allow GET comments by articleId', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(commentsRoutes.getByArticle(testArticleId))
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should deny POST comment', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .post(commentsRoutes.create)
        .set(viewerHeaders)
        .send({
          content: 'Test comment',
          articleId: testArticleId,
          authorId: viewerUserId,
        });

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny DELETE comment', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .delete(commentsRoutes.delete(randomUUID))
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('Editor role', () => {
    it('should allow GET comments by articleId', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(commentsRoutes.getByArticle(testArticleId))
        .set(editorHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should allow POST own comment', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .post(commentsRoutes.create)
        .set(editorHeaders)
        .send({
          content: 'Editor comment',
          articleId: testArticleId,
          authorId: editorUserId,
        });

      expect(response.status).toBe(StatusCodes.CREATED);

      // Cleanup
      const { id } = response.body;
      await request.delete(commentsRoutes.delete(id)).set(adminHeaders);
    });

    it("should deny DELETE other's comment", async () => {
      if (!shouldAuthorizationBeTested) return;

      // Create comment as admin
      const createResponse = await request
        .post(commentsRoutes.create)
        .set(adminHeaders)
        .send({
          content: 'Admin comment',
          articleId: testArticleId,
          authorId: adminUserId,
        });

      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const { id: commentId } = createResponse.body;

      const deleteResponse = await request
        .delete(commentsRoutes.delete(commentId))
        .set(editorHeaders);

      expect(deleteResponse.status).toBe(StatusCodes.FORBIDDEN);

      // Cleanup
      await request.delete(commentsRoutes.delete(commentId)).set(adminHeaders);
    });
  });

  describe('Admin role', () => {
    it('should allow full operations on comments', async () => {
      if (!shouldAuthorizationBeTested) return;

      // POST
      const createResponse = await request
        .post(commentsRoutes.create)
        .set(adminHeaders)
        .send({
          content: 'Admin test comment',
          articleId: testArticleId,
          authorId: adminUserId,
        });

      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const { id: commentId } = createResponse.body;

      // GET by articleId
      const getResponse = await request
        .get(commentsRoutes.getByArticle(testArticleId))
        .set(adminHeaders);

      expect(getResponse.status).toBe(StatusCodes.OK);

      // DELETE
      const deleteResponse = await request
        .delete(commentsRoutes.delete(commentId))
        .set(adminHeaders);

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
