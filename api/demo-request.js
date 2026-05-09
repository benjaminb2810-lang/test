const requiredFields = ["name", "email", "message", "planName"];

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const body = request.body || {};
  const missing = requiredFields.filter((field) => !body[field]);

  if (missing.length) {
    return response.status(400).json({
      error: "Bitte alle Pflichtfelder ausfuellen.",
      missing
    });
  }

  const savedRequest = {
    id: `demo_${Date.now()}`,
    ...body,
    status: "Eingegangen",
    createdAt: new Date().toISOString(),
    taxNotice: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet oder ausgewiesen."
  };

  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    await sendConfirmationMail(savedRequest);
  }

  return response.status(200).json({
    ok: true,
    request: savedRequest,
    message: "Demo-Anfrage eingegangen."
  });
}

async function sendConfirmationMail(demoRequest) {
  const html = `
    <h1>Deine Demo-Anfrage ist eingegangen</h1>
    <p>Hallo ${escapeHtml(demoRequest.name)},</p>
    <p>vielen Dank fuer deine Anfrage bei Cobe Webdesign. Ich pruefe deine Angaben und melde mich mit den naechsten Schritten.</p>
    <p><strong>Gewaehlte Laufzeit:</strong> ${escapeHtml(demoRequest.planName)}</p>
    <p><strong>Hinweis:</strong> Gemäß § 19 UStG wird keine Umsatzsteuer berechnet oder ausgewiesen.</p>
  `;

  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: demoRequest.email,
      subject: "Deine Demo-Anfrage bei Cobe Webdesign",
      html
    })
  });

  if (!result.ok) {
    throw new Error("E-Mail konnte nicht versendet werden.");
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
