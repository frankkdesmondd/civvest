// hooks/usePageTitle.ts
import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const fullTitle = title.includes('Civvest') ? title : `${title} | Civvest Energy Partners`;
    document.title = fullTitle;
    
    // Also update meta description for simple pages
    updateMetaTag('description', `${title} - Civvest Energy Partners provides sustainable oil investment opportunities.`);
    updateMetaTag('keywords', `${title}, energy investment, renewable energy, Civvest`);
  }, [title]);
}

function updateMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}
