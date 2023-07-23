import { request } from '../lib';
import { StatusCodes } from 'http-status-codes';
import { tracksRoutes } from '../endpoints';

const createTrackDto = {
  name: 'TEST_TRACK',
  duration: 199,
  artistId: null,
  albumId: null,
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Tracks (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };

  describe('GET all tracks', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(tracksRoutes.getAll)
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET track by id', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(tracksRoutes.getById(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PUT', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .put(tracksRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          name: createTrackDto.name,
          duration: 188,
          artistId: createTrackDto.artistId,
          albumId: createTrackDto.albumId,
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(tracksRoutes.delete(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
