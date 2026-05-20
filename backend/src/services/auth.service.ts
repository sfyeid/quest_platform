import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { signToken } from '../config/jwt';
import { UserRole } from '@prisma/client';

export const authService = {
  async register(email: string, password: string, name: string, role: UserRole = 'PLAYER') {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Conflict');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ email, passwordHash, name, role });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },
};
