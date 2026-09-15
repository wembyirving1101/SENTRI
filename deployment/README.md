# SENTRI Deployment

Standalone registration UI. Run `npm install`, then `npm run dev` and open
http://localhost:3002. Build with `npm run build`.

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

This is a UI preview: no accounts, companies, or invitations are created.
Form values are held in memory and cleared on refresh. Passwords are not written
to browser storage or sent anywhere and are cleared when reaching Ready.
Returning to edit the admin profile requires re-entering the password.

Registration submission, email verification, and admin authentication still need
backend integration. The dispatch application remains independent.
