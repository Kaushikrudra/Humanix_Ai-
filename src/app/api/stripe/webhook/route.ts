export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10' as any,
});

const PLANS = {
  starter: { price: 800, credits: 500, name: 'starter' },
  pro: { price: 1600, credits: 1500, name: 'pro' },
};

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );

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

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
