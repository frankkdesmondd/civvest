// hooks/useSEO.ts
import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function useSEO({
  title,
  description = 'Invest in renewable energy projects with Civvest. Join us in building a sustainable future through oil energy investments.',
  keywords = 'energy investment, renewable energy, oil energy, sustainable investing, green energy, Civvest, energy partners',
  image = '/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : 'https://www.civvest.com',
  type = 'website',
  author = 'Civvest Energy Partners',
  publishedTime,
  modifiedTime
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes('Civvest') ? title : `${title} | Civvest Energy Partners`;
    
    // Update document title
    document.title = fullTitle;
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    updateMetaTag('robots', 'index, follow');
    
    // Open Graph meta tags
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'Civvest Energy Partners', 'property');
    
    // Twitter meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Article-specific meta tags
    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, 'property');
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, 'property');
      }
      updateMetaTag('article:author', author, 'property');
    }
    
    // Canonical URL
    updateCanonicalUrl(url);
    
    // Add structured data
    addStructuredData({
      fullTitle,
      description,
      image,
      url,
      type,
      author,
      publishedTime,
      modifiedTime
    });
    
    // Cleanup function
    return () => {
      // Remove structured data script
      const existingScript = document.getElementById('structured-data-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime]);
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}

function updateCanonicalUrl(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  
  link.href = url;
}

function addStructuredData(data: any) {
  // Remove existing structured data script
  const existingScript = document.getElementById('structured-data-script');
  if (existingScript) {
    existingScript.remove();
  }
  
  const script = document.createElement('script');
  script.id = 'structured-data-script';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": data.type === 'article' ? "NewsArticle" : "WebPage",
    "headline": data.fullTitle,
    "description": data.description,
    "image": data.image,
    "url": data.url,
    "author": {
      "@type": "Organization",
      "name": data.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Civvest Energy Partners",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.civvest.com/logo.png"
      }
    },
    "datePublished": data.publishedTime,
    "dateModified": data.modifiedTime
  });
  
  document.head.appendChild(script);
}