import { useEffect } from "react";

interface MetaOptions {
  title?: string;
  description?: string;
}

function setMetaTag(name: string, content: string) {
  const existing =
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`);

  if (existing) {
    existing.setAttribute("content", content);
  } else {
    const meta = document.createElement("meta");
    // og: / twitter: 키는 property, 그 외는 name
    if (name.startsWith("og:") || name.startsWith("twitter:")) {
      meta.setAttribute("property", name);
    } else {
      meta.setAttribute("name", name);
    }
    meta.setAttribute("content", content);
    document.head.appendChild(meta);
  }
}

export function useMeta({ title, description }: MetaOptions) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMetaTag("og:title", title);
      setMetaTag("twitter:title", title);
    }

    if (description) {
      setMetaTag("description", description);
      setMetaTag("og:description", description);
      setMetaTag("twitter:description", description);
    }
  }, [title, description]);
}
