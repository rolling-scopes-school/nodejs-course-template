const { request: unauthorizedRequest, routes } = require('../lib');
const debug = require('debug')('rs:test:books');
const {
  createAuthorizedRequest,
  shouldAuthorizationBeTested
} = require('../utils');

const TEST_BOOK_DATA = {
  name: "Shantaram",
  author: "Gregory David Roberts",
  genre: "Adventure",
  year: 2003
};

describe('Books suite', () => {
  let request = unauthorizedRequest;
  let testBookId;

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      request = await createAuthorizedRequest(unauthorizedRequest);
    }
    await request
      .post(routes.books.create)
      .set('Accept', 'application/json')
      .send(TEST_BOOK_DATA)
      .then(res => (testBookId = res.body.id));
  });

  afterAll(async () => {
    await request
      .delete(routes.books.delete(testBookId))
      .then(res => expect([200, 204].includes(res.status)).toBe(true));
  });

  describe('GET', () => {
    it('should get all books', async () => {
      await request
        .get(routes.books.getAll)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          debug(res.body);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).not.toHaveLength(0);
        });
    });

    it('should get a book by id', async () => {
      // Setup
      let expectedBook;

      await request
        .get(routes.books.getAll)
        .expect(200)
        .then(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).not.toHaveLength(0);
          expect(res.body.find(e => e.id === testBookId)).not.toBe(
            undefined
          );
          expectedBook = res.body.find(e => e.id === testBookId);
        });

      // Test
      await request
        .get(routes.books.getById(testBookId))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(res.body).toEqual(expectedBook);
        });
    });
  });

  describe('POST', () => {
    it('should create book successfully', async () => {
      let bookId;

      await request
        .post(routes.books.create)
        .set('Accept', 'application/json')
        .send(TEST_BOOK_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => {
          bookId = res.body.id;
          expect(typeof res.body.id).toBe('string');
          expect(res.body).toMatchObject(TEST_BOOK_DATA);
        });

      // Teardown
      await request.delete(routes.books.delete(bookId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });


  describe('PUT', () => {
    it('should update book successfully', async () => {
      // Setup
      let bookToUpdate;

      await request
        .post(routes.books.create)
        .set('Accept', 'application/json')
        .send(TEST_BOOK_DATA)
        .then(res => {
          bookToUpdate = res.body;
        });

      const updatedBook = {
        ...bookToUpdate,
        name: "The Mountain Shadow. Shantaram #2",
        year: 2015
      };

      // Test
      await request
        .put(routes.books.update(bookToUpdate.id))
        .set('Accept', 'application/json')
        .send(updatedBook)
        .expect(200)
        .expect('Content-Type', /json/);

      await request
        .get(routes.books.getById(updatedBook.id))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toMatchObject(updatedBook));

      // Teardown
      await request.delete(routes.books.delete(updatedBook.id))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });

  describe('DELETE', () => {
    it('should delete book successfully', async () => {
      // Setup:
      let bookId;

      await request
        .post(routes.books.create)
        .set('Accept', 'application/json')
        .send(TEST_BOOK_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (bookId = res.body.id));

      // Test
      await request
        .delete(routes.books.delete(bookId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));

      await request.get(routes.books.getById(bookId)).expect(404);
    });
  });

  describe('ADD/DEL FROM FAVS', () => {
    it('should add book to the favorites successfully', async () => {
      // Setup:
      let bookId;

      await request
        .post(routes.books.create)
        .set('Accept', 'application/json')
        .send(TEST_BOOK_DATA)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => (bookId = res.body.id));

      // Test
      await request
        .post(routes.books.addToFavs(bookId))
        .then(res => expect(res.status).toBe(200));

      await request
        .post(routes.books.deleteFromFavs(bookId))
        .then(res => expect(res.status).toBe(200));

      // Teardown
      await request.delete(routes.books.delete(bookId))
        .then(res => expect([200, 204].includes(res.status)).toBe(true));
    });
  });

})


