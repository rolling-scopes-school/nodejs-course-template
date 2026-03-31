import request from '../lib/request';
import { StatusCodes } from 'http-status-codes';
import {
  shouldAuthorizationBeTested,
  getTokenAndUserId,
  getUserTokenByRole,
  removeTokenUser,
} from '../utils';
import { categoriesRoutes } from '../endpoints';

const createCategoryDto = {
  name: 'TEST_RBAC_CATEGORY',
  description: 'Test category for RBAC',
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('RBAC - Categories (e2e)', () => {
  const headers = { Accept: 'application/json' };
  let adminHeaders: Record<string, string>;
  let editorHeaders: Record<string, string>;
  let viewerHeaders: Record<string, string>;

  let adminUserId: string;
  let editorUserId: string;
  let viewerUserId: string;

  beforeAll(async () => {
    if (!shouldAuthorizationBeTested) return;

    // Create admin user
    const adminResult = await getTokenAndUserId(request);
    adminHeaders = { ...headers, Authorization: adminResult.token };
    adminUserId = adminResult.mockUserId;

    // Create editor and viewer users
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
    it('should allow GET all categories', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(categoriesRoutes.getAll)
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should deny POST category', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .post(categoriesRoutes.create)
        .set(viewerHeaders)
        .send(createCategoryDto);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny PUT category', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .put(categoriesRoutes.update(randomUUID))
        .set(viewerHeaders)
        .send(createCategoryDto);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny DELETE category', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .delete(categoriesRoutes.delete(randomUUID))
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('Editor role', () => {
    it('should allow GET all categories', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(categoriesRoutes.getAll)
        .set(editorHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should deny POST category', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .post(categoriesRoutes.create)
        .set(editorHeaders)
        .send(createCategoryDto);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny PUT category', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .put(categoriesRoutes.update(randomUUID))
        .set(editorHeaders)
        .send(createCategoryDto);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny DELETE category', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .delete(categoriesRoutes.delete(randomUUID))
        .set(editorHeaders);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('Admin role', () => {
    it('should allow full CRUD on categories', async () => {
      if (!shouldAuthorizationBeTested) return;

      // POST
      const createResponse = await request
        .post(categoriesRoutes.create)
        .set(adminHeaders)
        .send(createCategoryDto);

      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const { id: categoryId } = createResponse.body;

      // GET all
      const getAllResponse = await request
        .get(categoriesRoutes.getAll)
        .set(adminHeaders);

      expect(getAllResponse.status).toBe(StatusCodes.OK);

      // GET by id
      const getByIdResponse = await request
        .get(categoriesRoutes.getById(categoryId))
        .set(adminHeaders);

      expect(getByIdResponse.status).toBe(StatusCodes.OK);

      // PUT
      const updateResponse = await request
        .put(categoriesRoutes.update(categoryId))
        .set(adminHeaders)
        .send({ name: 'UPDATED', description: 'Updated' });

      expect(updateResponse.status).toBe(StatusCodes.OK);

      // DELETE
      const deleteResponse = await request
        .delete(categoriesRoutes.delete(categoryId))
        .set(adminHeaders);

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
