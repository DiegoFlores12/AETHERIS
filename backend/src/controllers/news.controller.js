const pool = require('../config/db');
const notificationSubject = require('../patterns/NotificationObserver');

async function listNews(req, res) {
  const { rows } = await pool.query(`
    SELECT n.*, COALESCE(json_object_agg(r.reaction, r.total) FILTER (WHERE r.reaction IS NOT NULL), '{}') AS reactions
    FROM news n
    LEFT JOIN (
      SELECT news_id, reaction, COUNT(*) total FROM news_reactions GROUP BY news_id, reaction
    ) r ON r.news_id = n.id
    GROUP BY n.id
    ORDER BY n.created_at DESC
  `);
  res.json(rows);
}

async function createNews(req, res) {
  const { title, content, imageUrl, eventDate } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Título y contenido son obligatorios' });

  const { rows } = await pool.query(
    `INSERT INTO news (title, content, image_url, event_date, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [title, content, imageUrl || null, eventDate || null, req.user.id]
  );

  await notificationSubject.notify({
    type: 'NEWS_CREATED',
    payload: rows[0]
  });

  res.status(201).json(rows[0]);
}

async function reactNews(req, res) {
  const { newsId } = req.params;
  const { reaction } = req.body;
  if (!['enojo', 'asombro', 'contento'].includes(reaction)) {
    return res.status(400).json({ message: 'Reacción inválida' });
  }

  const { rows } = await pool.query(
    `INSERT INTO news_reactions (user_id, news_id, reaction)
      VALUES ($1,$2,$3)
      ON CONFLICT (user_id, news_id) DO UPDATE SET reaction=$3, created_at=NOW()
      RETURNING *`,
    [req.user.id, newsId, reaction]
  );
  res.json(rows[0]);
}

module.exports = { listNews, createNews, reactNews };
