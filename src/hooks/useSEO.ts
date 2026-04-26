import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
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
const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c2dfccf6-d201-46d8-91ed-d05bd5169984/id-preview-836d19e2--36bc272b-d68a-4ac6-90cb-a9045214e773.lovable.app-1772831868186.png";

export const useSEO = ({ title, description, canonical, ogImage, ogType, keywords }: SEOOptions) => {
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
    const img = ogImage || DEFAULT_OG_IMAGE;
    setMeta('meta[property="og:image"]', "content", img);
    setMeta('meta[name="twitter:image"]', "content", img);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[property="og:type"]', "content", ogType || "website");
    setMeta('meta[property="og:site_name"]', "content", "Ki Ki Decor");
    if (keywords) {
      setMeta('meta[name="keywords"]', "content", keywords);
    }
  }, [title, description, canonical, ogImage, ogType, keywords]);
};