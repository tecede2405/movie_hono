import { Hono } from 'hono'
import {
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/movie.controller'
import { getMoviesByCategory, getMovieByPath } from '../services/movie.service'
import type { D1Database } from '@cloudflare/workers-types'
import { authMiddleware,  adminMiddleware } from '../middlewares/auth.middleware'
type Bindings = {
  movie_db: D1Database
}
const app = new Hono<{ Bindings: Bindings }>()

app.get('/films/:category', async (c) => {
  const movies = await getMoviesByCategory(c.req.param('category'), c.env.movie_db)
  return c.json(movies)
})

app.get('/movie/:path', async (c) => {
  try {
    const movie = await getMovieByPath(c.req.param('path'), c.env.movie_db)
    return c.json(movie)
  } catch (err: any) {
    return c.json({ message: err.message }, 404)
  }
})

app.post('/movies', authMiddleware, adminMiddleware, createMovie)
app.put('/movies/:id', authMiddleware, adminMiddleware, updateMovie)
app.delete('/movies/:id', authMiddleware, adminMiddleware, deleteMovie)

// giữ nguyên cache logic
app.get('/movie-detail/:path', async (c) => {
  const path = c.req.param('path')
  const cache = caches.default
  const cacheKey = new Request(c.req.url)

  let res = await cache.match(cacheKey)
  if (res) return res

  try {
    const apiRes = await fetch(`https://phimapi.com/phim/${path}`)

    if (!apiRes.ok) {
      return c.json({ message: 'API ngoài lỗi' }, 500)
    }

    const data = await apiRes.json()

    res = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300'
      }
    })

    await cache.put(cacheKey, res.clone())

    return res
  } catch {
    return c.json({ message: 'Fetch failed' }, 500)
  }
})

export default app