import { Hono } from 'hono'
import {
  createMovie,
  updateMovie,
  deleteMovie,
  getAllMovies,
  getMoviesByCategory,
  searchMovies,
  getMovieDetail
} from '../controllers/movie.controller'

import type { D1Database } from '@cloudflare/workers-types'
import { authMiddleware,  adminMiddleware } from '../middlewares/auth.middleware'
type Bindings = {
  movie_db: D1Database
}
const app = new Hono<{ Bindings: Bindings }>()

app.get('/movies', getAllMovies)
app.get('/search', searchMovies)
app.get('/films/:category', getMoviesByCategory)


app.post('/movies', authMiddleware, adminMiddleware, createMovie)
app.put('/movies/:id', authMiddleware, adminMiddleware, updateMovie)
app.delete('/movies/:id', authMiddleware, adminMiddleware, deleteMovie)

// giữ nguyên cache logic
app.get(
  '/movie-detail/:slug',
  getMovieDetail
)


export default app