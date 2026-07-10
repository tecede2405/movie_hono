import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { D1Database } from '@cloudflare/workers-types'
import movieRoutes from './routes/movie.route'
import userRoutes from './routes/user.route'
import commentRoute from './routes/comment.route'
import historyRoute from './routes/history.route'
import donateRoute from "./routes/donate.route";
import favoriteRoute from './routes/favorite.route'
type Bindings = {
  movie_db: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE']
}))
app.route('/', movieRoutes) 
app.route('/auth', userRoutes)
app.route('/', commentRoute)
app.route('/', historyRoute)
app.route("/donates", donateRoute);
app.route('/', favoriteRoute)
app.get('/', (c) => {
  return c.json({ message: 'API OK 🚀' })
})

export default app