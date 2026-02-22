import * as h3 from 'h3';

// Injects h3 exports (defineEventHandler, readBody, etc.) into globalThis.
// Nuxt normally auto-imports these at runtime, but Vitest runs outside Nuxt's
// context so API handler files would fail with 'defineEventHandler is not defined'.
// h3 must be declared as a devDependency so it resolves from node_modules/h3
// (pnpm does not hoist transitive deps by default).
Object.assign(globalThis, h3);
