import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        credits: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const history = await prisma.contentHistory.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/history/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.contentHistory.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ error: 'History item not found' });
    }

    if (item.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.contentHistory.delete({
      where: { id },
    });

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
