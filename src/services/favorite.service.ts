export const addFavorite = async (db: any, userId: number, body: any) => {
  await db.prepare(`
    INSERT INTO favorites (user_id, movie_path, movie_name, image)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, movie_path) DO NOTHING
  `)
    .bind(userId, body.movie_path, body.movie_name || null, body.image || null)
    .run()
}

export const getFavorites = async (db: any, userId: number) => {
  const { results } = await db.prepare(`
    SELECT id, movie_path, movie_name, image, created_at
    FROM favorites
    WHERE user_id = ?
    ORDER BY created_at DESC
  `)
    .bind(userId)
    .all()

  return results
}

export const deleteFavorite = async (db: any, userId: number, moviePath: string) => {
  await db.prepare(`
    DELETE FROM favorites
    WHERE user_id = ? AND movie_path = ?
  `)
    .bind(userId, moviePath)
    .run()
}

export const checkFavorite = async (db: any, userId: number, moviePath: string) => {
  const row = await db.prepare(`
    SELECT id FROM favorites
    WHERE user_id = ? AND movie_path = ?
  `)
    .bind(userId, moviePath)
    .first()

  return !!row
}
