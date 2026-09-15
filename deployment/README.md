# SENTRI Deployment

Standalone registration UI. Run `npm install`, then `npm run dev` and open
http://localhost:3002. Build with `npm run build`.

Routes: `/` offers company registration or admin login; `/register` contains
Company → Admin Account → Ready; `/login` is a clearly labeled placeholder.

This is a UI preview: no accounts, companies, or invitations are created.
Form values are held in memory and cleared on refresh. Passwords are not written
to browser storage or sent anywhere and are cleared when reaching Ready.
Returning to edit the admin profile requires re-entering the password.

Registration submission, email verification, and admin authentication still need
backend integration. The dispatch application remains independent.
