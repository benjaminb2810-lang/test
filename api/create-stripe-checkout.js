const planPrices = {
  "plan-6": process.env.STRIPE_PRICE_6_MONTHS,
  "plan-12": process.env.STRIPE_PRICE_12_MONTHS,
  "plan-24": process.env.STRIPE_PRICE_24_MONTHS
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return response.status(500).json({ error: "STRIPE_SECRET_KEY fehlt." });
  }

  const { planId, email } = request.body || {};
  const priceId = planPrices[planId];

  if (!priceId) {
    return response.status(400).json({ error: "Unbekannte Laufzeit oder fehlende Stripe Price ID." });
  }

  const params = new URLSearchParams({
    mode: "subscription",
    success_url: `${getBaseUrl(request)}/?payment=success`,
    cancel_url: `${getBaseUrl(request)}/?payment=cancelled`,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "metadata[tax_notice]": "Kleinunternehmerregelung gemaess § 19 UStG"
  });

  if (email) params.set("customer_email", email);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const session = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return response.status(400).json({ error: session.error?.message || "Stripe Checkout konnte nicht erstellt werden." });
  }

  return response.status(200).json({ url: session.url });
}

function getBaseUrl(request) {
  const protocol = request.headers["x-forwarded-proto"] || "https";
  const host = request.headers.host;
  return `${protocol}://${host}`;
}
