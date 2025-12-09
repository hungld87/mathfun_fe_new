import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
  const file = join(process.cwd(), 'server', 'mocks', 'teachers.json')
  const data = JSON.parse(await readFile(file, 'utf-8'))
  return {
    status: 'ok',
    data
  }
})
