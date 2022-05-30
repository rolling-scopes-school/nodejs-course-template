const { request: unauthorizedRequest, routes } = require('../lib');
const debug = require('debug')('rs:test:movies');
const {
  createAuthorizedRequest,
  shouldAuthorizationBeTested
} = require('../utils');

const TEST_MOVIE_DATA = {
  name: "The Matrix Revolutions",
  genre: "Fantasy",
  duration: 7740,
  year: 2003
};

describe('Movies suite', () => {
  let request = unauthorizedRequest;
  let testMovieId;

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      request = await createAuthorizedRequest(unauthorizedRequest);
    }
    await request
      .post(routes.movies.create)
      .set('Accept', 'application/json')
      .send(TEST_MOVIE_DATA)
      .then(res => (testMovieId = res.body.id));
  });

  afterAll(async () => {
    await request
      .delete(routes.movies.delete(testMovieId))
      .then(res => expect([200, 204].includes(res.status)).toBe(true));
  });

  describe('GET', () => {
    it('should get all movies', async () => {
      await request
        .get(routes.movies.getAll)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          debug(res.body);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).not.toHaveLength(0);
        });
    });

    it('should get a movie by id', async () => {
      // Setup
      let expectedMovie;

      await request
        .get(routes.movies.getAll)
        .expect(200)
        .then(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).not.toHaveLength(0);
          expect(res.body.find(e => e.id === testMovieId)).not.toBe(
            undefined
          );
          expectedMovie = res.body.find(e => e.id === testMovieId);
        });

      // Test
      await request
        .get(routes.movies.getById(testMovieId))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(res.body).toEqual(expectedMovie);
        });
    });
  });

  describe('POST', () => {
    it('should create movie successfully', async () => {
      let movieId;

      await request
        .post(routes.movies.create)
        .set('Accept', 'application/json')
        .send(TEST_MOVIE_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => {
          movieId = res.body.id;
          expect(typeof res.body.id).toBe('string');
          expect(res.body).toMatchObject(TEST_MOVIE_DATA);
        });

      // Teardown
      await request.delete(routes.movies.delete(movieId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });


  describe('PUT', () => {
    it('should update movie successfully', async () => {
      // Setup
      let movieToUpdate;

      await request
        .post(routes.movies.create)
        .set('Accept', 'application/json')
        .send(TEST_MOVIE_DATA)
        .then(res => {
          movieToUpdate = res.body;
        });

      const updatedMovie = {
        ...movieToUpdate,
        name: "The Matrix Resurrections",
        duration: 8880,
        year: 2021
      };

      // Test
      await request
        .put(routes.movies.update(movieToUpdate.id))
        .set('Accept', 'application/json')
        .send(updatedMovie)
        .expect(200)
        .expect('Content-Type', /json/);

      await request
        .get(routes.movies.getById(updatedMovie.id))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toMatchObject(updatedMovie));

      // Teardown
      await request.delete(routes.movies.delete(updatedMovie.id))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });

  describe('DELETE', () => {
    it('should delete movie successfully', async () => {
      // Setup:
      let movieId;

      await request
        .post(routes.movies.create)
        .set('Accept', 'application/json')
        .send(TEST_MOVIE_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (movieId = res.body.id));

      // Test
      await request
        .delete(routes.movies.delete(movieId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));

      await request.get(routes.movies.getById(movieId)).expect(404);
    });
  });

  describe('ADD/DEL FROM FAVS', () => {
    it('should add movie to the favorites successfully', async () => {
      // Setup:
      let movieId;

      await request
        .post(routes.movies.create)
        .set('Accept', 'application/json')
        .send(TEST_MOVIE_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (movieId = res.body.id));

      // Test
      await request
        .post(routes.movies.addToFavs(movieId))
        .then(res => expect(res.status).toBe(200));

      await request
        .post(routes.movies.deleteFromFavs(movieId))
        .then(res => expect(res.status).toBe(200));

      // Teardown
      await request.delete(routes.movies.delete(movieId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });

})


