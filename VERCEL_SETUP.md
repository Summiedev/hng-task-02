# KOKO MARKET — Vercel and auth setup

The app uses the production origin below for Supabase OAuth:

```text
https://hng-task-02-gu28.vercel.app/
```

## Supabase Auth → URL Configuration

Set **Site URL** to:

```text
https://hng-task-02-gu28.vercel.app/
```

Add these **Redirect URLs**:

```text
https://hng-task-02-gu28.vercel.app/
http://localhost:3000/
https://*-YOUR-VERCEL-TEAM-SLUG.vercel.app/**
```

Replace `YOUR-VERCEL-TEAM-SLUG` with the Vercel team or account slug used by
preview deployments. The app intentionally redirects Google back to `/`; after
Supabase exchanges the session, the browser is moved to the Account screen.

## Google Cloud Console

Under the OAuth client used by Supabase, add these **Authorized JavaScript origins**:

```text
https://hng-task-02-gu28.vercel.app
http://localhost:3000
```

Under **Authorized redirect URIs**, add the Supabase callback (not the app URL):

```text
https://spavjzjbhepqgrdxcqqc.supabase.co/auth/v1/callback
```

The callback URL is also shown in Supabase Dashboard → Authentication →
Providers → Google.

## Vercel Environment Variables

Set these for **Production**, **Preview** and **Development** where applicable:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
DATABASE_URL
SESSION_SECRET
MAILGUN_API_KEY
MAILGUN_DOMAIN
MAILGUN_FROM
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

Do not commit `.env`. The app serves images from tracked `/public/images` files,
and browser URLs must remain `/images/<filename>` — never `/public/images/...`.
