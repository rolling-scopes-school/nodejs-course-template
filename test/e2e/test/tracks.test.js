const { request: unauthorizedRequest, routes } = require('../lib');
const debug = require('debug')('rs:test:tracks');
const {
  createAuthorizedRequest,
  shouldAuthorizationBeTested
} = require('../utils');

const TEST_ALBUM_DATA = {
  name: "Harry's House",
  singer: "Harry Styles",
  year: 2022,
};

const TEST_TRACK_DATA = {
  name: "As It Was",
  singer: "Harry Styles",
  duration: 165,
};


describe('Tracks suite', () => {
  let request = unauthorizedRequest;
  let testTrackId;

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      request = await createAuthorizedRequest(unauthorizedRequest);
    }
    await request
      .post(routes.tracks.create)
      .set('Accept', 'application/json')
      .send(TEST_TRACK_DATA)
      .then(res => (testTrackId = res.body.id));
  });

  afterAll(async () => {
    await request
      .delete(routes.tracks.delete(testTrackId))
      .then(res => expect([200, 204].includes(res.status)).toBe(true));
  });

  describe('GET', () => {
    it('should get all tracks', async () => {
      await request
        .get(routes.tracks.getAll)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          debug(res.body);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).not.toHaveLength(0);
        });
    });

    it('should get a track by id', async () => {
      // Setup
      let expectedTrack;

      await request
        .get(routes.tracks.getAll)
        .expect(200)
        .then(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).not.toHaveLength(0);
          expect(res.body.find(e => e.id === testTrackId)).not.toBe(
            undefined
          );
          expectedTrack = res.body.find(e => e.id === testTrackId);
        });

      // Test
      await request
        .get(routes.tracks.getById(testTrackId))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(res.body).toEqual(expectedTrack);
        });
    });
  });

  describe('POST', () => {
    it('should create track successfully', async () => {
      let trackId;

      await request
        .post(routes.tracks.create)
        .set('Accept', 'application/json')
        .send(TEST_TRACK_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => {
          trackId = res.body.id;
          expect(typeof res.body.id).toBe('string');
          expect(res.body).toMatchObject(TEST_TRACK_DATA);
        });

      // Teardown
      await request.delete(routes.tracks.delete(trackId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });


  describe('PUT', () => {
    it('should update track successfully', async () => {
      // Setup
      let trackToUpdate;

      await request
        .post(routes.tracks.create)
        .set('Accept', 'application/json')
        .send(TEST_TRACK_DATA)
        .then(res => {
          trackToUpdate = res.body;
        });

      const updatedTrack = {
        ...trackToUpdate,
        name: "Little Freak",
      };

      // Test
      await request
        .put(routes.tracks.update(trackToUpdate.id))
        .set('Accept', 'application/json')
        .send(updatedTrack)
        .expect(200)
        .expect('Content-Type', /json/);

      await request
        .get(routes.tracks.getById(updatedTrack.id))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toMatchObject(updatedTrack));

      // Teardown
      await request.delete(routes.tracks.delete(updatedTrack.id))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });

  describe('DELETE', () => {
    it('should delete track successfully', async () => {
      // Setup:
      let trackId;

      await request
        .post(routes.tracks.create)
        .set('Accept', 'application/json')
        .send(TEST_TRACK_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (trackId = res.body.id));

      // Test
      await request
        .delete(routes.tracks.delete(trackId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));

      await request.get(routes.tracks.getById(trackId)).expect(404);
    });
  });

  describe('ADD/DEL FROM FAVS', () => {
    it('should add track to the favorites successfully', async () => {
      // Setup:
      let trackId;

      await request
        .post(routes.tracks.create)
        .set('Accept', 'application/json')
        .send(TEST_TRACK_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (trackId = res.body.id));

      // Test
      await request
        .post(routes.tracks.addToFavs(trackId))
        .then(res => expect(res.status).toBe(200));

      await request
        .delete(routes.tracks.deleteFromFavs(trackId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));

      // Teardown
      await request.delete(routes.tracks.delete(trackId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });

  describe('ADD FROM ALBUMS', () => {
    it('should add track to the albums successfully', async () => {
      // Setup:
      let trackId, albumId;

      await request
        .post(routes.albums.create)
        .set('Accept', 'application/json')
        .send(TEST_ALBUM_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (albumId = res.body.id));

      await request
        .post(routes.tracks.create)
        .set('Accept', 'application/json')
        .send(TEST_TRACK_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (trackId = res.body.id));

      // Test
      await request
        .post(routes.tracks.addToAlbum(albumId, trackId))
        .then(res => expect(res.status).toBe(200));

      // Teardown
      await request.delete(routes.albums.delete(albumId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));

      await request.delete(routes.tracks.delete(trackId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });

  describe('DEL FROM ALBUMS', () => {
    it('should delete track from the albums successfully', async () => {
      // Setup:
      let trackId, albumId;

      await request
        .post(routes.albums.create)
        .set('Accept', 'application/json')
        .send(TEST_ALBUM_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (albumId = res.body.id));

      await request
        .post(routes.tracks.create)
        .set('Accept', 'application/json')
        .send(TEST_TRACK_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (trackId = res.body.id));

      await request
        .post(routes.tracks.addToAlbum(albumId, trackId))
        .then(res => expect(res.status).toBe(200));

      // Test
      await request
        .delete(routes.tracks.deleteFromAlbum(albumId, trackId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));

      // Teardown
      await request.delete(routes.albums.delete(albumId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));

      await request.delete(routes.tracks.delete(trackId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));

    });
  });

})


