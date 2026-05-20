import { prisma } from '../config/prisma';
import { UserRole } from '@prisma/client';

export interface CreateUserDto {
  email: string;
  passwordHash: string;
  name: string;
  role?: UserRole;
}

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  },

  async create(data: CreateUserDto) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: Partial<{ name: string; email: string }>) {
    return prisma.user.update({ where: { id }, data });
  },
};
