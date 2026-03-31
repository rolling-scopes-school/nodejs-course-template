import request from '../lib/request';
import { StatusCodes } from 'http-status-codes';
import {
  shouldAuthorizationBeTested,
  getTokenAndUserId,
  getUserTokenByRole,
  removeTokenUser,
} from '../utils';
import { articlesRoutes } from '../endpoints';

const createArticleDto = {
  title: 'TEST_RBAC_ARTICLE',
  content: 'Test article for RBAC',
  status: 'draft',
  authorId: null,
  categoryId: null,
  tags: [],
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('RBAC - Articles (e2e)', () => {
  const headers = { Accept: 'application/json' };
  let adminHeaders: Record<string, string>;
  let editorHeaders: Record<string, string>;
  let viewerHeaders: Record<string, string>;

  let adminUserId: string;
  let editorUserId: string;
  let viewerUserId: string;

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
  });

  afterAll(async () => {
    if (!shouldAuthorizationBeTested) return;

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
    it('should allow GET all articles', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(articlesRoutes.getAll)
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should deny POST article', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .post(articlesRoutes.create)
        .set(viewerHeaders)
        .send(createArticleDto);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny PUT article', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .put(articlesRoutes.update(randomUUID))
        .set(viewerHeaders)
        .send(createArticleDto);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny DELETE article', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .delete(articlesRoutes.delete(randomUUID))
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('Editor role', () => {
    it('should allow GET all articles', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(articlesRoutes.getAll)
        .set(editorHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should allow POST own article', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .post(articlesRoutes.create)
        .set(editorHeaders)
        .send({ ...createArticleDto, authorId: editorUserId });

      expect(response.status).toBe(StatusCodes.CREATED);

      // Cleanup
      const { id } = response.body;
      await request.delete(articlesRoutes.delete(id)).set(adminHeaders);
    });

    it('should allow PUT own article', async () => {
      if (!shouldAuthorizationBeTested) return;

      // Create article as editor
      const createResponse = await request
        .post(articlesRoutes.create)
        .set(editorHeaders)
        .send({ ...createArticleDto, authorId: editorUserId });

      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const { id: articleId } = createResponse.body;

      const updateResponse = await request
        .put(articlesRoutes.update(articleId))
        .set(editorHeaders)
        .send({ title: 'UPDATED_BY_EDITOR', content: 'Updated' });

      expect(updateResponse.status).toBe(StatusCodes.OK);

      // Cleanup
      await request.delete(articlesRoutes.delete(articleId)).set(adminHeaders);
    });

    it('should deny DELETE article', async () => {
      if (!shouldAuthorizationBeTested) return;

      // Create article as admin
      const createResponse = await request
        .post(articlesRoutes.create)
        .set(adminHeaders)
        .send(createArticleDto);

      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const { id: articleId } = createResponse.body;

      const deleteResponse = await request
        .delete(articlesRoutes.delete(articleId))
        .set(editorHeaders);

      expect(deleteResponse.status).toBe(StatusCodes.FORBIDDEN);

      // Cleanup
      await request.delete(articlesRoutes.delete(articleId)).set(adminHeaders);
    });
  });

  describe('Admin role', () => {
    it('should allow full CRUD on articles', async () => {
      if (!shouldAuthorizationBeTested) return;

      // POST
      const createResponse = await request
        .post(articlesRoutes.create)
        .set(adminHeaders)
        .send(createArticleDto);

      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const { id: articleId } = createResponse.body;

      // GET all
      const getAllResponse = await request
        .get(articlesRoutes.getAll)
        .set(adminHeaders);

      expect(getAllResponse.status).toBe(StatusCodes.OK);

      // GET by id
      const getByIdResponse = await request
        .get(articlesRoutes.getById(articleId))
        .set(adminHeaders);

      expect(getByIdResponse.status).toBe(StatusCodes.OK);

      // PUT
      const updateResponse = await request
        .put(articlesRoutes.update(articleId))
        .set(adminHeaders)
        .send({ title: 'UPDATED', content: 'Updated' });

      expect(updateResponse.status).toBe(StatusCodes.OK);

      // DELETE
      const deleteResponse = await request
        .delete(articlesRoutes.delete(articleId))
        .set(adminHeaders);

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
