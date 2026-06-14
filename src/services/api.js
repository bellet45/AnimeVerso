import { load } from 'cheerio';

// Base URL for JkAnime (proxied through Vite/Vercel/Netlify)
const PROXY_BASE = '/api-jkanime';

/**
 * 1. Fetch & Parse Home Page
 * Extracts Hero Slider, Recent Updates (episodes), and Popular Animes (Top)
 */
export async function getHomeData() {
  try {
    const res = await fetch(`${PROXY_BASE}/`);
    if (!res.ok) throw new Error('Failed to fetch JkAnime home page');
    const html = await res.text();
    const $ = load(html);

    // Parse Hero Slides (featured anime)
    const heroSlides = [];
    $(".hero__items").each((i, el) => {
      const title = $(el).find("h2").text().trim();
      // Avoid duplicate slides from Carousel clones
      if (title && !heroSlides.some(x => x.title === title)) {
        const dataBg = $(el).attr('data-setbg') || '';
        const bgStyle = $(el).attr('style') || '';
        const bgUrl = dataBg || bgStyle.match(/url\((['"]?)(.*?)\1\)/)?.[2] || '';
        const synopsis = $(el).find("p").text().trim();
        const type = $(el).find(".ainfo span").eq(0).text().trim() || 'Serie';
        const status = $(el).find(".ainfo span").eq(1).text().trim() || 'En emision';
        
        // Find slug from first link
        const link = $(el).find("a").first().attr('href') || '';
        const parts = link.split('/').filter(Boolean);
        let slug = '';
        if (parts.length > 0) {
          slug = parts[parts.length - 2] === 'jkanime.net' ? parts[parts.length - 1] : parts[parts.length - 2];
        }

        heroSlides.push({ title, image: bgUrl, synopsis, type, status, slug });
      }
    });

    // Parse Recent Episodes (Recién Actualizados)
    const recentEpisodes = [];
    // Select recently updated cards inside active TV series tab (#animes)
    $("#animes .card").each((i, el) => {
      const $el = $(el);
      const link = $el.find('a').first().attr('href') || '';
      const title = $el.find('.card-title').text().trim();
      const img = $el.find('.card-img-top').attr('src') || '';
      const animepic = $el.find('.card-img-top').attr('data-animepic') || '';
      const epBadge = $el.find('.badge-primary').text().trim();
      const timeBadge = $el.find('.badge-secondary').text().trim();

      const epMatch = epBadge.match(/\d+/);
      const episodeNumber = epMatch ? parseInt(epMatch[0], 10) : 1;

      // Extract anime slug from link (e.g. jkanime.net/yowayowa-sensei/10/ -> yowayowa-sensei)
      const parts = link.split('/').filter(Boolean);
      const slug = parts[parts.length - 2] || '';

      if (title && slug) {
        recentEpisodes.push({
          title,
          slug,
          episodeNumber,
          image: img,
          coverImage: animepic || img,
          time: timeBadge,
          link
        });
      }
    });

    // Parse Popular Animes (Top animes)
    const popularAnimes = [];
    $(".toplist").each((i, el) => {
      const $el = $(el);
      const link = $el.find('a').first().attr('href') || '';
      const title = $el.find('.card-title').text().trim();
      const img = $el.find('.card-img-top').attr('src') || '';
      const likes = $el.find('.card-badge').text().trim();
      const rank = $el.find('.ranking span').text().trim();
      const synopsis = $el.find('.card-synopsis').text().trim();

      const parts = link.split('/').filter(Boolean);
      const slug = parts[parts.length - 1] || '';

      if (title && slug) {
        popularAnimes.push({
          title,
          slug,
          image: img,
          likes: likes.replace(/\D/g, ''),
          rank: rank.replace('#', ''),
          synopsis
        });
      }
    });

    return {
      hero: heroSlides,
      recentEpisodes: recentEpisodes.slice(0, 16), // limit to 16
      popular: popularAnimes.slice(0, 10) // limit to 10
    };
  } catch (err) {
    console.error('Error fetching home data:', err);
    return { hero: [], recentEpisodes: [], popular: [] };
  }
}

/**
 * 2. Fetch & Parse Anime Details
 * Extracts cover, alternative titles, description, genres, studios, status, animeId and CSRF Token
 */
export async function getAnimeDetails(slug) {
  try {
    const res = await fetch(`${PROXY_BASE}/${slug}/`);
    if (!res.ok) throw new Error(`Failed to fetch anime: ${slug}`);
    const html = await res.text();
    const $ = load(html);

    // Parse Title
    const title = $(".anime__details__text h3").text().trim() || $("title").text().split('-')[0].trim();
    
    // Alt Title / Studio / Genres / Status
    let type = 'Serie';
    let genres = [];
    let studios = [];
    let status = 'En emision';
    let season = '';
    let episodesCount = 0;

    $("ul li").each((_, el) => {
      const text = $(el).text().trim();
      if (text.startsWith("Tipo:")) {
        type = text.replace("Tipo:", "").trim();
      } else if (text.startsWith("Generos:")) {
        $(el).find("a").each((_, a) => {
          genres.push($(a).text().trim());
        });
      } else if (text.startsWith("Studios:")) {
        $(el).find("a").each((_, a) => {
          studios.push($(a).text().trim());
        });
      } else if (text.startsWith("Estado:")) {
        status = text.replace("Estado:", "").trim();
      } else if (text.startsWith("Temporada:")) {
        season = text.replace("Temporada:", "").trim();
      } else if (text.startsWith("Episodios:")) {
        const num = text.match(/\d+/);
        if (num) episodesCount = parseInt(num[0], 10);
      }
    });

    // Parse cover image
    const coverImage = $(".anime_pic img").attr("src") || $(".anime__details__pic").attr("data-setbg") || $(".anime__details__pic img").attr("src") || '';
    
    // Parse Banner Image (Hero background)
    const bannerImage = coverImage;

    // Parse Synopsis
    const synopsis = $(".scroll p, .anime__details__text p").first().text().trim() || $(".scroll").text().trim();

    // Parse Alternative titles if present
    const altTitle = $(".anime__details__title span").text().trim() || title;

    // Extract Anime ID (needed for episodes list AJAX endpoint)
    const animeId = $("#guardar-anime").attr("data-anime") || '';

    // Extract CSRF Token (needed for episodes list AJAX endpoint)
    let csrfToken = $('meta[name="csrf-token"]').attr('content') || '';
    if (!csrfToken) {
      // Look inside scripts for token
      $("script").each((_, el) => {
        const content = $(el).text();
        const match = content.match(/var\s+token\s*=\s*['"]([^'"]+)['"]/);
        if (match) csrfToken = match[1];
      });
    }

    // Related Animes
    const related = [];
    $(".ancrel, .relaciones ul li").each((_, el) => {
      const $el = $(el);
      const link = $el.find("a").attr("href") || '';
      const text = $el.text().trim();
      const parts = link.split("/").filter(Boolean);
      const rSlug = parts.pop() || '';
      if (rSlug && rSlug !== slug) {
        related.push({
          title: $el.find("a").text().trim(),
          relationship: text.replace($el.find("a").text(), '').replace(/:/g, '').trim(),
          slug: rSlug
        });
      }
    });

    return {
      title,
      altTitle,
      slug,
      coverImage,
      bannerImage,
      synopsis,
      type,
      genres,
      studios,
      status,
      season,
      episodesCount,
      animeId,
      csrfToken,
      related
    };
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return null;
  }
}

/**
 * 3. Fetch Episode List (via Laravel CSRF AJAX Endpoint)
 */
export async function getAnimeEpisodes(animeId, page, csrfToken) {
  if (!animeId || !csrfToken) return { total: 0, data: [] };
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('_token', csrfToken);

    const res = await fetch(`${PROXY_BASE}/ajax/episodes/${animeId}/${page}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: searchParams
    });

    if (!res.ok) throw new Error('AJAX request failed');
    return await res.json(); // returns { total, current_page, data: [...] }
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return { total: 0, data: [] };
  }
}

/**
 * 4. Fetch Episode Play Servers & Decode them
 */
export async function getEpisodeServers(slug, episodeNumber) {
  try {
    const res = await fetch(`${PROXY_BASE}/${slug}/${episodeNumber}/`);
    if (!res.ok) throw new Error(`Failed to fetch episode servers: ${slug}/${episodeNumber}`);
    const html = await res.text();
    const $ = load(html);

    // 1. Parse standard servers from var servers
    let standardServers = [];
    const match = html.match(/var\s+servers\s*=\s*(\[.*?\]);/s);
    if (match) {
      try {
        standardServers = JSON.parse(match[1]);
      } catch (e) {
        console.error("Failed to parse standard servers JSON:", e);
      }
    }

    // 2. Parse custom servers from HTML buttons and script video array
    const customServers = [];
    $('.servers, .bg-servers a').each((_, el) => {
      const $el = $(el);
      const id = $el.attr('data-id') || '';
      const name = $el.text().trim();
      if (id && name) {
        customServers.push({ id, name });
      }
    });

    const videoMap = {};
    $('script').each((_, el) => {
      const text = $(el).text();
      if (text.includes('var video =') || text.includes('video[')) {
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.includes('video[') && line.includes('src=')) {
            const idxMatch = line.match(/video\[(\d+)\]/);
            const srcMatch = line.match(/src=["'](.*?)["']/);
            if (idxMatch && srcMatch) {
              videoMap[idxMatch[1]] = srcMatch[1];
            }
          }
        });
      }
    });

    // Resolve custom servers
    const resolvedCustom = customServers
      .map(s => {
        let iframeUrl = videoMap[s.id] || '';
        if (iframeUrl && iframeUrl.startsWith('/')) {
          iframeUrl = 'https://jkanime.net' + iframeUrl;
        }
        return {
          name: s.name,
          url: iframeUrl
        };
      })
      .filter(s => s.url && s.url.startsWith('http'));

    // Map standard servers
    const EXCLUDED_SERVERS = [
      'mediafire', 'zippyshare', 'sendspace', 'rapidgator', 'turbobit',
      '1fichier', 'uptobox', 'download'
    ];

    const resolvedStandard = standardServers
      .map(s => {
        let decodedUrl = '';
        try {
          if (s.remote) {
            const cleanedRemote = s.remote.replace(/\s/g, '');
            decodedUrl = atob(cleanedRemote).trim();
          }
        } catch (e) {
          console.error('Failed to decode base64 for server:', s.server, e);
        }

        return {
          name: s.server || 'Server',
          url: decodedUrl || s.remote
        };
      })
      .filter(s => {
        if (!s.url || !s.url.startsWith('http')) return false;
        const nameLower = s.name.toLowerCase();
        const urlLower = s.url.toLowerCase();
        return !EXCLUDED_SERVERS.some(ex => nameLower.includes(ex) || urlLower.includes(ex));
      });

    // Merge standard and custom servers, ensuring uniqueness by name and URL
    const allServers = [...resolvedCustom, ...resolvedStandard];
    const uniqueServers = [];
    allServers.forEach(s => {
      if (!uniqueServers.some(x => x.name.toLowerCase() === s.name.toLowerCase() || x.url === s.url)) {
        uniqueServers.push(s);
      }
    });

    const SERVER_PRIORITY = {
      'desu': 1,
      'desuka': 1,
      'magi': 1,
      'fembed': 2,
      'okru': 3,
      'ok.ru': 3,
      'mp4upload': 4,
      'streamwish': 5,
      'voe': 6,
      'vidhide': 7,
      'streamtape': 8,
      'mixdrop': 9,
      'doodstream': 10,
      'mega': 11
    };

    const getPriority = (name) => {
      const nameLower = name.toLowerCase();
      if (SERVER_PRIORITY[nameLower] !== undefined) {
        return SERVER_PRIORITY[nameLower];
      }
      for (const [key, value] of Object.entries(SERVER_PRIORITY)) {
        if (nameLower.includes(key)) return value;
      }
      return 50; // default priority for other/unknown streaming servers
    };

    // Sort by priority
    uniqueServers.sort((a, b) => getPriority(a.name) - getPriority(b.name));

    return uniqueServers;
  } catch (error) {
    console.error("Error fetching episode servers:", error);
    return [];
  }
}

/**
 * 5. Search Anime (via Direct Search Scraping)
 */
export async function searchAnime(query, page = 1) {
  if (!query || !query.trim()) return { animes: [], hasNextPage: false };
  try {
    // JkAnime search uses the q query parameter which redirects to /buscar/{query}.
    // We fetch /buscar/{query} directly to avoid 302 redirect and CORS errors in browser.
    const res = await fetch(`${PROXY_BASE}/buscar/${encodeURIComponent(query.trim())}`);
    if (!res.ok) throw new Error('Search request failed');
    const html = await res.text();
    const $ = load(html);

    const animes = [];
    $(".anime__item").each((i, el) => {
      const $el = $(el);
      const link = $el.find('a').first().attr('href') || $el.closest('a').attr('href') || '';
      const title = $el.find('.anime__item__text h5 a').text().trim() || $el.next('.anime__item__text').find('h5 a').text().trim();
      
      const dataBg = $el.find('.anime__item__pic').attr('data-setbg') || $el.attr('data-setbg') || '';
      const bgStyle = $el.find('.anime__item__pic').attr('style') || $el.attr('style') || '';
      const img = dataBg || bgStyle.match(/url\((['"]?)(.*?)\1\)/)?.[2] || '';

      const textContainer = $el.find('.anime__item__text').length > 0
        ? $el.find('.anime__item__text')
        : ($el.next('.anime__item__text').length > 0 
            ? $el.next('.anime__item__text') 
            : $el.parent().find('.anime__item__text'));
      const status = textContainer.find('ul li').first().text().trim();
      const type = textContainer.find('ul li.anime').text().trim() || 'Serie';

      const parts = link.split('/').filter(Boolean);
      const slug = parts.pop() || '';

      if (title && slug) {
        animes.push({
          title,
          slug,
          image: img,
          type,
          status
        });
      }
    });

    return {
      animes,
      hasNextPage: false // search page returns all results at once
    };
  } catch (error) {
    console.error("Error searching anime:", error);
    return { animes: [], hasNextPage: false };
  }
}

/**
 * 6. Filter & Catalog Query Builder
 * Queries /directorio with standard search inputs and extracts the global `var animes` JSON.
 */
export async function getFilteredCatalog(filters = {}, page = 1) {
  try {
    const query = new URLSearchParams();
    if (filters.genero) query.append('genero', filters.genero);
    if (filters.estado) query.append('estado', filters.estado);
    if (filters.tipo) query.append('tipo', filters.tipo);
    if (filters.fecha) query.append('fecha', filters.fecha);
    if (filters.temporada) query.append('temporada', filters.temporada);
    if (filters.orden) query.append('orden', filters.orden);
    if (filters.filtro) query.append('filtro', filters.filtro);
    
    // Add page query
    query.append('p', page);

    const res = await fetch(`${PROXY_BASE}/directorio?${query.toString()}`);
    if (!res.ok) throw new Error('Catalog filter request failed');
    const html = await res.text();
    const $ = load(html);

    let catalogData = { current_page: page, last_page: 1, data: [], total: 0 };

    $("script").each((_, el) => {
      const content = $(el).text();
      if (content.includes("var animes = {")) {
        const match = content.match(/var animes = (\{.*?\});/s);
        if (match) {
          try {
            catalogData = JSON.parse(match[1]);
          } catch (e) {
            console.error("Failed to parse directory animes JSON:", e);
          }
        }
      }
    });

    // Format output data to match our card schemas
    const formattedData = (catalogData.data || []).map(item => ({
      title: item.title,
      slug: item.slug,
      image: item.image,
      type: item.tipo || item.type || 'Serie',
      status: item.estado || item.status || 'En emision',
      synopsis: item.synopsis || ''
    }));

    return {
      current_page: catalogData.current_page,
      last_page: catalogData.last_page,
      total: catalogData.total,
      data: formattedData
    };
  } catch (error) {
    console.error("Error in catalog filter:", error);
    return { current_page: 1, last_page: 1, total: 0, data: [] };
  }
}

/**
 * 7. Fetch Airing Schedule (Mocked / Unused)
 */
export async function getSchedule() {
  return [];
}
