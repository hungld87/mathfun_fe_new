import { rest } from 'msw'

export const handlers = [
  rest.get('/api/mock/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Nguyen A', email: 'a@example.com' },
        { id: 2, name: 'Tran B', email: 'b@example.com' }
      ])
    )
  })
]
