module.exports = {
  login: '/login',
  users: {
    getAll: '/users',
    getById: id => `/users/${id}`,
    create: '/users',
    update: id => `/users/${id}`,
    delete: id => `/users/${id}`
  },
  tracks: {
    getAll: '/tracks',
    getById: id => `/tracks/${id}`,
    create: '/tracks',
    update: id => `/tracks/${id}`,
    delete: id => `/tracks/${id}`,
    addToFavs: id => `/tracks/${id}/favs`,
    deleteFromFavs: id => `/tracks/${id}/favs`,
    addToAlbum: (albumId, trackId) => `/albums/${albumId}/track/${trackId}`,
    deleteFromAlbum: (albumId, trackId) => `/albums/${albumId}/track/${trackId}`,
  },
  favourites: {
    getAll: '/favs',
  },
  albums: {
    getAll: '/albums',
    getById: id => `/albums/${id}`,
    create: '/albums',
    update: id => `/albums/${id}`,
    delete: id => `/albums/${id}`,
  },
  movies: {
    getAll: '/movie',
    getById: id => `/movie/${id}`,
    create: '/movie',
    update: id => `/movie/${id}`,
    delete: id => `/movie/${id}`,
    addToFavs: id => `/movie/${id}/favs`,
    deleteFromFavs: id => `/movie/${id}/favs`,
  },
  books: {
    getAll: '/book',
    getById: id => `/book/${id}`,
    create: '/book',
    update: id => `/book/${id}`,
    delete: id => `/book/${id}`,
    addToFavs: id => `/book/${id}/favs`,
    deleteFromFavs: id => `/book/${id}/favs`,
  },
};