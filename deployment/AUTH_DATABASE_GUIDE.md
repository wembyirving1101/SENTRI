# SENTRI registration and admin login

Implemented September 15, 2026.

## What now works

The deployment registration and login forms use server-side API routes. Choose
demo mode for temporary practice accounts or database mode to save to the existing
SENTRI PostgreSQL database.

Registration creates a company and its first administrator. Login verifies the
password and establishes a session. The login page then shows the administrator
and company, plus a sign-out button. It stays on `/login` because the employee
management page does not exist yet. CSV upload and manual employee entry are not
implemented in this change.

## Switch modes

Edit `deployment/.env.local` (not the repository-root `.env.local`). The existing
database URL was preserved. An explicit demo-mode setting and a separate random
`DEPLOYMENT_SESSION_SECRET` were added locally. This file is ignored by Git.

For demo mode:

```env
DEPLOYMENT_AUTH_MODE=demo
```

For database mode:

```env
DEPLOYMENT_AUTH_MODE=database
```

Stop the server with Ctrl+C, then restart from `deployment/`:

```sh
npm run dev
```

Open [registration](http://localhost:3002/register) or
[admin login](http://localhost:3002/login). Check the mode label above the form.
If the development server starts but requests stall, stop it and use the
production preview instead:

```sh
npm run build
npm start
```

That preview needs a rebuild after source changes. Both development compiler
previews stalled in this local verification environment; the production preview
served correctly and was used for the browser checks. This change does not
diagnose or resolve the development file-watching issue.

Mode is controlled by the server environment; it cannot be changed by a browser
request. An unset mode defaults to demo. An invalid mode returns an error.
Database failures never silently switch the application to demo.

### Demo behavior

- No database connection is opened by the demo authentication flow.
- Built-in account: `admin@demo.sentri.test`, password `SentriDemo123!`.
- You can also register a temporary account and sign in with it.
- Accounts are stored as password hashes in server memory, up to 100 accounts.
- A restart clears newly registered demo accounts and invalidates demo sessions.
- Demo mode is intended for one local server process, not a multi-instance host.
- Demo accounts are not copied into PostgreSQL when you switch modes.
- Use fictional information for demos.

### Database behavior

The local `DATABASE_URL` already points to the existing SENTRI database. Database
mode additionally needs the deployment session secret, now configured locally.
For a new machine or hosting environment, use `deployment/.env.example` as a
reference and set:

```env
DEPLOYMENT_AUTH_MODE=database
DATABASE_URL=your_existing_sentri_postgresql_connection_string
DEPLOYMENT_SESSION_SECRET=your_random_secret_of_at_least_32_characters
```

Generate a secret for that environment with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use the same deployment secret across instances and restarts. Rotating it
invalidates existing database sessions. Do not prefix these settings with
`NEXT_PUBLIC_` or commit real values. The old `DISPATCH_SESSION_SECRET` entry is
preserved but is not used by deployment authentication.

Behind a reverse proxy, set `DEPLOYMENT_ORIGIN` to the public origin if Next.js
sees a different internal origin, for example `https://admin.example.com` with no
trailing slash. Production login uses Secure cookies and should run over HTTPS.
TLS settings for PostgreSQL come from the connection URL; the helper does not
disable certificate verification. Use the provider's verified TLS configuration.

Check the connection without creating records:

```sh
npm run db:check
```

Then register a company through the form and log in using those credentials.
The built-in demo account is unavailable in database mode. Existing database
accounts must have a valid bcrypt password hash, role `admin`, and an active
employee linked to a department and company. Placeholder hashes from seed data
cannot be used as real passwords.

Switching modes leaves saved database accounts intact. Sessions are bound to a
mode; demo credentials or cookies cannot grant database access.

## Database records and relationships

No schema migration or new permanent table is required. The implementation uses
the identity tables in `dispatch/database/schema.sql`:

| Table | Purpose in registration |
| --- | --- |
| `companies` | Saves the company name, industry, and generated company code. |
| `departments` | Creates the administrator's department inside that company. |
| `ranks` | Reuses the selected rank by name, or creates it if missing. |
| `employees` | Saves the administrator's name, work email, title, department, and rank. |
| `users` | Saves the login email, bcrypt hash, generated codes, and fixed `admin` role. |

The company association is `users.employee_id → employees.department_id →
departments.company_id → companies.company_id`. There is no `users.company_id`
column. Rank (Staff, Manager, Executive) describes seniority and does not determine
administrator permission.

All registration inserts run in one transaction. If any step fails, all its
changes roll back. Emails are trimmed and normalized to lowercase; registration
checks both user email and employee work email case-insensitively. Transaction
locks serialize registrations for the same email across deployment instances.
Existing database unique constraints remain in force. Company names need not be
unique: each registration creates a new company with its own generated code and
never attaches the registrant to an existing company by name.

Admin registration does not enroll this account in training or create
`user_progress` records. Those belong to the future employee onboarding flow.
The existing dispatch authentication remains independent; this is not shared
sign-in between the two apps.

## API behavior

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register` | Validates form fields and creates the company/admin; returns 201. Does not automatically log in. |
| `POST /api/auth/login` | Checks credentials and role, updates `last_login_at` in database mode, and sets a session cookie. |
| `GET /api/auth/session` | Returns the active mode and signed-in administrator, or `admin: null`; returns demo credentials only in demo mode. |
| `DELETE /api/auth/session` | Clears the deployment session cookie for this browser. |

The signed cookie is named `sentri_deployment_session`, lasts eight hours, is
HttpOnly and SameSite=Lax, and is Secure in production. It includes a user ID,
mode, purpose, and expiration, not the password. Session reads recheck that the
database user remains an admin with an active employee record. Responses are
marked `no-store`.

Passwords are hashed with bcrypt at cost 12. Registration requires at least 12
characters and rejects inputs exceeding bcrypt's 72-byte UTF-8 limit. Passwords
are not trimmed. Names, emails, titles, and other fields are validated against
the database length limits on the server. The forms also provide browser
validation, busy states, and error messages.

Mutating requests require a matching Origin. JSON bodies are limited to 16 KiB.
A per-process limiter allows 10 validated login or registration attempts per
email and operation in 15 minutes. Errors sent to the browser do not expose SQL
or connection credentials.

## Files added or changed

All paths in this table are relative to `deployment/`.

| File | Why it exists or changed |
| --- | --- |
| `src/lib/registration.ts` | Shared form options, data types, and server input validation. |
| `src/lib/auth-config.ts` | Server-controlled mode and separate session-secret configuration. |
| `src/lib/db.ts` | Reusable PostgreSQL connection pool and commit/rollback helper. |
| `src/lib/admin-store.ts` | Database registration/login queries and temporary demo account storage. |
| `src/lib/admin-session.ts` | Signs and verifies mode-bound, expiring admin sessions. |
| `src/lib/auth-http.ts` | Origin checks, body limits, throttling, response/error handling. |
| `src/lib/auth-api.ts` | Browser requests and loading the current session/mode. |
| `src/app/api/auth/register/route.ts` | Registration endpoint. |
| `src/app/api/auth/login/route.ts` | Login endpoint. |
| `src/app/api/auth/session/route.ts` | Session lookup and logout endpoint. |
| `src/app/register/page.tsx` | Replaces preview completion with actual registration and success/error states. |
| `src/app/login/page.tsx` | Replaces placeholder with login, session restoration, and sign-out. |
| `src/app/globals.css` | Form status/error styles and fieldset reset. |
| `.env.example` | Documents mode, database, secret, and optional public-origin settings without credentials. |
| `.env.local` (ignored) | Preserves the existing database URL; adds explicit demo mode and a generated deployment secret. |
| `scripts/check-database.cjs` | Checks connection and required columns in a read-only transaction. |
| `tests/load-typescript.cjs` | Loads TypeScript modules into the Node test runner. |
| `tests/auth.test.cjs` | Exercises demo routes, validation, cookies, origin checks, and mode isolation. |
| `tests/database.test.cjs` | Exercises PostgreSQL behavior using temporary identity tables and rollback. |
| `package.json` | Adds test, database-test, and database-check scripts. Existing installed pg/bcrypt dependencies were reused. |
| `README.md` | Updated startup and feature summary. |

The repository-root `README.md` also links this guide. Existing user edits to
`package-lock.json`, `package.json` dependencies, and `.gitignore` were preserved.
The pre-existing `pnpm-lock.yaml` was not regenerated; npm and its current lockfile
were used for this change.

## Verification

From `deployment/`:

```sh
npm test
npm run typecheck
npm run build
npm run db:check
npm run test:database
```

The database check uses read-only queries against the configured existing schema.
Database integration tests create only temporary tables with their own temporary
sequences in one connection, put `pg_temp` first in the search path, and roll back
at the end. They require PostgreSQL TEMP privileges. They do not create test
companies or users in the real SENTRI tables.

Verified: demo registration/login, case-insensitive duplicates, wrong passwords,
session expiry/tampering/mode isolation, request guards, real PostgreSQL schema
access, password hashing, company ownership, rank reuse, rollback after a failed
insert, and rejection of non-admin or inactive accounts. Type checking and the
production build passed.

Browser verification against the production preview in demo mode also passed:
company/admin form submission, success summary, login with the newly registered
account, built-in demo login, session restoration after refresh, and logout.
Persistent registration against real company/user tables was not performed;
database writes were verified with the temporary-table test above.

## Next integration point and current limits

When the employee-management page exists, use the session verification and admin
lookup on every protected server route. Obtain the company ID from that verified
admin profile, not from a client-supplied company ID. Then add manual entry and
CSV import against that company. A login success message is not itself an
authorization check for future endpoints.

Email verification, password reset, invitations, and ownership verification of a
company are not implemented. Public registration creates a new independent
company; it does not prove that the registrant represents that business.

The current limiter is in memory and resets on restart; a public multi-instance
deployment needs shared throttling and abuse controls. Existing external writers
should normalize emails consistently too: the advisory lock protects writers
using this registration flow, not unrelated legacy scripts.

Sessions are signed tokens, not rows in a session table. Logout removes the cookie
from this browser, but does not revoke an independently copied token before its
eight-hour expiration. Global logout/session revocation and password-reset session
invalidation require a future session store or session version.
