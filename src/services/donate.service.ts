export const getAllDonates = async (DB: D1Database) => {
  const { results } = await DB.prepare(`
    SELECT * FROM donates
    ORDER BY created_at DESC
  `).all();

  return results;
};

export const createDonate = async (
  DB: D1Database,
  nickname: string,
  amount: number,
  message: string
) => {
  return DB.prepare(`
    INSERT INTO donates (nickname, amount, message)
    VALUES (?, ?, ?)
  `)
    .bind(nickname, amount, message)
    .run();
};

export const updateDonate = async (
  DB: D1Database,
  id: string,
  nickname: string,
  amount: number,
  message: string
) => {
  return DB.prepare(`
    UPDATE donates
    SET nickname = ?, amount = ?, message = ?
    WHERE id = ?
  `)
    .bind(nickname, amount, message, id)
    .run();
};

export const deleteDonate = async (
  DB: D1Database,
  id: string
) => {
  return DB.prepare(`
    DELETE FROM donates
    WHERE id = ?
  `)
    .bind(id)
    .run();
};

export const deleteAllDonates = async (
  DB: D1Database
) => {
  return DB.prepare(`
    DELETE FROM donates
  `).run();
};