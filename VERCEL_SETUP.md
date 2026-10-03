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

## Enable the Google provider in Supabase

Vercel environment variables alone do not enable Google OAuth. In **Supabase
Dashboard > Authentication > Providers > Google**, switch the provider on,
paste the Google OAuth **Client ID** and **Client Secret**, then save. The
provider must be enabled before the app can redirect a customer to Google.

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
MAILGUN_REGION          # Set EU when the Mailgun domain lives in the EU region
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SUPABASE_SERVICE_ROLE_KEY # Server-only; never expose this to the browser
```

Do not commit `.env`. The app serves images from tracked `/public/images` files,
and browser URLs must remain `/images/<filename>` — never `/public/images/...`.

## Verify after deployment

Open these URLs after Vercel finishes building:

```text
https://hng-task-02-gu28.vercel.app/api/health
https://hng-task-02-gu28.vercel.app/api/products
https://hng-task-02-gu28.vercel.app/images/jollof-rice-plantain.jpg
```

The first two must return JSON and the last one must return an image. The health
response should report `supabaseConfigured: true`, `mailgunConfigured: true`,
`databaseConfigured: true`, `sessionConfigured: true` and `persistence: "postgres"`
or `"supabase"`. If it reports `persistence: "local"` on Vercel, the database is
not reachable and user data/orders are not durable. If the health URL is `404`,
the new API deployment is not serving the domain yet.
