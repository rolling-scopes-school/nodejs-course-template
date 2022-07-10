import { usersRoutes } from '../endpoints';

const removeTokenUser = async (request, userId, commonHeaders) => {
  // delete user
  await request.delete(usersRoutes.delete(userId)).set(commonHeaders);
};

export default removeTokenUser;
