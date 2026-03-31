import request from '../lib/request';
import { StatusCodes } from 'http-status-codes';
import {
  shouldAuthorizationBeTested,
  getTokenAndUserId,
  getUserTokenByRole,
  removeTokenUser,
} from '../utils';
import { usersRoutes } from '../endpoints';

const createUserDto = {
  login: 'TEST_RBAC_NEW_USER',
  password: 'TEST_PASSWORD',
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('RBAC - Users (e2e)', () => {
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
    it('should allow GET all users', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(usersRoutes.getAll)
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should allow GET own user by id', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(usersRoutes.getById(viewerUserId))
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should deny POST (create user)', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .post(usersRoutes.create)
        .set(viewerHeaders)
        .send(createUserDto);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny PUT on other users', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .put(usersRoutes.update(editorUserId))
        .set(viewerHeaders)
        .send({
          oldPassword: 'test',
          newPassword: 'fake',
        });

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny DELETE other users', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .delete(usersRoutes.delete(editorUserId))
        .set(viewerHeaders);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('Editor role', () => {
    it('should allow GET all users', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .get(usersRoutes.getAll)
        .set(editorHeaders);

      expect(response.status).toBe(StatusCodes.OK);
    });

    it('should deny POST (create user)', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .post(usersRoutes.create)
        .set(editorHeaders)
        .send(createUserDto);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny PUT on other users', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .put(usersRoutes.update(viewerUserId))
        .set(editorHeaders)
        .send({
          oldPassword: 'test',
          newPassword: 'fake',
        });

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should deny DELETE other users', async () => {
      if (!shouldAuthorizationBeTested) return;

      const response = await request
        .delete(usersRoutes.delete(viewerUserId))
        .set(editorHeaders);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('Admin role', () => {
    it('should allow full CRUD on users', async () => {
      if (!shouldAuthorizationBeTested) return;

      // POST (create)
      const createResponse = await request
        .post(usersRoutes.create)
        .set(adminHeaders)
        .send(createUserDto);

      expect(createResponse.status).toBe(StatusCodes.CREATED);
      const { id: userId } = createResponse.body;

      // GET all
      const getAllResponse = await request
        .get(usersRoutes.getAll)
        .set(adminHeaders);

      expect(getAllResponse.status).toBe(StatusCodes.OK);

      // GET by id
      const getByIdResponse = await request
        .get(usersRoutes.getById(userId))
        .set(adminHeaders);

      expect(getByIdResponse.status).toBe(StatusCodes.OK);

      // PUT (update password)
      const updateResponse = await request
        .put(usersRoutes.update(userId))
        .set(adminHeaders)
        .send({
          oldPassword: createUserDto.password,
          newPassword: 'NEW_PASSWORD',
        });

      expect(updateResponse.status).toBe(StatusCodes.OK);

      // DELETE
      const deleteResponse = await request
        .delete(usersRoutes.delete(userId))
        .set(adminHeaders);

      expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
