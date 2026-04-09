export const createComment = async (db: any, body: any, userId: number) => {
  return db.prepare(`
    INSERT INTO comments (movie_path, user_id, content, parent_id)
    VALUES (?, ?, ?, ?)
  `).bind(
    body.movie_path,
    userId,
    body.content,
    body.parent_id || null
  ).run()
}

export const getCommentsByMovie = async (db: any, moviePath: string) => {
  const { results } = await db.prepare(`
    SELECT c.*, u.display_name, u.avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE movie_path = ?
    ORDER BY created_at ASC
  `).bind(moviePath).all()

  return results
}

export const buildCommentTree = (comments: any[]) => {
  const map: any = {}
  const roots: any[] = []

  comments.forEach(c => {
    c.replies = []
    map[c.id] = c
  })

  comments.forEach(c => {
    if (c.parent_id) {
      map[c.parent_id]?.replies.push(c)
    } else {
      roots.push(c)
    }
  })

  return roots
}