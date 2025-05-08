import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'book';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: Record<string, any>;
  children?: React.ReactNode;
}

const SEO: React.FC<SEOProps> = ({
  title = 'LearnFlow | Student Productivity Tools & Academic Resources',
  description = 'Boost your academic performance with LearnFlow\'s student tools. Calculate CGPA, manage assignments, and access study resources all in one place.',
  keywords = 'student tools, CGPA calculator, academic resources, study planner, exam scheduler, note organizer, student productivity',
  canonicalUrl,
  ogImage = 'https://learn-flow-seven.vercel.app/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  children,
}) => {
  // Set document title as a fallback for non-Helmet environments
  useEffect(() => {
    document.title = title;
  }, [title]);

  // Prepare structured data
  const jsonLd = structuredData
    ? JSON.stringify(structuredData)
    : JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'LearnFlow',
        url: 'https://learn-flow-seven.vercel.app/',
        description: description,
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://learn-flow-seven.vercel.app/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      });

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || 'https://learn-flow-seven.vercel.app/'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">{jsonLd}</script>
      
      {/* Additional head elements */}
      {children}
    </Helmet>
  );
};

export default SEO;