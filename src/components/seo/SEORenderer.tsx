import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { resolveMetadata, ResolvedMetadata, getSEOConfig } from "../../lib/firebase/seo";

// Global register to track script injection states and prevent duplicates
const scriptRegistry = new Set<string>();

export default function SEORenderer() {
  const { pathname } = useLocation();
  const [meta, setMeta] = useState<ResolvedMetadata | null>(null);
  const [verification, setVerification] = useState<{ google?: string; bing?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const activePathRef = useRef<string>("");

  useEffect(() => {
    activePathRef.current = pathname;
    
    const loadSEO = async () => {
      setLoading(true);
      try {
        const resolved = await resolveMetadata(pathname);
        const config = await getSEOConfig();
        // Ensure that if path changed during async load, we don't apply stale metadata
        if (activePathRef.current === pathname) {
          setMeta(resolved);
          setVerification(config.integrations?.verification || null);
        }
      } catch (e) {
        console.error("SEORenderer: Failed to resolve SEO metadata on path", pathname, e);
      } finally {
        setLoading(false);
      }
    };

    loadSEO();
  }, [pathname]);

  // Integration Script Manager - Runs once on mount / config load
  useEffect(() => {
    const initializeTrackingScripts = async () => {
      try {
        const config = await getSEOConfig();
        const tracking = config.integrations?.tracking;
        if (!tracking) return;

        // Google Tag Manager Head Script
        if (tracking.googleTagManager?.enabled && tracking.googleTagManager?.id) {
          const key = `gtm-${tracking.googleTagManager.id}`;
          if (!scriptRegistry.has(key)) {
            const script = document.createElement("script");
            script.id = key;
            script.innerHTML = `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${tracking.googleTagManager.id}');
            `;
            document.head.appendChild(script);
            scriptRegistry.add(key);

            // GTM NoScript Zone
            const noscriptKey = `gtm-noscript-${tracking.googleTagManager.id}`;
            if (!scriptRegistry.has(noscriptKey)) {
              const noscript = document.createElement("noscript");
              noscript.id = noscriptKey;
              noscript.innerHTML = `
                <iframe src="https://www.googletagmanager.com/ns.html?id=${tracking.googleTagManager.id}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
              `;
              document.body.insertBefore(noscript, document.body.firstChild);
              scriptRegistry.add(noscriptKey);
            }
          }
        }

        // Google Analytics Script
        if (tracking.googleAnalytics?.enabled && tracking.googleAnalytics?.id) {
          const keySrc = `ga-src-${tracking.googleAnalytics.id}`;
          const keyInit = `ga-init-${tracking.googleAnalytics.id}`;

          if (!scriptRegistry.has(keySrc)) {
            const scriptSrc = document.createElement("script");
            scriptSrc.id = keySrc;
            scriptSrc.async = true;
            scriptSrc.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.googleAnalytics.id}`;
            document.head.appendChild(scriptSrc);
            scriptRegistry.add(keySrc);
          }

          if (!scriptRegistry.has(keyInit)) {
            const scriptInit = document.createElement("script");
            scriptInit.id = keyInit;
            scriptInit.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${tracking.googleAnalytics.id}', { page_path: window.location.pathname });
            `;
            document.head.appendChild(scriptInit);
            scriptRegistry.add(keyInit);
          }
        }

        // Meta Pixel Code
        if (tracking.metaPixel?.enabled && tracking.metaPixel?.id) {
          const key = `meta-pixel-${tracking.metaPixel.id}`;
          if (!scriptRegistry.has(key)) {
            const script = document.createElement("script");
            script.id = key;
            script.innerHTML = `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${tracking.metaPixel.id}');
              fbq('track', 'PageView');
            `;
            document.head.appendChild(script);
            scriptRegistry.add(key);

            // NoScript image pixel
            const noscriptKey = `meta-pixel-noscript-${tracking.metaPixel.id}`;
            if (!scriptRegistry.has(noscriptKey)) {
              const noscript = document.createElement("noscript");
              noscript.id = noscriptKey;
              noscript.innerHTML = `
                <img height="1" width="1" style="display:none"
                src="https://www.facebook.com/tr?id=${tracking.metaPixel.id}&ev=PageView&noscript=1" />
              `;
              document.body.appendChild(noscript);
              scriptRegistry.add(noscriptKey);
            }
          }
        }

        // LinkedIn Insight Tag
        if (tracking.linkedinInsight?.enabled && tracking.linkedinInsight?.id) {
          const key = `linkedin-insight-${tracking.linkedinInsight.id}`;
          if (!scriptRegistry.has(key)) {
            const script = document.createElement("script");
            script.id = key;
            script.innerHTML = `
              _linkedin_partner_id = "${tracking.linkedinInsight.id}";
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              (function(b,r,a,i,n,g,l){b[a]=b[a]||r;b[a].l=1*new Date();
              g=r.createElement(i);g.async=true;g.src=n;
              l=r.getElementsByTagName(i)[0];l.parentNode.insertBefore(g,l);
              })(window,document,"script","https://snap.licdn.com/li.lms-analytics/insight.min.js");
            `;
            document.head.appendChild(script);
            scriptRegistry.add(key);
          }
        }

        // Custom script injections
        if (tracking.customScripts) {
          for (const scr of tracking.customScripts) {
            if (scr.enabled && scr.code) {
              const key = `custom-scr-${scr.id}`;
              if (!scriptRegistry.has(key)) {
                if (scr.placement === 'head') {
                  const script = document.createElement("script");
                  script.id = key;
                  script.innerHTML = scr.code.replace(/<script[^>]*>|<\/script>/gi, "");
                  document.head.appendChild(script);
                  scriptRegistry.add(key);
                } else if (scr.placement === 'body') {
                  const script = document.createElement("script");
                  script.id = key;
                  script.innerHTML = scr.code.replace(/<script[^>]*>|<\/script>/gi, "");
                  document.body.appendChild(script);
                  scriptRegistry.add(key);
                } else if (scr.placement === 'noscript') {
                  const noscript = document.createElement("noscript");
                  noscript.id = key;
                  noscript.innerHTML = scr.code.replace(/<noscript[^>]*>|<\/noscript>/gi, "");
                  document.body.appendChild(noscript);
                  scriptRegistry.add(key);
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("SEORenderer: Failed to initialize integration tracking scripts:", e);
      }
    };

    initializeTrackingScripts();
  }, []);

  // SPA Route view triggers (tells GA and Pixel about the pathname change)
  useEffect(() => {
    if (loading || !meta) return;

    // GA4 Page View trigger
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "page_view", {
        page_path: pathname,
        page_title: meta.title
      });
    }

    // Meta Pixel Page View trigger
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname, loading, meta]);

  if (!meta) return null;

  return (
    <Helmet>
      {/* Primary Page Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.canonical} />
      <meta name="robots" content={`${meta.robots.index ? "index" : "noindex"}, ${meta.robots.follow ? "follow" : "nofollow"}`} />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:title" content={meta.ogTitle} />
      <meta property="og:description" content={meta.ogDescription} />
      <meta property="og:image" content={meta.ogImage} />
      <meta property="og:url" content={meta.ogUrl} />
      <meta property="og:type" content={meta.ogType} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content={meta.twitterCard} />
      <meta name="twitter:title" content={meta.twitterTitle} />
      <meta name="twitter:description" content={meta.twitterDescription} />
      <meta name="twitter:image" content={meta.twitterImage} />

      {/* Search Console Verifications */}
      {verification?.google && <meta name="google-site-verification" content={verification.google} />}
      {verification?.bing && <meta name="msvalidate.01" content={verification.bing} />}

      {/* Favicons & Theme Settings */}
      <link rel="icon" type="image/x-icon" href={meta.faviconUrl} />
      <link rel="icon" type="image/png" sizes="16x16" href={meta.favicon16Url} />
      <link rel="icon" type="image/png" sizes="32x32" href={meta.favicon32Url} />
      <link rel="icon" type="image/png" sizes="192x192" href={meta.icon192Url} />
      <link rel="icon" type="image/png" sizes="512x512" href={meta.icon512Url} />
      <link rel="apple-touch-icon" sizes="180x180" href={meta.appleTouchIconUrl} />
      <meta name="theme-color" content={meta.themeColor} />

      {/* Structured Schema output */}
      <script type="application/ld+json">{meta.schemaJsonLd}</script>
    </Helmet>
  );
}
