import { validate } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { request } from './lib';
import {
  getTokenAndUserId,
  shouldAuthorizationBeTested,
  removeTokenUser,
} from './utils';
import { tracksRoutes } from './endpoints';

const createTrackDto = {
  name: 'TEST_TRACK',
  duration: 199,
  artistId: null,
  albumId: null,
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Tracks (e2e)', () => {
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
    // delete mock user
    if (mockUserId) {
      await removeTokenUser(unauthorizedRequest, mockUserId, commonHeaders);
    }

    if (commonHeaders['Authorization']) {
      delete commonHeaders['Authorization'];
    }
  });

  describe('GET', () => {
    it('should correctly get all tracks', async () => {
      const response = await unauthorizedRequest
        .get(tracksRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should correctly get track by id', async () => {
      const creationResponse = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto);

      const { id } = creationResponse.body;

      expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);

      const searchResponse = await unauthorizedRequest
        .get(tracksRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.OK);
      expect(searchResponse.body).toBeInstanceOf(Object);

      const cleanupResponse = await unauthorizedRequest
        .delete(tracksRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .get(tracksRoutes.getById('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if track doesn't exist", async () => {
      const response = await unauthorizedRequest
        .get(tracksRoutes.getById(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST', () => {
    it('should correctly create track', async () => {
      const response = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto);

      expect(response.status).toBe(StatusCodes.CREATED);

      const { id, name, duration, artistId, albumId } = response.body;
      expect(validate(id)).toBe(true);
      expect(name).toBe(createTrackDto.name);
      expect(duration).toBe(createTrackDto.duration);
      expect(artistId).toBe(createTrackDto.artistId);
      expect(albumId).toBe(createTrackDto.albumId);

      const cleanupResponse = await unauthorizedRequest
        .delete(tracksRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST in case of invalid required data', async () => {
      const responses = await Promise.all([
        unauthorizedRequest
          .post(tracksRoutes.create)
          .set(commonHeaders)
          .send({}),
        unauthorizedRequest.post(tracksRoutes.create).set(commonHeaders).send({
          name: 'TEST_TRACK',
        }),
        unauthorizedRequest.post(tracksRoutes.create).set(commonHeaders).send({
          duration: 99,
        }),
        unauthorizedRequest.post(tracksRoutes.create).set(commonHeaders).send({
          name: null,
          duration: '99',
        }),
      ]);

      expect(
        responses.every(
          ({ statusCode }) => statusCode === StatusCodes.BAD_REQUEST,
        ),
      ).toBe(true);
    });
  });

  describe('PUT', () => {
    it('should correctly update track match', async () => {
      const creationResponse = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto);

      const { id: createdId } = creationResponse.body;

      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const updateResponse = await unauthorizedRequest
        .put(tracksRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          name: createTrackDto.name,
          duration: 188,
          artistId: createTrackDto.artistId,
          albumId: createTrackDto.albumId,
        });

      expect(updateResponse.statusCode).toBe(StatusCodes.OK);

      const {
        id: updatedId,
        name,
        duration,
        artistId,
        albumId,
      } = updateResponse.body;

      expect(name).toBe(createTrackDto.name);
      expect(artistId).toBe(createTrackDto.artistId);
      expect(albumId).toBe(createTrackDto.albumId);
      expect(typeof duration).toBe('number');
      expect(validate(updatedId)).toBe(true);
      expect(createdId).toBe(updatedId);

      const cleanupResponse = await unauthorizedRequest
        .delete(tracksRoutes.delete(createdId))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .put(tracksRoutes.update('some-invalid-id'))
        .set(commonHeaders)
        .send({
          name: createTrackDto.name,
          duration: 188,
          artistId: createTrackDto.artistId,
          albumId: createTrackDto.albumId,
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should respond with BAD_REQUEST status code in case of invalid dto', async () => {
      const creationResponse = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto);

      const { id: createdId } = creationResponse.body;

      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const response = await unauthorizedRequest
        .put(tracksRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          name: null,
          duration: '188',
          artistId: 123,
          albumId: 123,
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if track doesn't exist", async () => {
      const response = await unauthorizedRequest
        .put(tracksRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          name: createTrackDto.name,
          duration: 188,
          artistId: createTrackDto.artistId,
          albumId: createTrackDto.albumId,
        });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE', () => {
    it('should correctly delete track', async () => {
      const response = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto);

      const { id } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      const cleanupResponse = await unauthorizedRequest
        .delete(tracksRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const searchResponse = await unauthorizedRequest
        .get(tracksRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .delete(tracksRoutes.delete('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if track doesn't exist", async () => {
      const response = await unauthorizedRequest
        .delete(tracksRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
