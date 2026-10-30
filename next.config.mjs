/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the founder's existing instructions stable when starting a preview.
  agentRules: false,
  // Allow only an explicitly selected development-preview hostname.
  allowedDevOrigins: process.env.MAYA_DEV_HOST ? [process.env.MAYA_DEV_HOST] : [],
};

export default nextConfig;
