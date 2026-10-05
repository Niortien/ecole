// Compile la logique pure (lib/domain + tests) avec tsc vers un dossier temporaire, puis lance le runner de Node.
import { execFileSync } from 'node:child_process'
import { readdirSync, rmSync } from 'node:fs'

const out = '.tmp-tests'
const fichiers = readdirSync('tests')
  .filter((f) => f.endsWith('.test.ts'))
  .map((f) => `tests/${f}`)

rmSync(out, { recursive: true, force: true })
try {
  execFileSync(
    'npx',
    [
      'tsc',
      '--outDir', out,
      '--module', 'commonjs',
      '--moduleResolution', 'node10',
      '--target', 'es2022',
      '--strict',
      '--esModuleInterop',
      '--skipLibCheck',
      '--types', 'node',
      '--rewriteRelativeImportExtensions',
      ...fichiers,
    ],
    { stdio: 'inherit', shell: process.platform === 'win32' },
  )
  execFileSync('node', ['--test', `${out}/tests/`], { stdio: 'inherit' })
} finally {
  rmSync(out, { recursive: true, force: true })
}
