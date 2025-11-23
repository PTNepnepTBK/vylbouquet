/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "jqwvwrkxzimqcatvcjko.supabase.co"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude database packages from webpack bundling
      config.externals.push({
        sequelize: "commonjs sequelize",
        pg: "commonjs pg",
        "pg-hstore": "commonjs pg-hstore",
      });
    }
    return config;
  },
};

module.exports = nextConfig;
