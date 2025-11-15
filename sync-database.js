// Script untuk sinkronisasi database (buat tabel-tabel)
const { syncDatabase } = require("./src/models/index.js");

async function sync() {
  try {
    console.log("🔄 Syncing database...");
    await syncDatabase();
    console.log("✅ Database synced successfully!");
    console.log("\nTabel yang dibuat:");
    console.log("  - admins");
    console.log("  - bouquets");
    console.log("  - orders");
    console.log("  - order_images");
    console.log("  - order_logs");
    console.log("  - settings");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error syncing database:", error.message);
    process.exit(1);
  }
}

sync();
