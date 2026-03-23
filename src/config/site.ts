/** Site-wide configuration for the default author of system (file-based) posts */
export const siteConfig = {
  defaultAuthor: {
    name: process.env.NEXT_PUBLIC_SITE_AUTHOR_NAME || 'Admin',
    image: process.env.NEXT_PUBLIC_SITE_AUTHOR_IMAGE || undefined,
  } as { name: string; image?: string },
};
