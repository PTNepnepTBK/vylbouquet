const { Sequelize } = require("sequelize");

// Get DATABASE_URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables. Please add it to .env.local');
}

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
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
    console.error("   Check your DATABASE_URL in .env.local");
    console.error("   Get connection string from: Supabase Dashboard > Settings > Database");
  }
};

testConnection();

module.exports = sequelize;
