# Titan Email Sender (Vercel)

The `/titan-sender` page sends low-volume messages through Titan SMTP. Every API action requires `EMAIL_SENDER_ACCESS_KEY`.

## Media source

Attachments are selected from `DevEssaAhmed/syedamahamfahim.tech`, folder `Maham Telecom/`. The server retrieves files from the private GitHub repository; media is not copied into this sender repo and no database or Supabase Storage is needed. Supported files up to 15 MiB appear in the selector. **The current selector lists media files in the archive; it does not yet establish which participant sent each individual file from message metadata.**

## Vercel environment variables

- `EMAIL_SENDER_ACCESS_KEY`: long random secret for the API.
- `TITAN_EMAIL_USER`: full Titan mailbox address.
- `TITAN_EMAIL_PASSWORD`: Titan mailbox password/app password.
- `TITAN_SMTP_HOST`: optional, defaults to `smtp.titan.email`.
- `TITAN_SMTP_PORT`: optional, defaults to `465` (SSL/TLS); `587` uses STARTTLS.
- `TITAN_EMAIL_FROM`: optional, defaults to the Titan mailbox address.
- `GITHUB_MEDIA_TOKEN`: GitHub fine-grained token with repository access limited to `syedamahamfahim.tech` and **Contents: Read-only**. Keep server-side only; never use a `NEXT_PUBLIC_` variable or commit it.

## Setup

1. Create a fine-grained GitHub token with read-only Contents permission for the private `syedamahamfahim.tech` repository.
2. Add `GITHUB_MEDIA_TOKEN` and Titan/access-key values to Vercel environment variables for the intended environment.
3. Redeploy, open `/titan-sender`, enter the access key, click **Load media archive**, select a file, and test one message to an address you control.
4. Protect the route with proper authentication before routine or sensitive use.

## Limits and safety

- Maximum attachment: 15 MiB.
- 1–10 sequential messages per run, with at least 2 seconds between sends.
- SMTP acceptance is not proof of inbox delivery. Use only for messages to recipients who have agreed to receive them; never use for unsolicited bulk mail.
