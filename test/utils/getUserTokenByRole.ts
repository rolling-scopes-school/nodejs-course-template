import { authRoutes, usersRoutes } from '../endpoints';

const getUserTokenByRole = async (
  request,
  role: 'admin' | 'editor' | 'viewer',
  adminHeaders: Record<string, string>,
) => {
  const login = `TEST_RBAC_${role.toUpperCase()}_${Date.now()}`;
  const password = 'TestPass123!';

  // Create user via signup
  const signupResponse = await request
    .post(authRoutes.signup)
    .set({ Accept: 'application/json' })
    .send({ login, password });

  const { id: userId } = signupResponse.body;

  if (!userId) {
    throw new Error(`Failed to create ${role} user`);
  }

  // If role is not 'viewer' (default), update user role via admin
  if (role !== 'viewer') {
    const updateRoleResponse = await request
      .put(usersRoutes.update(userId))
      .set(adminHeaders)
      .send({ role });

    if (updateRoleResponse.statusCode >= 400) {
      throw new Error(`Failed to set role ${role} for user ${userId}`);
    }
  }

  // Login to get tokens
  const loginResponse = await request
    .post(authRoutes.login)
    .set({ Accept: 'application/json' })
    .send({ login, password });

  const { accessToken } = loginResponse.body;

  if (!accessToken) {
    throw new Error(`Failed to login as ${role} user`);
  }

  return {
    token: `Bearer ${accessToken}`,
    userId,
    login,
    role,
  };
};

export default getUserTokenByRole;
