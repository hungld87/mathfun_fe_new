import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
  const file = join(process.cwd(), 'server', 'mocks', 'users.json')
  return {
    status: 'ok',
    data: JSON.parse(await readFile(file, 'utf-8'))
  }
})
