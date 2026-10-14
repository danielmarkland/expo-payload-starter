import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)))
let state
try {
  state = JSON.parse(readFileSync(`${root}/.starter/state.json`, 'utf8'))
} catch {
  console.error('Run pnpm run setup first.')
  process.exit(1)
}
if (state.mode !== 'local' || !state.completed) {
  console.error(
    'Complete local pnpm run setup first. Hosted backends use pnpm dev:app:web.',
  )
  process.exit(1)
}
const children = [
  spawn('pnpm', ['dev:site'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PORT: String(state.ports.site) },
  }),
  spawn(
    'pnpm',
    [
      '--filter',
      '@starter/app',
      'exec',
      'expo',
      'start',
      '--web',
      '--port',
      String(state.ports.app),
    ],
    { cwd: root, stdio: 'inherit' },
  ),
]
let stopping = false
const stop = (code = 0) => {
  if (stopping) return
  stopping = true
  process.exitCode = code
  for (const child of children) child.kill('SIGTERM')
}
for (const child of children) {
  child.on('error', () => stop(1))
  child.on('exit', (code) => stop(code || 0))
}
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
