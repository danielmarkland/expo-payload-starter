# Payload document-lock transaction patch

`payload@3.90.2.patch` passes the current request to the native document-lock
read. Without it, a save holds its transaction connection while the lock check
requests another connection; concurrent saves can exhaust a small pool and time
out. This is the same narrow patch already used by the platform. Lock checks,
transactions and other-editor protection remain enabled.

`node --test scripts/payload-document-lock.test.mjs` exercises concurrent saves
without extra connections, a foreign editor's active lock and the current
editor's lock. The root test command includes these checks. On a Payload upgrade,
remove the patch only when upstream includes the request in this database read;
retain the regression coverage.
