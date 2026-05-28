import * as movieService from '../services/movie.service'

export const getAllMovies = async (c: any) => {

  const cache = caches.default

  const url = new URL(c.req.url)

  const cacheKey = new Request(
    `${url.origin}/movies`
  )

  // CACHE HIT
  const cached = await cache.match(cacheKey)

  if (cached) {
    console.log('CACHE HIT')
    return cached
  }

  console.log('CACHE MISS')

  // DB QUERY
  const movies =
    await movieService.getAllMovies(
      c.env.movie_db
    )

  // RESPONSE
  const response = Response.json(movies, {
    headers: {
      'Cache-Control':
        'public, max-age=86400'
    }
  })

  // SAVE CACHE
  c.executionCtx.waitUntil(
    cache.put(
      cacheKey,
      response.clone()
    )
  )

  return response
}

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

export const getMoviesByCategory = async (c: any) => {
  const category = c.req.param('category')
  const movies = await movieService.getMoviesByCategory(category, c.env.movie_db)
  return c.json(movies)
}


export const getMovies = async (c: any) => {
  try {

    const db = c.env.DB

    const movies =
      await movieService.getAllMovies(db)

    return c.json({
      success: true,
      data: movies
    })

  } catch (err: any) {

    return c.json(
      {
        success: false,
        error: err.message
      },
      500
    )
  }
}

export const searchMovies = async (
  c: any
) => {

  try {

    const q =
      c.req.query('q') || ''


    if (!q) {
      return c.json(
        {
          success: false,
          message:
            'Missing keyword'
        },
        400
      )
    }

    const movies =
      await movieService.searchExternalMovie(q)

    return c.json({
      success: true,
      data: movies
    })

  } catch (err: any) {

    return c.json(
      {
        success: false,
        error: err.message
      },
      500
    )
  }
}

export const getMovieDetail = async (
  c: any
) => {

  try {

    const slug =
      c.req.param('slug')

    const movie =
      await movieService.getMovieDetailMultiSource(
        slug
      )

    return c.json({
      success: true,
      data: movie
    })

  } catch (err: any) {

    return c.json(
      {
        success: false,
        error: err.message
      },
      500
    )
  }
}