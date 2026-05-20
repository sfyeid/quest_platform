import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { userRepository } from '../repositories/user.repository';

export const userRouter = Router();
userRouter.use(authenticate);

userRouter.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) { next(err); }
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

userRouter.patch('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateSchema.parse(req.body);
    const user = await userRepository.update(req.user!.userId, data);
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) { next(err); }
});
