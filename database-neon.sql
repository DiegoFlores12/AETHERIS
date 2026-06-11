-- =====================================================
-- AETHERIS WEB - BASE DE DATOS NEON POSTGRESQL
-- Ejecutar en Neon SQL Editor si quieres reiniciar la BD.
-- =====================================================

DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS qr_scans CASCADE;
DROP TABLE IF EXISTS news_reactions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS questionnaires CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
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

CREATE TABLE questionnaires (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  family_members INTEGER DEFAULT 1,
  monthly_income INTEGER DEFAULT 0,
  disability_type VARCHAR(120),
  needs_description TEXT,
  social_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  event_date DATE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE news_reactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
  reaction VARCHAR(30) NOT NULL CHECK (reaction IN ('enojo','asombro','contento')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, news_id)
);

CREATE TABLE products (
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

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  product_id INTEGER REFERENCES products(id),
  status VARCHAR(40) DEFAULT 'pendiente',
  quantity INTEGER DEFAULT 1,
  total INTEGER DEFAULT 0,
  plastic_kg NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE qr_scans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  qr_code VARCHAR(80) NOT NULL,
  progress_added INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  plastic_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
