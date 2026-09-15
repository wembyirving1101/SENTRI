# SENTRI

Two separate applications:

```text
sentri/
├── deployment/       # Company registration and future admin panel
└── dispatch/         # Employee training application
    ├── package.json
    ├── src/
    │   ├── app/
    │   ├── components/
    │   └── lib/
    ├── public/
    ├── database/
    ├── scripts/
    └── tests/
```

Run the training application from `dispatch/`:

```sh
cd dispatch
npm run dev
```

Run `npm test` or `npm run build` from that same directory. Environment
configuration belongs in `dispatch/.env.local`. Hosting the training app should
use `dispatch` as its project root.

Run the separate deployment UI with `cd deployment` and `npm run dev`.
It uses port 3002. Registration follows Company → Admin Account → Ready.
Registration and admin login support temporary demo accounts or the existing
SENTRI database, controlled by `DEPLOYMENT_AUTH_MODE` in `deployment/.env.local`.
After login, the existing login page shows the signed-in admin; employee
management and CSV/manual entry remain future work.
See [deployment/AUTH_DATABASE_GUIDE.md](./deployment/AUTH_DATABASE_GUIDE.md) for
setup, mode switching, implementation details, and tests.

## Dispatch sign-in (temporary)

Open `/login` and use work email `admin` with password `123`. This is a
single demo account connected to the existing configured demo learner, not
company employee authentication. Signed-in browsers are remembered for 30 days.
Settings includes a Log out button that clears this browser's session.

`dispatch/.env.local` must contain `DISPATCH_SESSION_SECRET`, a random secret
used to sign the HttpOnly session cookie. It is configured locally and must also
be set in any hosting environment. Keep the same secret across instances and
restarts; changing it signs out existing sessions. Never commit this secret.

Before a company rollout, replace the temporary credentials with employee
authentication, tenant authorization, and password recovery.
