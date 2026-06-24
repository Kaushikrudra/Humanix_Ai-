import { Router, Response, Request } from 'express';
import Stripe from 'stripe';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10' as any,
});

const router = Router();

const PLANS = {
  starter: { price: 800, credits: 500, name: 'starter' },
  pro: { price: 1600, credits: 1500, name: 'pro' },
};

router.post('/create-checkout-session', authenticate, async (req: AuthRequest, res: Response) => {
  const { plan } = req.body;
  const userId = req.user?.id;

  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const selectedPlan = PLANS[plan as keyof typeof PLANS];
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `HumanixAI ${selectedPlan.name.toUpperCase()} Plan`,
            },
            unit_amount: selectedPlan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
      client_reference_id: userId,
      metadata: {
        plan: selectedPlan.name,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder');
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const planName = session.metadata?.plan as keyof typeof PLANS;

    if (userId && planName) {
      const addedCredits = PLANS[planName].credits;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            plan: planName,
            credits: { increment: addedCredits },
          },
        }),
        prisma.creditTransaction.create({
          data: {
            userId,
            amount: addedCredits,
            type: 'subscription',
            notes: `Upgraded to ${planName} plan`,
          },
        }),
      ]);
    }
  }

  res.json({ received: true });
});

export default router;
