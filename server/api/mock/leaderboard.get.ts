import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
  const file = join(process.cwd(), 'server', 'mocks', 'leaderboard.json')
  const data = JSON.parse(await readFile(file, 'utf-8'))
  return {
    status: 'ok',
    data: data.slice(0, 3)
  }
})
