const pool = require('../config/db');
const { sendMail } = require('../utils/mailer');

async function scanQr(req, res) {
  const { qrCode } = req.body;
  if (!qrCode) return res.status(400).json({ message: 'Código QR requerido' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO qr_scans (user_id, qr_code, progress_added) VALUES ($1,$2,$3)',
      [req.user.id, qrCode, 10]
    );
    const updated = await client.query(
      `UPDATE users
        SET progress_percent = LEAST(progress_percent + 10, 100), last_recycling_at=NOW()
        WHERE id=$1
        RETURNING id, name, email, progress_percent`,
      [req.user.id]
    );
    await client.query('COMMIT');

    const user = updated.rows[0];
    await sendMail({
      to: user.email,
      subject: 'Comprobante de avance Aetheris',
      text: `Tu QR fue registrado. Avance actual del bono: ${user.progress_percent}%.`
    });

    res.json({ message: 'QR registrado', progressPercent: user.progress_percent });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}

module.exports = { scanQr };
