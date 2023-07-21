import { request } from '../lib';
import { artistsRoutes } from '../endpoints';
import { StatusCodes } from 'http-status-codes';

const createArtistDto = {
  name: 'TEST_artist',
  grammy: true,
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('artist (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };
  describe('GET all artists', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(artistsRoutes.getAll)
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET artist by id', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(artistsRoutes.getById(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PUT', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .put(artistsRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          name: createArtistDto.name,
          grammy: false,
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request.delete(artistsRoutes.delete(randomUUID)).set(commonHeaders);
    });
  });
});
