# SeemaDrishti officer workspace

An SSB screening prototype with account-bound officer profiles, persistent cases, document upload, camera capture, live face capture, entered-field checks, officer actions, supervisor referral status, and case history. New profiles begin with no sample cases.

## Runtime and data

The private hosted Site uses the platform's authenticated user identity. The application creates an eight-hour, HttpOnly officer session bound to that identity. Logout revokes the application session and navigates to platform sign-out. Officer profile details are self-entered for this private prototype; they are not an SSB credential verification. An actual SSB identity provider must be integrated before operational deployment.

Cloudflare D1 stores officers, sessions, cases, fields, checks, review actions and audit events. R2 stores uploaded documents and face captures. File reads and case operations require the owning officer or a server-provisioned supervisor role. No client-side role selector grants supervisor access. Records are not stored in localStorage.

The document workflow accepts JPEG, PNG, WebP and PDF, up to 12 MB. Camera capture uses the browser camera API and can select connected video devices. Direct scanner drivers are not connected; scanner output can be imported as a file. Captures of the same document type preserve earlier versions and replace the active version. Face-photo capture is not proof of liveness.

## Checks available now

File-presence checks and rules on explicitly officer-entered names, birth dates and passport expiry are implemented. OCR, automated capture quality, document forensics, face matching, liveness and external records are not connected. They remain `not_performed`. The server refuses a passed decision while any required check is incomplete or a stored result is stale. Supervisor referrals are recorded as pending review; no notification service is connected.

## Development

Install with `npm install`. Generate schema migrations with `npm run db:generate`. Build with `npm run build`, apply local migrations using `npx wrangler d1 migrations apply DB --local`, and run `npm run dev`.

For local preview only, ignored `.dev.vars` may contain `LOCAL_DEVELOPMENT=true`; the fallback identity is additionally restricted to localhost hostnames. Never set that variable on a hosted environment. Hosted deployment relies on the platform identity headers.

Run `npm test` for field-rule and input checks. With the local server running, run `node tests/integration.mjs` for login, persistence, ownership isolation, upload storage, recapture versioning, stale results, logout and invalid-pass enforcement. Integration fixtures use isolated local test accounts and do not populate hosted officer records.

`server/worker.mjs` implements the API, `server/checks.mjs` implements the currently supported checks, `db/schema.ts` defines storage, and `dist/workspace.js` implements the interface. The build embeds the active UI in the Worker output; old reference-only static files are not exposed by the new server.
