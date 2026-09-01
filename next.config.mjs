/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  serverExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
};

export default nextConfig;
