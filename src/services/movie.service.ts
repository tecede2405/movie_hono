export const getMoviesByCategory = async (category: string, db: any) => {
  const { results } = await db.prepare(`
    SELECT * FROM movies 
    WHERE category = ?
    ORDER BY order_index ASC, created_at DESC
  `)
    .bind(category)
    .all()

  return results
}

export const getMovieByPath = async (path: string, db: any) => {
  const result = await db.prepare(`
    SELECT * FROM movies 
    WHERE path = ?
    LIMIT 1
  `)
    .bind(path)
    .first()

  if (!result) throw new Error('Movie not found')

  return result
}

export const insertMovie = async (db: any, body: any) => {
  return db.prepare(`
    INSERT INTO movies (
      title, image, thumb, video, path,
      episode_current, content, lang, category, order_index
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.title,
    body.image,
    body.thumb,
    body.video || null,
    body.path,
    body.episode_current,
    body.content,
    body.lang,
    body.category,
    body.order_index || 0
  ).run()
}

export const updateMovieById = async (db: any, id: string, body: any) => {
  return db.prepare(`
    UPDATE movies
    SET title = ?, image = ?, thumb = ?, video = ?, path = ?, 
        episode_current = ?, content = ?, lang = ?, category = ?, order_index = ?
    WHERE id = ?
  `).bind(
    body.title,
    body.image,
    body.thumb,
    body.video || null,
    body.path,
    body.episode_current,
    body.content,
    body.lang,
    body.category,
    body.order_index || 0,
    id
  ).run()
}

export const deleteMovieById = async (db: any, id: string) => {
  return db.prepare(`DELETE FROM movies WHERE id = ?`)
    .bind(id)
    .run()
}