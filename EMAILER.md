# Resend Emailer Setup

The contact form sends mail through [Resend](https://resend.com). The API key
stays on the server — the browser never sees it.

It is **local-first**: with no key configured, submissions are written to
`storage/outbox/` so you can test the whole form immediately. As soon as
`RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `CONTACT_TO_EMAIL` are filled in,
the same form sends real email through Resend automatically.

## Files

| File | Purpose |
| --- | --- |
| `.env` | **Private.** API key and email settings. Git-ignored and blocked by `.htaccess`. |
| `.env.example` | Safe template for a new machine or deploy. |
| `api/env.php` | Tiny `.env` loader (no Composer needed). |
| `api/resend.php` | cURL wrapper for Resend's `/emails` endpoint. |
| `api/mailer.php` | Builds the message and picks Resend or the local outbox. |
| `api/send-email.php` | POST endpoint used by the contact form. |
| `scripts/test-email.php` | CLI script that sends a real test email through Resend. |
| `storage/outbox/` | Local dev copies of unsent messages. Git-ignored. |
| `.htaccess` | Blocks browser access to `.env`, `.git`, and directory listings. |

## 1. Local test without a key (works now)

Leave `RESEND_API_KEY` empty and submit the contact form. The endpoint returns:

```json
{ "ok": true, "mode": "log", "message": "Saved to the local outbox (dev mode) - no email was sent." }
```

Open the newest file in `storage/outbox/` to inspect the generated email.

## 2. Add your keys for real sending

Open `.env` and fill in:

```dotenv
APP_ENV=local
MAIL_DRIVER=auto

RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Janmatsu.tech <hello@yourdomain.com>
CONTACT_TO_EMAIL=Janmatsu81@gmail.com
SITE_NAME=Janmatsu.tech
```

- Create a key at <https://resend.com/api-keys>.
- `RESEND_FROM_EMAIL` must use a domain verified in Resend
  (<https://resend.com/domains>). Until then, `onboarding@resend.dev` works
  for testing, but it can only send to the email address on your Resend account.
- `CONTACT_TO_EMAIL` accepts a comma-separated list for multiple inboxes.

Never commit `.env`. `.gitignore` already excludes it.

### Driver modes

| `MAIL_DRIVER` | Behaviour |
| --- | --- |
| `auto` (default) | Use Resend when configured; otherwise write to the outbox in `local`, error in `production`. |
| `resend` | Always call Resend. Fails if the key is missing. |
| `log` | Always write to the outbox, never send. |

Set `APP_ENV=production` when deploying so a missing key is a hard error
instead of a silent local fallback.

## 3. Send a real test email

With XAMPP's PHP:

```powershell
C:\xampp\php\php.exe scripts\test-email.php
```

Or specify a recipient:

```powershell
C:\xampp\php\php.exe scripts\test-email.php you@example.com
```

Success prints `Sent test email to ...`. A rejected key prints the Resend
error (for example `401 API key is invalid`) and exits with code 1.

## 4. Run the site

Start **Apache** in the XAMPP control panel, then open:

```
http://localhost/matsu/persoportfolio/
```

The form posts JSON to `api/send-email.php`. A non-JavaScript POST also works
and returns JSON.

## Endpoint test

```powershell
curl.exe -X POST http://localhost/matsu/persoportfolio/api/send-email.php `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Hello from the terminal\",\"website\":\"\"}"
```

Expected with a key configured:

```json
{ "ok": true, "mode": "resend", "message": "Thanks! Your message has been sent." }
```

Errors return `{ "ok": false, "error": "..." }` with a 4xx/5xx status. Resend's
raw response goes to the PHP error log, never to the browser.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request:

- lints every PHP file in `api/` and `scripts/`
- fails if `.env` is ever committed
- checks that `.env.example` exists

## Security notes

- `.env` is blocked by `.htaccess` (`Require all denied`). Apache needs
  `AllowOverride All` for `htdocs` — XAMPP sets this by default.
- If you deploy to a host that ignores `.htaccess` (nginx, static hosts), keep
  `.env` **outside the web root** or add an equivalent rule.
- The form includes a hidden honeypot field plus server-side validation
  (name, email format, message length) to reduce spam.
- A static host such as GitHub Pages cannot run PHP; the emailer needs PHP
  hosting (XAMPP locally, or any PHP host in production).
