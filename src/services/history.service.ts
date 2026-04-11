export const saveWatchHistory = async (db: any, userId: number, body: any) => {
  await db.prepare(`
  INSERT INTO watch_history (
    user_id,
    movie_path,
    server,
    episode,
    movie_name,
    image
  )
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(user_id, movie_path, server)
  DO UPDATE SET
    episode = excluded.episode,
    movie_name = excluded.movie_name,
    image = excluded.image,
    updated_at = CURRENT_TIMESTAMP
`)
.bind(
  userId,
  body.movie_path,
  body.server,
  body.episode,
  body.movie_name,
  body.image
)
.run();
};


export const getWatchHistory = async (db: any, userId: number) => {
  const { results } = await db.prepare(`
    SELECT 
      w.id,
      w.movie_path,
      w.server,
      w.episode,
      w.updated_at,
      COALESCE(w.movie_name, m.title) as movie_name,
      COALESCE(w.image, m.image) as image
    FROM watch_history w
    LEFT JOIN movies m ON m.id = (
      SELECT id FROM movies 
      WHERE path = w.movie_path 
      ORDER BY (image LIKE 'http%') DESC, created_at DESC 
      LIMIT 1
    )
    WHERE w.user_id = ?
    ORDER BY w.updated_at DESC
    LIMIT 15
  `)
  .bind(userId)
  .all();

  return results;
};