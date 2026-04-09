import { Hono } from 'hono'
import { register, login } from '../controllers/user.controller'
import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  movie_db: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.post('/register', register)
app.post('/login', login)

export default app