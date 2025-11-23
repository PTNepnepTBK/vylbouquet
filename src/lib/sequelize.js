const { Sequelize } = require("sequelize");

// Get DATABASE_URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  dialectOptions: {
    ssl: false, // Supabase pooler (port 6543) doesn't need SSL
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test koneksi
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully (Supabase PostgreSQL)");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error.message);
    console.error("   Check your DATABASE_URL environment variable");
    console.error("   Expected format: postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres");
  }
};

testConnection();

module.exports = sequelize;
