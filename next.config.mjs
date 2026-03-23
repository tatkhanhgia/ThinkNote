import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['isomorphic-dompurify', 'jsdom', '@vitalets/google-translate-api'],
  },
};

export default withNextIntl(nextConfig);