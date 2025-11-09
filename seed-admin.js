// Script untuk seed admin default
const http = require("http");

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/auth/seed-admin",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Response:", data);
    try {
      const json = JSON.parse(data);
      console.log("\n✅ Seeder Result:");
      console.log(JSON.stringify(json, null, 2));

      if (json.success) {
        console.log("\n🎉 Admin berhasil dibuat!");
        console.log("Username: admin");
        console.log("Password: admin123");
      }
    } catch (e) {
      console.log("Raw response:", data);
    }
    process.exit(0);
  });
});

req.on("error", (error) => {
  console.error("❌ Error:", error.message);
  console.error(
    "Pastikan server Next.js sudah berjalan di http://localhost:3000"
  );
  process.exit(1);
});

req.end();
