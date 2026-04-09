import * as movieService from '../services/movie.service'

export const createMovie = async (c: any) => {
  const user = c.get('user')
  const body = await c.req.json()
  const result = await movieService.insertMovie(c.env.movie_db, body)
  return c.json({ success: true, result })
}

export const updateMovie = async (c: any) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const result = await movieService.updateMovieById(c.env.movie_db, id, body)
  return c.json({ success: true, result })
}

export const deleteMovie = async (c: any) => {
  const id = c.req.param('id')

  const result = await movieService.deleteMovieById(c.env.movie_db, id)
  return c.json({ success: true, result })
}