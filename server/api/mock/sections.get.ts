import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async () => {
  const filePath = join(process.cwd(), 'server/mocks/sections.json')
  const data = await readFile(filePath, 'utf-8')
  return {
    status: 'ok',
    data: JSON.parse(data)
  }
})
