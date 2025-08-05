import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'vi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the requestLocale promise 
  let locale = await requestLocale;
  
  // Ensure the locale is valid; otherwise, use the default locale
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});