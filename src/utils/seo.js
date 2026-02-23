import { SEO } from '../constants/seo';

const setMeta = (selector, value, attr = 'content') => {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute(attr, value);
  }
};

export const applySeo = (overrides = {}) => {
  const seo = { ...SEO, ...overrides };

  if (seo.title) {
    document.title = seo.title;
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[name="twitter:title"]', seo.title);
  }

  if (seo.description) {
    setMeta('meta[name="description"]', seo.description);
  }

  if (seo.ogDescription) {
    setMeta('meta[property="og:description"]', seo.ogDescription);
    setMeta('meta[name="twitter:description"]', seo.ogDescription);
  }

  if (seo.canonicalUrl) {
    setMeta('link[rel="canonical"]', seo.canonicalUrl, 'href');
    setMeta('meta[property="og:url"]', seo.canonicalUrl);
  }

  if (seo.siteName) {
    setMeta('meta[property="og:site_name"]', seo.siteName);
  }

  if (seo.type) {
    setMeta('meta[property="og:type"]', seo.type);
  }

  if (seo.image) {
    setMeta('meta[property="og:image"]', seo.image);
    setMeta('meta[name="twitter:image"]', seo.image);
  }

  if (seo.twitterCard) {
    setMeta('meta[name="twitter:card"]', seo.twitterCard);
  }
};
