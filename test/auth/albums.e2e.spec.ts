import { request } from '../lib';
import { albumsRoutes } from '../endpoints';

const createAlbumDto = {
  name: 'TEST_ALBUM',
  year: 2022,
  artistId: null,
};

describe('Album (e2e)', () => {
  const commonHeaders = { Accept: 'application/json' };

  describe('GET all albums', () => {
    it('should get 401 without token presented', async () => {
      await request.get(albumsRoutes.getAll).expect(401);
    });
  });

  describe('GET album by id', () => {
    it('should get 401 without token presented', async () => {
      await request
        .get(albumsRoutes.getById('89a93f1c-2c4a-43c9-a81a-1af71bd507a5'))
        .expect(401);
    });
  });

  describe('POST', () => {
    it('should get 401 without token presented', async () => {
      await request
        .post(albumsRoutes.create)
        .set(commonHeaders)
        .send(createAlbumDto)
        .expect(401);
    });
  });

  describe('PUT', () => {
    it('should get 401 without token presented', async () => {
      const updatedYear = 2021;

      await request
        .put(albumsRoutes.update('f15bc21e-a4b3-4056-919b-a108e4b9a818'))
        .set(commonHeaders)
        .send({
          name: createAlbumDto.name,
          year: updatedYear,
          artistId: '6d8a8334-0e28-462e-b635-65accbe83da0',
        })
        .expect(401);
    });
  });

  describe('DELETE', () => {
    it('should get 401 without token presented', async () => {
      await request
        .delete(albumsRoutes.delete('a81d8e0c-907b-447c-bf9c-d1e3dd55e514'))
        .set(commonHeaders)
        .expect(401);
    });
  });
});
