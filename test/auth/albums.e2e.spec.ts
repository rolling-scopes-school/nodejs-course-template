import { request } from '../lib';
import { albumsRoutes } from '../endpoints';
import { StatusCodes } from 'http-status-codes';

const createAlbumDto = {
  name: 'TEST_ALBUM',
  year: 2022,
  artistId: null,
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Album (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };

  describe('GET all albums', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request.get(albumsRoutes.getAll).expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET album by id', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .get(albumsRoutes.getById(randomUUID))
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .post(albumsRoutes.create)
        .set(commonHeaders)
        .send(createAlbumDto)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PUT', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      const updatedYear = 2021;

      await request
        .put(albumsRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          name: createAlbumDto.name,
          year: updatedYear,
          artistId: randomUUID,
        })
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE', () => {
    it('should get UNAUTHORIZED without token presented', async () => {
      await request
        .delete(albumsRoutes.delete(randomUUID))
        .set(commonHeaders)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
