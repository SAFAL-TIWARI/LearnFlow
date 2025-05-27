import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOStructuredDataProps {
  page?: 'home' | 'tools' | 'resources' | 'help';
}

const SEOStructuredData: React.FC<SEOStructuredDataProps> = ({ page = 'home' }) => {
  // Website/Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "LearnFlow",
    "alternateName": "LearnFlow Student Zone",
    "url": "https://learn-flow-seven.vercel.app",
    "logo": "https://learn-flow-seven.vercel.app/logo.png",
    "description": "Access academic resources, track your progress, and enhance your learning journey with our suite of student tools. Get Started Explore Tools. Student Tools.",
    "sameAs": [
      "https://www.instagram.com/learnflow",
      "https://www.linkedin.com/company/learnflow",
      "https://github.com/learnflow"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@learnflow.com"
    }
  };

  // FAQ Schema for People Also Ask
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is CGPA and how is it calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CGPA (Cumulative Grade Point Average) is the average of all your semester GPAs. It's calculated by taking the sum of all grade points earned divided by the total credit hours attempted. Most Indian universities use a 10-point scale where 10 is the highest grade. LearnFlow provides a free CGPA calculator to help students calculate their grades accurately."
        }
      },
      {
        "@type": "Question",
        "name": "What are the best study techniques for engineering students?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Effective study techniques for engineering include: 1) Pomodoro Technique for focused study sessions, 2) Active recall and spaced repetition, 3) Practice problems and past papers, 4) Group study for complex topics, 5) Creating visual aids like flowcharts and diagrams. LearnFlow offers study timers and note organizers to support these techniques."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I find quality academic resources for engineering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "LearnFlow provides comprehensive academic resources including lecture notes, previous year papers, reference books, and study materials organized by year, semester, and branch. All resources are curated and verified for quality, covering subjects like Computer Science, Mechanical, Electrical, and Civil Engineering."
        }
      },
      {
        "@type": "Question",
        "name": "How can I manage time effectively during exams?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Effective exam time management includes: 1) Creating a study schedule 2-3 weeks before exams, 2) Using time-blocking techniques, 3) Prioritizing subjects based on difficulty and weightage, 4) Taking regular breaks, 5) Using tools like exam schedulers and study timers available on LearnFlow."
        }
      },
      {
        "@type": "Question",
        "name": "What tools do engineering students need for academic success?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Essential tools for engineering students include: CGPA calculators, study timers, note organizers, exam schedulers, unit converters, and access to academic resources. LearnFlow provides all these tools for free, helping students streamline their studying and improve productivity."
        }
      }
    ]
  };

  // Website Search Action Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LearnFlow",
    "url": "https://learn-flow-seven.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://learn-flow-seven.vercel.app/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Software Application Schema for Tools
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LearnFlow Student Tools",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free online tools for engineering students including CGPA calculator, study timer, exam scheduler, note organizer, and academic resources.",
    "featureList": [
      "CGPA Calculator",
      "Study Timer & Pomodoro",
      "Exam Scheduler",
      "Note Organizer",
      "Unit Converter",
      "Academic Resources",
      "GPA to Percentage Converter"
    ]
  };

  return (
    <Helmet>
      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      {/* Website Schema */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      {/* Software Application Schema */}
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>

      {/* Enhanced Meta Tags */}
      <meta name="description" content="LearnFlow - Free academic tools and resources for engineering students. CGPA calculator, study timer, exam scheduler, notes organizer, and comprehensive study materials." />
      <meta name="keywords" content="CGPA calculator, engineering students, study tools, academic resources, exam scheduler, study timer, engineering notes, student tools, free calculator" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content="LearnFlow - Student Learning Portal" />
      <meta property="og:description" content="Access academic resources, track your progress, and enhance your learning journey with our suite of student tools." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://learn-flow-seven.vercel.app" />
      <meta property="og:image" content="https://learn-flow-seven.vercel.app/og-image.png" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="LearnFlow - Student Learning Portal" />
      <meta name="twitter:description" content="Free academic tools and resources for engineering students. CGPA calculator, study materials, and more." />
      <meta name="twitter:image" content="https://learn-flow-seven.vercel.app/twitter-image.png" />
    </Helmet>
  );
};

export default SEOStructuredData;
