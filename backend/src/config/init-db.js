require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function addColumnIfMissing(client, table, columnDefinition) {
  await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${columnDefinition};`);
}

async function init() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        rut VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(160) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'usuario_pedido',
        profile_completed BOOLEAN DEFAULT FALSE,
        is_beneficiary BOOLEAN DEFAULT FALSE,
        progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
        last_recycling_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS questionnaires (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        family_members INTEGER DEFAULT 1,
        monthly_income INTEGER DEFAULT 0,
        disability_type VARCHAR(120),
        needs_description TEXT,
        social_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(160) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        event_date DATE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS news_reactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
        reaction VARCHAR(30) NOT NULL CHECK (reaction IN ('enojo','asombro','contento')),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, news_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        category VARCHAR(80) NOT NULL,
        type VARCHAR(80) NOT NULL,
        material VARCHAR(120) NOT NULL,
        recycled_percent INTEGER DEFAULT 0,
        weight_grams INTEGER DEFAULT 0,
        price INTEGER NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        product_id INTEGER REFERENCES products(id),
        status VARCHAR(40) DEFAULT 'pendiente',
        quantity INTEGER DEFAULT 1,
        total INTEGER DEFAULT 0,
        plastic_kg NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await addColumnIfMissing(client, 'orders', 'quantity INTEGER DEFAULT 1');
    await addColumnIfMissing(client, 'orders', 'total INTEGER DEFAULT 0');
    await addColumnIfMissing(client, 'orders', 'plastic_kg NUMERIC(10,2) DEFAULT 0');

    await client.query(`
      CREATE TABLE IF NOT EXISTS qr_scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        qr_code VARCHAR(80) NOT NULL,
        progress_added INTEGER NOT NULL DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        amount INTEGER NOT NULL CHECK (amount > 0),
        plastic_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const adminPass = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (name, rut, email, password_hash, role, profile_completed)
      VALUES ('Administrador Aetheris', '11.111.111-1', 'admin@aetheris.cl', $1, 'admin', TRUE)
      ON CONFLICT (email) DO NOTHING;
    `, [adminPass]);

    const userPass = await bcrypt.hash('usuario123', 10);
    await client.query(`
      INSERT INTO users (name, rut, email, password_hash, role, profile_completed, progress_percent)
      VALUES ('Elena Torres', '22.222.222-2', 'elena@aetheris.cl', $1, 'usuario_voluntario', TRUE, 0)
      ON CONFLICT (email) DO NOTHING;
    `, [userPass]);

    await client.query(`
      INSERT INTO products (name, category, type, material, recycled_percent, weight_grams, price, stock, image_url)
      SELECT * FROM (VALUES
      ('Aeon Flex Leg', 'Human', 'Lower limb', 'Recycled PETG', 85, 1200, 89990, 12, 'img/protesis-pierna.jpg'),
      ('Nexus Grip Hand', 'Human', 'Upper limb', 'Recycled PETG', 60, 450, 74990, 8, 'img/protesis-mano.jpg'),
      ('Aetheris Bi-Leg', 'Human', 'Lower limb', 'Carbon Fiber Blend', 70, 1800, 129990, 4, 'img/protesis-piernas.jpg'),
      ('K9 Mobility Core', 'Pet', 'Mobility', 'Medical Grade TPU', 95, 800, 59990, 5, 'img/impacto.jpg')
      ) AS data(name, category, type, material, recycled_percent, weight_grams, price, stock, image_url)
      WHERE NOT EXISTS (SELECT 1 FROM products);
    `);

    await client.query(`
      INSERT INTO news (title, content, image_url, event_date)
      SELECT * FROM (VALUES
      ('Nueva campaña de reciclaje PET', 'Trae botellas limpias y ayuda a llenar tu avance del bono Canje Voluntario.', 'img/impacto.jpg', CURRENT_DATE),
      ('Jornada de evaluación clínica', 'Equipo clínico realizará mediciones para nuevos beneficiarios.', 'img/noticia-clinica.jpg', CURRENT_DATE + INTERVAL '7 day')
      ) AS data(title, content, image_url, event_date)
      WHERE NOT EXISTS (SELECT 1 FROM news);
    `);


    await client.query(`
      UPDATE products SET image_url='img/protesis-pierna.jpg' WHERE name='Aeon Flex Leg';
      UPDATE products SET image_url='img/protesis-mano.jpg' WHERE name='Nexus Grip Hand';
      UPDATE products SET image_url='img/impacto.jpg' WHERE name='K9 Mobility Core';
      UPDATE news SET image_url='img/impacto.jpg' WHERE title='Nueva campaña de reciclaje PET';
      UPDATE news SET image_url='img/noticia-clinica.jpg' WHERE title='Jornada de evaluación clínica';
    `);

    await client.query('COMMIT');
    console.log('Base de datos inicializada correctamente.');
    console.log('Admin: admin@aetheris.cl / admin123');
    console.log('Usuario: elena@aetheris.cl / usuario123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inicializando BD:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
