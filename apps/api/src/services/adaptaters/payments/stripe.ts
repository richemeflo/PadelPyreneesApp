import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function createCheckoutSession({ amount, currency="eur", successUrl, cancelUrl }) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price_data: { currency, product_data: { name: "Réservation court" }, unit_amount: amount }, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return session.url;
}
