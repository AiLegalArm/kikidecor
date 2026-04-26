import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, key, val] = selector.match(/\[(.+?)="(.+?)"\]/) || [];
    if (key && val) el.setAttribute(key, val);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

/**
 * Update document title and key meta tags per page.
 * Keep titles < 60 chars, descriptions < 160 chars.
 */
export const useSEO = ({ title, description, canonical, ogImage }: SEOOptions) => {
  useEffect(() => {
    if (title) {
      document.title = title.length > 60 ? title.slice(0, 57) + "…" : title;
      setMeta('meta[property="og:title"]', "content", title);
      setMeta('meta[name="twitter:title"]', "content", title);
    }
    if (description) {
      const desc = description.length > 160 ? description.slice(0, 157) + "…" : description;
      setMeta('meta[name="description"]', "content", desc);
      setMeta('meta[property="og:description"]', "content", desc);
      setMeta('meta[name="twitter:description"]', "content", desc);
    }
    if (canonical) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
      setMeta('meta[property="og:url"]', "content", canonical);
    }
    if (ogImage) {
      setMeta('meta[property="og:image"]', "content", ogImage);
      setMeta('meta[name="twitter:image"]', "content", ogImage);
    }
  }, [title, description, canonical, ogImage]);
};