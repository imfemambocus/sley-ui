import { createRequire } from 'node:module'

/*
 * vue-tsc needs the javascript typescript api, and typescript 7 is the native compiler
 * with no such api. the `@typescript/old` alias is the version 6 compiler that the
 * typescript team publishes for exactly this case, and vue-tsc takes the path to it.
 */
const require = createRequire(import.meta.url)
require('vue-tsc').run(require.resolve('@typescript/old/lib/tsc'))
