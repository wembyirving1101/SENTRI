# SENTRI Deployment

Company registration and admin login, with demo and PostgreSQL database modes.
Run `npm install`, then `npm run dev` and open http://localhost:3002.
Build with `npm run build` and serve with `npm start`.

Routes: `/` offers company registration or admin login; `/register` contains
Company → Admin Account → Ready; `/login` opens the labeled admin preview;
`/admin` contains the employee deployment queue.

The admin preview starts with four fictional employees. Add/edit employees,
filter/search the queue, select eligible recipients, and simulate invitations.
Employee data and notes are saved to browser local storage, not to a server.
Accepted and inactive employees cannot be selected for invitations. Changing
an email resets its invitation status. No emails are sent or access granted.

CSV import supports quoted fields, duplicate detection, required-field checks,
and review before confirmation. Only valid rows are imported; warning/error rows
are skipped. Limits: 2 MB and 2,000 records. Download the template in the import
panel. Employment Status is optional and defaults to Active.

Run `npm test` for parser/validation checks and `npm run typecheck` for TypeScript.
Set `DEPLOYMENT_AUTH_MODE=demo` or `DEPLOYMENT_AUTH_MODE=database` in
`deployment/.env.local`, then restart. Database mode uses the existing SENTRI
`DATABASE_URL` and a separate `DEPLOYMENT_SESSION_SECRET` (at least 32 characters).
See `.env.example` for configuration.

Demo login: `admin@demo.sentri.test` / `SentriDemo123!`. Demo registrations are
temporary and disappear on server restart. Database registrations persist.

After login, `/login` shows the signed-in administrator and company. Employee
management, CSV upload, manual entry, and the future admin page are not created
yet. Dispatch login remains independent.

Read [AUTH_DATABASE_GUIDE.md](./AUTH_DATABASE_GUIDE.md) for all changed files,
database relationships, mode-switching steps, testing, and current limitations.

Checks: `npm test`, `npm run typecheck`, `npm run build`, `npm run db:check`,
and `npm run test:database` (temporary PostgreSQL tables; no persistent test data).
