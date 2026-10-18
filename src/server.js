// require('dotenv').config();

// const app = require('./app');
// const pool = require('./config/db');

// const PORT = process.env.PORT || 3000;

// async function startServer() {
//   try {
//     await pool.query('SELECT NOW()');
//     console.log('PostgreSQL connected successfully');

//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error('Database connection failed:', error.message);
//   }
// }

// startServer();