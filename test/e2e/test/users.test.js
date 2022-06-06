const { request: unauthorizedRequest, routes } = require('../lib');
const debug = require('debug')('rs:test:users');
const {
  createAuthorizedRequest,
  shouldAuthorizationBeTested
} = require('../utils');

const TEST_USER_DATA = {
  name: 'TEST_USER',
  login: 'test_user',
  password: 'T35t_P@55w0rd'
};

describe('Users suite', () => {
  let request = unauthorizedRequest;

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      request = await createAuthorizedRequest(unauthorizedRequest);
    }
  });

  describe('GET', () => {
    it('should get all users', async () => {
      const usersResponse = await request
        .get(routes.users.getAll)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/);
      debug(usersResponse.body);

      expect(usersResponse.status).toBe(200);
      expect(Array.isArray(usersResponse.body)).toBe(true);
    });

    it('should get a user by id', async () => {
      // Setup:
      let userId;

      // Create the user
      await request
        .post(routes.users.create)
        .set('Accept', 'application/json')
        .send(TEST_USER_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(typeof res.body.id).toBe('string');
          userId = res.body.id;
        });

      // Test:
      const userResponse = await request
        .get(routes.users.getById(userId))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(userResponse.body).toBeInstanceOf(Object);
      expect(userResponse.body.id).toEqual(userId);

      // Clean up, delete the user we created
      await request.delete(routes.users.delete(userId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true)); // to be one of the array expected statuses
    });

    it('should answer with status code 400 and corresponding message if userId is invalid (not uuid)',
      async () => {
        const invalidId = '123'
        await request
          .get(routes.users.getById(invalidId))
          .set('Accept', 'application/json')
          .expect(400)
      });

    it('should answer with status code 404 and corresponding message if record with id === userId doesn\'t exist',
      async () => {
        // Setup:
        const userId = '2383678d-fa20-4635-af2f-cbc5087bb0af'
        await request.delete(routes.users.delete(userId));

        // Test:
        await request
          .get(routes.users.getById(userId))
          .set('Accept', 'application/json')
          .expect(404)
      });
  });

  describe('POST', () => {
    it('should create user successfully', async () => {
      let userId;

      await request
        .post(routes.users.create)
        .set('Accept', 'application/json')
        .send(TEST_USER_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => {
          expect( typeof res.body.id).toBe('string');
          userId = res.body.id;
          expect(res.body).not.toHaveProperty('password');
          expect(res.body).toMatchObject({
            login: TEST_USER_DATA.login,
            name: TEST_USER_DATA.name
          });
        });

      // Teardown
      await request.delete(routes.users.delete(userId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });

    it('should answer with status code 400 and corresponding message if request body does not contain required fields',
      async () => {
      const {name, ...nameLessData} = TEST_USER_DATA

      await request
        .post(routes.users.create)
        .set('Accept', 'application/json')
        .send(nameLessData)
        .expect(400)
    });
  });

  describe('PUT', () => {
    it('should update user successfully', async () => {
      // Setup
      let userId;

      await request
        .post(routes.users.create)
        .set('Accept', 'application/json')
        .send(TEST_USER_DATA)
        .then(res => {
          userId = res.body.id;
        });

      const updatedUser = {
        ...TEST_USER_DATA,
        name: 'Autotest updated TEST_USER',
        id: userId
      };

      // Test
      await request
        .put(routes.users.update(userId))
        .set('Accept', 'application/json')
        .send(updatedUser)
        .expect(200)
        .expect('Content-Type', /json/);

      // eslint-disable-next-line no-unused-vars
      const { password, ...expectedUser } = updatedUser;

      await request
        .get(routes.users.getById(userId))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toMatchObject(expectedUser));

      // Teardown
      await request.delete(routes.users.delete(userId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });

    it('should answer with status code 400 and corresponding message if userId is invalid (not uuid)',
      async () => {
        const invalidId = '123'
        await request
          .put(routes.users.update(invalidId))
          .set('Accept', 'application/json')
          .expect(400)
      });

    it('should answer with status code 404 and corresponding message if record with id === userId doesn\'t exist',
      async () => {
        // Setup:
        const userId = '2383678d-fa20-4635-af2f-cbc5087bb0af'
        await request.delete(routes.users.delete(userId));

        // Test:
        await request
          .put(routes.users.update(userId))
          .set('Accept', 'application/json')
          .expect(404)
      });
  });

  describe('DELETE', () => {
    it('should delete user successfully', async () => {
      // Setup:
      const userResponse = await request
        .post(routes.users.create)
        .send(TEST_USER_DATA);
      const userId = userResponse.body.id;

      // Test:
      const deleteResponse = await request.delete(routes.users.delete(userId));
      expect([200, 204].includes(deleteResponse.status)).toBe(true);
    });

    it('should answer with status code 400 and corresponding message if userId is invalid (not uuid)',
      async () => {
        const invalidId = '123'
        await request
          .delete(routes.users.delete(invalidId))
          .set('Accept', 'application/json')
          .expect(400)
      });

    it('should answer with status code 404 and corresponding message if record with id === userId doesn\'t exist',
      async () => {
        // Setup:
        const userId = '2383678d-fa20-4635-af2f-cbc5087bb0af'
        await request.delete(routes.users.delete(userId));

        // Test:
        await request
          .delete(routes.users.delete(userId))
          .set('Accept', 'application/json')
          .expect(404)
      });
  });

});
