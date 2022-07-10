import { request } from './lib';
import { StatusCodes } from 'http-status-codes';
import {
  getTokenAndUserId,
  shouldAuthorizationBeTested,
  removeTokenUser,
} from './utils';
import {
  albumsRoutes,
  artistsRoutes,
  tracksRoutes,
  favoritesRoutes,
} from './endpoints';

const createAlbumDto = {
  name: 'TEST_ALBUM',
  year: 2022,
  artistId: null,
};

const createArtistDto = {
  name: 'TEST_artist',
  grammy: true,
};

const createTrackDto = {
  name: 'Test track',
  duration: 335,
  artistId: null,
  albumId: null,
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Favorites (e2e)', () => {
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

  describe('GET (basic)', () => {
    it('should correctly get all favorites (at least empty)', async () => {
      const response = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('artists');
      expect(response.body).toHaveProperty('albums');
      expect(response.body).toHaveProperty('tracks');
      expect(response.body.artists).toBeInstanceOf(Array);
      expect(response.body.albums).toBeInstanceOf(Array);
      expect(response.body.tracks).toBeInstanceOf(Array);
    });
  });

  describe('GET (advanced)', () => {
    it('should correctly get all favorites entitities', async () => {
      const createArtistResponse = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      expect(createArtistResponse.status).toBe(StatusCodes.CREATED);
      const {
        body: { id: artistId },
      } = createArtistResponse;

      const createAlbumResponse = await unauthorizedRequest
        .post(albumsRoutes.create)
        .set(commonHeaders)
        .send({ ...createAlbumDto, artistId });

      expect(createAlbumResponse.status).toBe(StatusCodes.CREATED);
      const {
        body: { id: albumId },
      } = createAlbumResponse;

      const createTrackResponse = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send({ ...createTrackDto, artistId, albumId });

      expect(createTrackResponse.status).toBe(StatusCodes.CREATED);
      const {
        body: { id: trackId },
      } = createTrackResponse;

      const addTrackToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.tracks(trackId))
        .set(commonHeaders);

      expect(addTrackToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const addAlbumToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.albums(albumId))
        .set(commonHeaders);

      expect(addAlbumToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const addArtistToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.artists(artistId))
        .set(commonHeaders);

      expect(addArtistToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const response = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);

      expect(response.body.artists).toContainEqual({
        id: artistId,
        name: createArtistDto.name,
        grammy: createArtistDto.grammy,
      });

      expect(response.body.albums).toContainEqual({
        id: albumId,
        name: createAlbumDto.name,
        year: createAlbumDto.year,
        artistId,
      });

      expect(response.body.tracks).toContainEqual({
        id: trackId,
        name: createTrackDto.name,
        duration: createTrackDto.duration,
        artistId,
        albumId,
      });

      const deleteArtistResponse = await unauthorizedRequest
        .delete(artistsRoutes.delete(artistId))
        .set(commonHeaders);

      expect(deleteArtistResponse.status).toBe(StatusCodes.NO_CONTENT);

      const deleteAlbumResponse = await unauthorizedRequest
        .delete(albumsRoutes.delete(albumId))
        .set(commonHeaders);

      expect(deleteAlbumResponse.status).toBe(StatusCodes.NO_CONTENT);

      const deleteTrackResponse = await unauthorizedRequest
        .delete(tracksRoutes.delete(trackId))
        .set(commonHeaders);

      expect(deleteTrackResponse.status).toBe(StatusCodes.NO_CONTENT);

      const responseAfterDeletion = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(responseAfterDeletion.status).toBe(StatusCodes.OK);

      const artistSearchRes = responseAfterDeletion.body.artists.find(
        (artist) => artist.id === artistId,
      );
      const albumSearchRes = responseAfterDeletion.body.albums.find(
        (album) => album.id === albumId,
      );
      const trackSearchRes = responseAfterDeletion.body.tracks.find(
        (track) => track.id === trackId,
      );

      expect(artistSearchRes).toBeUndefined();
      expect(albumSearchRes).toBeUndefined();
      expect(trackSearchRes).toBeUndefined();
    });
  });

  describe('POST', () => {
    it('should correctly add artist to favorites', async () => {
      const createArtistResponse = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      expect(createArtistResponse.status).toBe(StatusCodes.CREATED);
      const {
        body: { id: artistId },
      } = createArtistResponse;

      const addArtistToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.artists(artistId))
        .set(commonHeaders);

      expect(addArtistToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const response = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.artists).toContainEqual({
        id: artistId,
        name: createArtistDto.name,
        grammy: createArtistDto.grammy,
      });
    });

    it('should correctly add album to favorites', async () => {
      const createAlbumResponse = await unauthorizedRequest
        .post(albumsRoutes.create)
        .set(commonHeaders)
        .send(createAlbumDto);

      expect(createAlbumResponse.status).toBe(StatusCodes.CREATED);
      const {
        body: { id: albumId },
      } = createAlbumResponse;

      const addAlbumToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.albums(albumId))
        .set(commonHeaders);

      expect(addAlbumToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const response = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.albums).toContainEqual({
        id: albumId,
        name: createAlbumDto.name,
        year: createAlbumDto.year,
        artistId: createAlbumDto.artistId,
      });
    });

    it('should correctly add track to favorites', async () => {
      const createTrackResponse = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto);

      expect(createTrackResponse.status).toBe(StatusCodes.CREATED);

      const {
        body: { id: trackId },
      } = createTrackResponse;

      const addTrackToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.tracks(trackId))
        .set(commonHeaders);

      expect(addTrackToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const response = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.tracks).toContainEqual({
        id: trackId,
        name: createTrackDto.name,
        duration: createTrackDto.duration,
        artistId: createTrackDto.artistId,
        albumId: createTrackDto.albumId,
      });
    });

    it('should respond with BAD_REQUEST in case of invalid id', async () => {
      const artistsResponse = await unauthorizedRequest
        .post(favoritesRoutes.artists('invalid'))
        .set(commonHeaders);

      expect(artistsResponse.status).toBe(StatusCodes.BAD_REQUEST);

      const albumsResponse = await unauthorizedRequest
        .post(favoritesRoutes.albums('invalid'))
        .set(commonHeaders);

      expect(albumsResponse.status).toBe(StatusCodes.BAD_REQUEST);

      const tracksResponse = await unauthorizedRequest
        .post(favoritesRoutes.tracks('invalid'))
        .set(commonHeaders);

      expect(tracksResponse.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should respond with UNPROCESSABLE_ENTITY in case of entity absence', async () => {
      const artistsResponse = await unauthorizedRequest
        .post(favoritesRoutes.artists(randomUUID))
        .set(commonHeaders);

      expect(artistsResponse.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);

      const albumsResponse = await unauthorizedRequest
        .post(favoritesRoutes.albums(randomUUID))
        .set(commonHeaders);

      expect(albumsResponse.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);

      const tracksResponse = await unauthorizedRequest
        .post(favoritesRoutes.tracks(randomUUID))
        .set(commonHeaders);

      expect(tracksResponse.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });
  });

  describe('DELETE', () => {
    it('should correctly delete album from favorites', async () => {
      const createAlbumResponse = await unauthorizedRequest
        .post(albumsRoutes.create)
        .set(commonHeaders)
        .send(createAlbumDto);

      expect(createAlbumResponse.status).toBe(StatusCodes.CREATED);
      const {
        body: { id: albumId },
      } = createAlbumResponse;

      const addAlbumToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.albums(albumId))
        .set(commonHeaders);

      expect(addAlbumToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const deleteAlbumFromFavoritesResponse = await unauthorizedRequest
        .delete(favoritesRoutes.albums(albumId))
        .set(commonHeaders);

      expect(deleteAlbumFromFavoritesResponse.status).toBe(
        StatusCodes.NO_CONTENT,
      );

      const response = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);

      const albumSearchResult = response.body.albums.find(
        (album) => album.id === albumId,
      );

      expect(albumSearchResult).toBeUndefined();

      const cleanupResponse = await unauthorizedRequest
        .delete(albumsRoutes.delete(albumId))
        .set(commonHeaders);

      expect(cleanupResponse.status).toBe(StatusCodes.NO_CONTENT);
    });

    it('should correctly delete artist from favorites', async () => {
      const createArtistResponse = await unauthorizedRequest
        .post(artistsRoutes.create)
        .set(commonHeaders)
        .send(createArtistDto);

      expect(createArtistResponse.status).toBe(StatusCodes.CREATED);
      const {
        body: { id: artistId },
      } = createArtistResponse;

      const addArtistToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.artists(artistId))
        .set(commonHeaders);

      expect(addArtistToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const deleteArtistFromFavoritesResponse = await unauthorizedRequest
        .delete(favoritesRoutes.artists(artistId))
        .set(commonHeaders);

      expect(deleteArtistFromFavoritesResponse.status).toBe(
        StatusCodes.NO_CONTENT,
      );

      const response = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);

      const artistSearchResult = response.body.artists.find(
        (artist) => artist.id === artistId,
      );

      expect(artistSearchResult).toBeUndefined();

      const cleanupResponse = await unauthorizedRequest
        .delete(artistsRoutes.delete(artistId))
        .set(commonHeaders);

      expect(cleanupResponse.status).toBe(StatusCodes.NO_CONTENT);
    });

    it('should correctly delete track from favorites', async () => {
      const createTrackResponse = await unauthorizedRequest
        .post(tracksRoutes.create)
        .set(commonHeaders)
        .send(createTrackDto);

      expect(createTrackResponse.status).toBe(StatusCodes.CREATED);
      const {
        body: { id: trackId },
      } = createTrackResponse;

      const addTrackToFavoritesResponse = await unauthorizedRequest
        .post(favoritesRoutes.tracks(trackId))
        .set(commonHeaders);

      expect(addTrackToFavoritesResponse.status).toBe(StatusCodes.CREATED);

      const deleteTrackFromFavoritesResponse = await unauthorizedRequest
        .delete(favoritesRoutes.tracks(trackId))
        .set(commonHeaders);

      expect(deleteTrackFromFavoritesResponse.status).toBe(
        StatusCodes.NO_CONTENT,
      );

      const response = await unauthorizedRequest
        .get(favoritesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);

      const trackSearchResult = response.body.tracks.find(
        (track) => track.id === trackId,
      );

      expect(trackSearchResult).toBeUndefined();

      const cleanupResponse = await unauthorizedRequest
        .delete(tracksRoutes.delete(trackId))
        .set(commonHeaders);

      expect(cleanupResponse.status).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .delete(albumsRoutes.delete('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if entity doesn't exist", async () => {
      const albumsDeletionFromFavoritesResponse = await unauthorizedRequest
        .delete(albumsRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(albumsDeletionFromFavoritesResponse.status).toBe(
        StatusCodes.NOT_FOUND,
      );

      const artistsDeletionFromFavoritesResponse = await unauthorizedRequest
        .delete(artistsRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(artistsDeletionFromFavoritesResponse.status).toBe(
        StatusCodes.NOT_FOUND,
      );

      const tracksDeletionFromFavoritesResponse = await unauthorizedRequest
        .delete(tracksRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(tracksDeletionFromFavoritesResponse.status).toBe(
        StatusCodes.NOT_FOUND,
      );
    });
  });
});
