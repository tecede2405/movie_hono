import {
  getAllDonates,
  createDonate,
  updateDonate,
  deleteDonate,
  deleteAllDonates,
} from "../services/donate.service";

export const getDonatesHandler = async (c: any) => {

  const cache = caches.default

  const url = new URL(c.req.url)

  const cacheKey = new Request(
    `${url.origin}/donates`
  )

  // 1. CACHE HIT
  const cached = await cache.match(cacheKey)

  if (cached) {
    console.log('DONATE CACHE HIT')
    return cached
  }

  console.log('DONATE CACHE MISS')

  // 2. QUERY DB
  const donates = await getAllDonates(
    c.env.movie_db
  )

  // 3. RESPONSE
  const response = Response.json(
    donates,
    {
      headers: {
        'Cache-Control':
          'public, max-age=7200'
      }
    }
  )

  // 4. SAVE CACHE
  c.executionCtx.waitUntil(
    cache.put(
      cacheKey,
      response.clone()
    )
  )

  return response
}

export const createDonateHandler = async (c: any) => {
  const body = await c.req.json();

  const { nickname, amount, message } = body;

  if (!nickname || !amount) {
    return c.json(
      {
        error: "Missing fields",
      },
      400
    );
  }

  const result = await createDonate(
    c.env.movie_db,
    nickname,
    amount,
    message || ""
  );

  const url = new URL(c.req.url)

    await caches.default.delete(
      new Request(`${url.origin}/donates`)
    )
  const insertedId = result.meta?.last_row_id;

  if (!insertedId) {
    return c.json(
      {
        error: "Insert failed",
      },
      500
    );
  }

  const { results } = await c.env.movie_db.prepare(`
    SELECT *
    FROM donates
    WHERE id = ?
  `)
    .bind(insertedId)
    .all();

  return c.json(results[0]);
};

export const updateDonateHandler = async (c: any) => {
  const id = c.req.param("id");

  const body = await c.req.json();

  const { nickname, amount, message } = body;

  await updateDonate(
    c.env.movie_db,
    id,
    nickname,
    amount,
    message
  );

  return c.json({
    success: true,
    message: "Donate updated",
  });
};

export const deleteDonateHandler = async (c: any) => {
  const id = c.req.param("id");

  await deleteDonate(c.env.movie_db, id);

  return c.json({
    success: true,
    message: "Donate deleted",
  });
};

export const deleteAllDonatesHandler = async (c: any) => {
  await deleteAllDonates(c.env.movie_db);

  return c.json({
    success: true,
    message: "All donates deleted",
  });
};