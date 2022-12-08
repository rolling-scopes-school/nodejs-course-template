import { request } from './lib';
import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';
import {
  getTokenAndUserId,
  shouldAuthorizationBeTested,
  removeTokenUser,
} from './utils';
import { artistsRoutes, albumsRoutes, tracksRoutes } from './endpoints';

const createArtistDto = {
  name: 'TEST_artist',
  grammy: true,
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('artist (e2e)', () => {
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
    it('should correctly get all artists', async () => {
      const response = await unauthorizedRequest
        .get(artistsRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should correctly get artist by id', async () => {
      const creationResponse = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      const { id } = creationResponse.body;

      expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);

      const searchResponse = await unauthorizedRequest
        .get(artistsRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.OK);
      expect(searchResponse.body).toBeInstanceOf(Object);

      const cleanupResponse = await unauthorizedRequest
        .delete(artistsRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .get(artistsRoutes.getById('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if artist doesn't exist", async () => {
      const response = await unauthorizedRequest
        .get(artistsRoutes.getById(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST', () => {
    it('should correctly create artist', async () => {
      const response = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      const { id, name, grammy } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      expect(name).toBe(createArtistDto.name);
      expect(grammy).toBe(createArtistDto.grammy);
      expect(validate(id)).toBe(true);
      const cleanupResponse = await unauthorizedRequest
        .delete(artistsRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST in case of invalid required data', async () => {
      const responses = await Promise.all([
        unauthorizedRequest
          .post(artistsRoutes.create)
          .set(commonHeaders)
          .send({}),
        unauthorizedRequest.post(artistsRoutes.create).set(commonHeaders).send({
          name: 'TEST_artist',
        }),
        unauthorizedRequest.post(artistsRoutes.create).set(commonHeaders).send({
          grammy: true,
        }),
        unauthorizedRequest.post(artistsRoutes.create).set(commonHeaders).send({
          name: null,
          grammy: 'true',
        }),
      ]);

      expect(
        responses.every(
          ({ statusCode }) => statusCode === StatusCodes.BAD_REQUEST,
        ),
      );
    });
  });

  describe('PUT', () => {
    it('should correctly update artist match', async () => {
      const creationResponse = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      const { id: createdId } = creationResponse.body;

      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const updateResponse = await unauthorizedRequest
        .put(artistsRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          name: createArtistDto.name,
          grammy: false,
        });

      expect(updateResponse.statusCode).toBe(StatusCodes.OK);

      const { id: updatedId, name, grammy } = updateResponse.body;

      expect(name).toBe(createArtistDto.name);
      expect(grammy).toBe(false);
      expect(validate(updatedId)).toBe(true);
      expect(createdId).toBe(updatedId);

      const cleanupResponse = await unauthorizedRequest
        .delete(artistsRoutes.delete(createdId))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .put(artistsRoutes.update('some-invalid-id'))
        .set(commonHeaders)
        .send({
          name: createArtistDto.name,
          grammy: false,
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should respond with BAD_REQUEST status code in case of invalid dto', async () => {
      const creationResponse = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      const { id: createdId } = creationResponse.body;
      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const response = await unauthorizedRequest
        .put(artistsRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          name: 12345,
          grammy: 'false',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if artist doesn't exist", async () => {
      const response = await unauthorizedRequest
        .put(artistsRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          name: createArtistDto.name,
          grammy: false,
        });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE', () => {
    it('should correctly delete artist', async () => {
      const response = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      const { id } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      const cleanupResponse = await unauthorizedRequest
        .delete(artistsRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const searchResponse = await unauthorizedRequest
        .get(artistsRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .delete(artistsRoutes.delete('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if artist doesn't exist", async () => {
      const response = await unauthorizedRequest
        .delete(artistsRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should set track.artistId to null after deletion', async () => {
      const creationArtistResponse = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      const { id: artistId } = creationArtistResponse.body;

      const createTrackDto = {
        name: 'TEST_track',
        albumId: null,
        artistId,
        duration: 200,
      };

      expect(creationArtistResponse.status).toBe(StatusCodes.CREATED);

      const creationTrackResponse = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto);

      const { id: trackId } = creationTrackResponse.body;

      expect(creationTrackResponse.statusCode).toBe(StatusCodes.CREATED);

      const artistDeletionResponse = await unauthorizedRequest
        .delete(artistsRoutes.delete(artistId))
        .set(commonHeaders);

      expect(artistDeletionResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const searchTrackResponse = await unauthorizedRequest
        .get(tracksRoutes.getById(trackId))
        .set(commonHeaders);

      expect(searchTrackResponse.statusCode).toBe(StatusCodes.OK);

      const { artistId: trackArtistId } = searchTrackResponse.body;

      expect(trackArtistId).toBeNull();
    });
  });
});
