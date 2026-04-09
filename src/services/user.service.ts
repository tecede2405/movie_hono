import bcrypt from 'bcryptjs'

export const createUser = async (db: any, body: any) => {
  const hashedPassword = await bcrypt.hash(body.password, 10)

  const recovery_code = Math.floor(100000 + Math.random() * 900000).toString()

  return db.prepare(`
    INSERT INTO users (username, password, display_name, recovery_code)
    VALUES (?, ?, ?, ?)
  `).bind(
    body.username,
    hashedPassword,
    body.display_name,
    recovery_code
  ).run()
}

export const findUserByUsername = async (db: any, username: string) => {
  return db.prepare(`
    SELECT * FROM users WHERE username = ?
  `).bind(username).first()
}