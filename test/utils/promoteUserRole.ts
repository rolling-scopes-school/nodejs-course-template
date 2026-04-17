import prisma from '../lib/prisma';

type Role = 'viewer' | 'editor' | 'admin';

const promoteUserRole = async (userId: string, role: Role): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
};

export default promoteUserRole;
