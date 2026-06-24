import { Router } from 'express';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/sync', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          credits: email === 'testuser@example.com' ? 1000 : 30, // Test user gets 1000, others 30
        },
      });
    } else if (email === 'testuser@example.com') {
      // Ensure test user always has 1000 credits for testing
      user = await prisma.user.update({
        where: { email },
        data: { credits: 1000 }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("AUTH_SYNC_ERROR:", err);
    res.status(500).json({ error: 'Server error', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
