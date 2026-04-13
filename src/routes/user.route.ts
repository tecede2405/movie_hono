import { Hono } from 'hono'
import { register, login } from '../controllers/user.controller'
import type { D1Database } from '@cloudflare/workers-types'
import { getUsers} from '../controllers/user.controller'
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware'
type Bindings = {
  movie_db: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()
app.get('/users', getUsers)
app.post('/register', register)
app.post('/login', login)

export default app