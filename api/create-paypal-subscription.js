const paypalPlans = {
  "plan-6": process.env.PAYPAL_PLAN_6_MONTHS,
  "plan-12": process.env.PAYPAL_PLAN_12_MONTHS,
  "plan-24": process.env.PAYPAL_PLAN_24_MONTHS
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return response.status(500).json({ error: "PayPal Zugangsdaten fehlen." });
  }

  const { planId } = request.body || {};
  const paypalPlanId = paypalPlans[planId];

  if (!paypalPlanId) {
    return response.status(400).json({ error: "Unbekannte Laufzeit oder fehlende PayPal Plan ID." });
  }

  const accessToken = await getPayPalAccessToken();
  const baseUrl = getBaseUrl(request);
  const paypalResponse = await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      plan_id: paypalPlanId,
      application_context: {
        brand_name: "Cobe Webdesign",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${baseUrl}/?paypal=success`,
        cancel_url: `${baseUrl}/?paypal=cancelled`
      }
    })
  });

  const subscription = await paypalResponse.json();

  if (!paypalResponse.ok) {
    return response.status(400).json({ error: subscription.message || "PayPal Subscription konnte nicht erstellt werden." });
  }

  const approve = subscription.links?.find((link) => link.rel === "approve");
  return response.status(200).json({ url: approve?.href, subscription });
}

async function getPayPalAccessToken() {
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const result = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const data = await result.json();
  if (!result.ok) throw new Error("PayPal Access Token konnte nicht erstellt werden.");
  return data.access_token;
}

function getPayPalApiBase() {
  return process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function getBaseUrl(request) {
  const protocol = request.headers["x-forwarded-proto"] || "https";
  const host = request.headers.host;
  return `${protocol}://${host}`;
}
