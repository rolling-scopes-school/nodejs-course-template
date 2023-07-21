import { request } from '../lib';
import { StatusCodes } from 'http-status-codes';
import { favoritesRoutes } from '../endpoints';

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Favorites (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };

  describe('GET all favorites', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(favoritesRoutes.getAll)
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST album to favorites', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(favoritesRoutes.albums(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST artist to favorites', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(favoritesRoutes.artists(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST track to favorites', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(favoritesRoutes.tracks(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE album from favorites', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(favoritesRoutes.albums(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE artist from favorites', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(favoritesRoutes.artists(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE track from favorites', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(favoritesRoutes.tracks(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
