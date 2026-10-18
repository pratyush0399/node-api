
const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Create table when the server starts
async function initializeDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price NUMERIC(10, 2) NOT NULL
    )
  `);
}

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Node.js SQL API is running" });
});

// CREATE
app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name?.trim() || price == null ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: "Valid name and price required" });
    }

    const result = await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
      [name.trim(), price]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database operation failed" });
  }
});

// READ ALL
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database operation failed" });
  }
});

// READ ONE
app.get("/products/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database operation failed" });
  }
});

// UPDATE
app.put("/products/:id", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name?.trim() || price == null ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: "Valid name and price required" });
    }

    const result = await pool.query(
      `UPDATE products SET name = $1, price = $2
       WHERE id = $3 RETURNING *`,
      [name.trim(), price, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database operation failed" });
  }
});

// DELETE
app.delete("/products/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted", product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Database operation failed" });
  }
});

const PORT = process.env.PORT || 3000;

initializeDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database initialization failed:", err.message);
    process.exit(1);
  });
