# Cobe Webdesign Shop: Schritt-fuer-Schritt Setup

## 1. Background und Positionierung

- Shop-Name: Cobe Webdesign
- Zielgruppe: kleine Unternehmen, Selbststaendige und lokale Dienstleister
- Angebot: kostenlose Erst-Demo, danach Website-Erstellung je nach Aufwand zwischen 400 und 800 Euro
- Markenstil: modern, dunkel, technisch, mit farbigen Akzenten aus dem Logo
- Steuerhinweis: Gemäß § 19 UStG wird keine Umsatzsteuer berechnet oder ausgewiesen.

## 2. Angebot und Vertragslogik

- Einmalige Erstellung: 400 bis 800 Euro nach Aufwand
- Demo: kostenlos anfragbar
- Laufzeiten:
  - 6 Monate: 60 Euro pro Monat
  - 12 Monate: 50 Euro pro Monat
  - 24 Monate: 40 Euro pro Monat
- Verlaengerung: Nach Ablauf der Mindestlaufzeit verlaengert sich der Vertrag um die gleiche Laufzeit, sofern nicht spaetestens 1 Monat vor Laufzeitende gekuendigt wird.

## 3. Kundendaten fuer Demo-Anfrage

Das Formular fragt aktuell ab:

- Vor- und Nachname
- Firmenname
- E-Mail-Adresse
- Telefonnummer
- Branche
- Bestehende Website
- Gewuenschte Seiten
- Gewuenschte Laufzeit
- Projektbeschreibung
- Zustimmung zum Kleinunternehmer-Hinweis

## 4. Backend, E-Mail und Adminbereich

Angelegt sind erste Vercel API-Endpunkte:

- `api/demo-request.js`: nimmt Demo-Anfragen an und kann eine E-Mail-Bestaetigung senden
- `api/create-stripe-checkout.js`: erstellt spaeter Stripe Checkout Sessions fuer Abos
- `api/create-paypal-subscription.js`: erstellt spaeter PayPal Subscriptions

Fuer echten Betrieb brauchst du zusaetzlich:

- Datenbank, z. B. Supabase, Neon, Vercel Postgres oder PlanetScale
- Authentifizierung, z. B. Clerk, Auth.js, Supabase Auth oder Lucia
- Adminrollen fuer dich und Kundenrollen fuer Auftraggeber
- E-Mail-Service, z. B. Resend, Brevo, Mailgun oder SMTP

## 5. Umgebungsvariablen auf Vercel

Diese Werte duerfen nie direkt in HTML oder GitHub stehen:

- `RESEND_API_KEY`
- `MAIL_FROM`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_6_MONTHS`
- `STRIPE_PRICE_12_MONTHS`
- `STRIPE_PRICE_24_MONTHS`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_PLAN_6_MONTHS`
- `PAYPAL_PLAN_12_MONTHS`
- `PAYPAL_PLAN_24_MONTHS`
- `PAYPAL_ENV`, entweder `sandbox` oder `live`

## 6. Naechster sinnvoller Schritt

Als naechstes sollte aus dem lokalen Dashboard ein echtes Dashboard werden:

- Datenbanktabelle `demo_requests`
- Datenbanktabelle `users`
- Login mit sicheren Sessions
- Adminansicht fuer eingegangene Anfragen
- Kundenansicht fuer Projektstatus, Vertrag und Zahlungslink
