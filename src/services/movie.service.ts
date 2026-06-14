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


export const getAllMovies = async (db: any) => {
  const count = await db.prepare(`
    SELECT COUNT(*) as total FROM movies
  `).first()

  console.log("TOTAL MOVIES:", count)

  const { results } = await db.prepare(`
    SELECT * FROM movies
    ORDER BY order_index ASC, created_at DESC
  `).all()

  return results
}

export const insertMovie = async (db: any, body: any) => {
  return db.prepare(`
    INSERT INTO movies (
      title, origin_name, image, thumb, video, path,
      episode_current, content, lang, category, order_index
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.title,
    body.origin_name || null,
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
    SET 
      title = ?, 
      origin_name = ?, 
      image = ?, 
      thumb = ?, 
      video = ?, 
      path = ?, 
      episode_current = ?, 
      content = ?, 
      lang = ?, 
      category = ?, 
      order_index = ?
    WHERE id = ?
  `).bind(
    body.title,
    body.origin_name || null,
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

// crawl 2 nguồn
// crawl 3 nguồn
const MOVIE_API = {
  nc: (slug: string) =>
    `https://phim.nguonc.com/api/film/${slug}`,

  kk: (slug: string) =>
    `https://phimapi.com/phim/${slug}`,

  op: (slug: string) => 
    `https://ophim1.com/phim/${slug}`,
}

const SEARCH_API = (
  keyword: string,
) =>
  `https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword)}`

function normalize(str = '') {
  return str
    .toLowerCase()
    .trim()
    .replace(/-/g, ' ')
    .replace(/[^\w\s]/g, '')
}



async function fetchJson<T = any>(
  url: string
): Promise<T> {

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  if (!res.ok) {
    throw new Error('Fetch failed')
  }

  return res.json()
}

async function fetchSource(
  source: keyof typeof MOVIE_API,
  slug: string
) {
  try {
    const data: any = await fetchJson(
      MOVIE_API[source](slug)
    )

    let movie = null
    let episodes = []

    // nguonc
    if (source === 'nc') {
      movie = data?.movie || data;
      episodes = data?.episodes || movie?.episodes || []; 
    }

    // kkphim & ophim dùng chung cấu trúc
    if (source === 'kk' || source === 'op') {
      movie = data?.movie || {}
      episodes = data?.episodes || []
    }

    return {
      source,
      success: true,
      movie,
      episodes,
      raw: data
    }

  } catch (err: any) {
    return {
      source,
      success: false,
      error: err.message
    }
  }
}



//  SEARCH MOVIE

export const searchExternalMovie = async (
  keyword: string
) => {

  const data: any  = await fetchJson(
    SEARCH_API(keyword)
  )

  const items =
    data?.items ||
    data?.data ||
    []

  return items.map((item: any) => ({
    title:
      item.name || item.title,

    origin_name:
      item.origin_name,

    image:
      item.poster_url ||
      item.image ||
      item.thumb_url,

    thumb:
      item.thumb_url ||
      item.thumb,

    path:
      item.slug || item.path,

    year:
      item.year,

    lang:
      item.lang,

    episode_current:
      item.episode_current
  }))
}


/* =========================
   MOVIE DETAIL
========================= */



export const getMovieDetailMultiSource = async (slug: string) => {
  // 1. fetch song song từ 3 nguồn
  const [ncResultFirst, kkResultFirst, opResultFirst] = await Promise.all([
    fetchSource("nc", slug),
    fetchSource("kk", slug),
    fetchSource("op", slug),
  ]);

  let ncResult = ncResultFirst;
  let kkResult = kkResultFirst;
  let opResult = opResultFirst;

  // --- MÁY QUÉT LỆCH PHIM (BẮT LỖI TRÙNG SLUG VỚI PHIM LẺ/OVA) ---
  const getEpCount = (movie: any, eps: any[]) => {
    let count = parseInt(movie?.episode_total || movie?.total_episodes || "0");
    if (!isNaN(count) && count > 0) return count;
    try {
      if (eps?.[0]?.server_data) return eps[0].server_data.length;
      if (eps?.[0]?.items) return eps[0].items.length;
    } catch (e) {}
    return 1;
  };

  const kkTotalEps = getEpCount(kkResult.movie, kkResult.episodes);
  const ncTotalEps = getEpCount(ncResult.movie, ncResult.episodes);
  const opTotalEps = getEpCount(opResult.movie, opResult.episodes);

  // Lấy ra số tập lớn nhất để làm chuẩn (đại diện cho phim bộ gốc)
  const maxEps = Math.max(kkTotalEps, ncTotalEps, opTotalEps);

  // Nhận diện nếu 1 bên là phim lẻ (<=2 tập) trong khi các bên khác là phim bộ (>5 tập)
  const isKkWrong = kkResult.success && maxEps > 5 && kkTotalEps <= 2;
  const isNcWrong = ncResult.success && maxEps > 5 && ncTotalEps <= 2;
  const isOpWrong = opResult.success && maxEps > 5 && opTotalEps <= 2;
  // --------------------------------------------------------------

  // Hàm helper sinh từ khóa tìm kiếm (dùng chung cho các fallback)
  const generateKeywords = (movie: any) => {
    return [movie?.name, movie?.origin_name, movie?.original_name]
      .filter(Boolean)
      .flatMap((x: string) => x.split(","))
      .map((x: string) => normalize(x))
      .filter(Boolean);
  };

  // 2. FALLBACK 1: KKPhim
  const badKkSlug = isKkWrong ? (kkResult.movie?.slug || slug) : null;
  if ((ncResult.success || opResult.success) && (!kkResult.success || !kkResult.episodes?.length || isKkWrong)) {
    const refMovie = ncResult.movie || opResult.movie;
    const keywords = generateKeywords(refMovie);
    let matched: any = null;

    for (const keyword of keywords) {
      try {
        const searchData: any = await fetchJson(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=100`);
        const items = searchData?.items || searchData?.data?.items || [];
        matched = items.find((x: any) => {
          const itemSlug = x.slug || x.path;
          if (badKkSlug && itemSlug === badKkSlug) return false; 
          const name = normalize(x.name);
          const origin = normalize(x.origin_name || x.original_name);
          return name.includes(keyword) || origin.includes(keyword) || keyword.includes(name) || keyword.includes(origin);
        });
        if (matched) {
          const newKkResult = await fetchSource("kk", matched.slug);
          if (newKkResult.success) { kkResult = newKkResult; break; }
        }
      } catch {}
    }
  }

  // 3. FALLBACK 2: Nguồn C
  const badNcSlug = isNcWrong ? (ncResult.movie?.slug || slug) : null;
  if ((kkResult.success || opResult.success) && (!ncResult.success || !ncResult.episodes?.length || isNcWrong)) {
    const refMovie = kkResult.movie || opResult.movie;
    const keywords = generateKeywords(refMovie);
    let matched: any = null;

    for (const keyword of keywords) {
      try {
        const searchData: any = await fetchJson(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword)}`);
        const items = searchData?.items || searchData?.data || [];
        matched = items.find((x: any) => {
          const itemSlug = x.slug || x.path;
          if (badNcSlug && itemSlug === badNcSlug) return false;
          const name = normalize(x.name || x.title);
          const origin = normalize(x.original_name || x.origin_name);
          return name.includes(keyword) || origin.includes(keyword) || keyword.includes(name) || keyword.includes(origin);
        });
        if (matched) {
          const newNcResult = await fetchSource("nc", matched.slug || matched.path);
          if (newNcResult.success) { ncResult = newNcResult; break; }
        }
      } catch {}
    }
  }

  // 4. FALLBACK 3: Ophim (MỚI)
  const badOpSlug = isOpWrong ? (opResult.movie?.slug || slug) : null;
  if ((kkResult.success || ncResult.success) && (!opResult.success || !opResult.episodes?.length || isOpWrong)) {
    const refMovie = kkResult.movie || ncResult.movie;
    const keywords = generateKeywords(refMovie);
    let matched: any = null;

    for (const keyword of keywords) {
      try {
        const searchData: any = await fetchJson(`https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=100`);
        const items = searchData?.items || searchData?.data?.items || [];
        matched = items.find((x: any) => {
          const itemSlug = x.slug || x.path;
          if (badOpSlug && itemSlug === badOpSlug) return false; 
          const name = normalize(x.name);
          const origin = normalize(x.origin_name || x.original_name);
          return name.includes(keyword) || origin.includes(keyword) || keyword.includes(name) || keyword.includes(origin);
        });
        if (matched) {
          const newOpResult = await fetchSource("op", matched.slug);
          if (newOpResult.success) { opResult = newOpResult; break; }
        }
      } catch {}
    }
  }

  // 5. KIỂM TRA KẾT QUẢ CUỐI CÙNG
  const successResults = [kkResult, ncResult, opResult].filter((x) => x.success);
  if (!successResults.length) {
    throw new Error("Movie not found in all sources");
  }

  // Ưu tiên lấy thông tin phim từ KKPhim -> Ophim -> NguồnC
  const kkMovie = kkResult.success ? kkResult.movie : null;
  const opMovie = opResult.success ? opResult.movie : null;
  const ncMovie = ncResult.success ? ncResult.movie : null;

  const extractNguoncCategory = (catObj: any, groupName: string) => {
    if (!catObj || typeof catObj !== "object") return null;
    for (const key in catObj) {
      if (catObj[key]?.group?.name === groupName) return catObj[key].list || [];
    }
    return null;
  };

  const extractNguoncYear = (catObj: any) => {
    const yearList = extractNguoncCategory(catObj, "Năm");
    return yearList && yearList.length > 0 ? yearList[0].name : null;
  };

  const movie = {
    name: kkMovie?.name || opMovie?.name || ncMovie?.name,
    origin_name: kkMovie?.origin_name || opMovie?.origin_name || ncMovie?.original_name || ncMovie?.origin_name,
    poster_url: kkMovie?.poster_url || opMovie?.poster_url || ncMovie?.poster_url,
    thumb_url: kkMovie?.thumb_url || opMovie?.thumb_url || ncMovie?.thumb_url,
    slug: kkMovie?.slug || opMovie?.slug || ncMovie?.slug,
    content: kkMovie?.content || opMovie?.content || ncMovie?.description || ncMovie?.content,
    lang: kkMovie?.lang || opMovie?.lang || ncMovie?.language || ncMovie?.lang,
    quality: kkMovie?.quality || opMovie?.quality || ncMovie?.quality,
    episode_current: kkMovie?.episode_current || opMovie?.episode_current || ncMovie?.current_episode,
    episode_total: kkMovie?.episode_total || opMovie?.episode_total || ncMovie?.total_episodes,
    category: kkMovie?.category || opMovie?.category || extractNguoncCategory(ncMovie?.category, "Thể loại"),
    country: kkMovie?.country || opMovie?.country || extractNguoncCategory(ncMovie?.category, "Quốc gia"),
    year: kkMovie?.year || opMovie?.year || extractNguoncYear(ncMovie?.category),
    actor: kkMovie?.actor || opMovie?.actor || ncMovie?.casts,
    director: kkMovie?.director || opMovie?.director || ncMovie?.director,
    time: kkMovie?.time || opMovie?.time || ncMovie?.time,
  };

  const servers: any[] = [];

  // KKPhim Stream
  if (kkResult.success) {
    servers.push({
      source: "kk",
      episodes: (kkResult.episodes || []).map((ep: any) => ({
        server_name: ep.server_name,
        server_data: ep.server_data || ep.items || [],
      })),
    });
  }

  // Ophim Stream
  if (opResult.success) {
    servers.push({
      source: "op",
      episodes: (opResult.episodes || []).map((ep: any) => ({
        server_name: ep.server_name,
        server_data: ep.server_data || ep.items || [],
      })),
    });
  }

  // Nguồn C Stream
  if (ncResult.success) {
    const parseNcEpisodes = (ncEpisodes: any[]) => {
      const parsedServers: any[] = [];
      ncEpisodes.forEach((epGroup) => {
        if (epGroup.server_name) {
          const rawItems = epGroup.items || epGroup.server_data || [];
          parsedServers.push({
            server_name: epGroup.server_name,
            server_data: rawItems.map((item: any) => ({
              name: item.name,
              slug: item.slug,
              embed: item.embed || item.link_embed,
              m3u8: item.m3u8 || item.link_m3u8
            })),
          });
        } else if (typeof epGroup === 'object') {
          for (const key in epGroup) {
            if (Array.isArray(epGroup[key])) {
              parsedServers.push({
                server_name: key,
                server_data: epGroup[key].map((item: any) => ({
                  name: item.name,
                  slug: item.slug,
                  embed: item.embed || item.link_embed,
                  m3u8: item.m3u8 || item.link_m3u8
                })),
              });
            }
          }
        }
      });
      return parsedServers;
    };

    servers.push({
      source: "nc",
      episodes: parseNcEpisodes(ncResult.episodes || []),
    });
  }

  return {
    movie,
    episodes: servers,
  };
};

