# Titan Email Sender (Vercel)

This is a temporary, publicly reachable test utility at `/titan-sender`. The page is public, but all API actions require the shared `EMAIL_SENDER_ACCESS_KEY`. Move behind proper authentication before using it for private or ongoing work.

## Architecture

- Next.js App Router API routes use Nodemailer and Titan SMTP.
- Attachments are uploaded directly from the browser to a **private Supabase Storage bucket** using a short-lived signed upload URL. This avoids Vercel's request-body limit and supports files up to 15 MiB.
- The app sends each message in its own request, sequentially, with a minimum 2-second delay and a maximum of 10 messages per run.
- The temporary attachment is deleted after the run. If cleanup fails, delete the object manually in Supabase Storage.
- The browser never receives the Titan SMTP password or Supabase service-role key.

## Required Vercel environment variables

Set these for the correct project and redeploy:

- `EMAIL_SENDER_ACCESS_KEY`: a long random secret used to authorize the sender page's API calls.
- `TITAN_EMAIL_USER`: full Titan mailbox address.
- `TITAN_EMAIL_PASSWORD`: Titan mailbox password or app password, as appropriate for the account.
- `TITAN_SMTP_HOST`: optional; defaults to `smtp.titan.email`.
- `TITAN_SMTP_PORT`: optional; defaults to `465` (SSL/TLS). Port `587` uses STARTTLS.
- `TITAN_EMAIL_FROM`: optional; defaults to the Titan mailbox address.
- `SUPABASE_URL` (or existing `NEXT_PUBLIC_SUPABASE_URL`): Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key. **Server only; never prefix it with `NEXT_PUBLIC_`.**
- `EMAIL_ATTACHMENT_BUCKET`: optional; defaults to `titan-email-temp`.

## Supabase Storage setup

1. In Supabase, create a **private** Storage bucket named `titan-email-temp` (or choose a different name and set `EMAIL_ATTACHMENT_BUCKET`).
2. Do not make the bucket public and do not add anonymous read policies. The server uses the service-role key to create signed uploads, read attachments and remove them.
3. Use the service-role key only as a Vercel server environment variable. Do not put it in client code, Git, or a `NEXT_PUBLIC_*` variable.
4. Apply storage lifecycle cleanup if available for your plan; the app also attempts to delete the uploaded file after a run.

## Deployment

1. Review the feature branch and merge it into `main` when ready.
2. In Vercel, open the project connected to `DevEssaAhmed/EssaAhmed.dev`.
3. Add the environment variables above under **Settings → Environment Variables** for Preview and/or Production.
4. Ensure Vercel is linked to the correct Supabase project and the private bucket exists.
5. Redeploy after setting the variables.
6. Open `https://essaahmed.dev/titan-sender` (or your current production domain), enter the `EMAIL_SENDER_ACCESS_KEY`, and send a one-message test to an address you control before using a larger count.

## Limits and safety

- Attachment limit: 15 MiB (15 × 1024 × 1024 bytes).
- Repeat count: 1–10 messages per run; at least 2 seconds between attempts.
- The sender is not authenticated with a user account yet. The shared access key is a temporary gate, not a substitute for login or rate limiting. Keep the key private and rotate it if it leaks.
- The page is not linked from the public navigation, but its URL is not secret. Anyone who obtains the URL can see the page; only a holder of the access key can call its APIs.
- An SMTP accepted response means the SMTP server accepted the message, not that it was delivered to the inbox.
- The UI uses one recipient per run. Do not use this for unsolicited bulk mail.
