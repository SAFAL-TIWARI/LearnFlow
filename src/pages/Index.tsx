
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AcademicContent from '../components/AcademicContent';
import StudentTools from '../components/StudentTools';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ThemeProvider } from '../hooks/useTheme';
import { AcademicProvider } from '../context/AcademicContext';

const Index = () => {
  // Define structured data for the homepage
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LearnFlow',
    url: 'https://learn-flow-seven.vercel.app/',
    description: 'Boost your academic performance with LearnFlow\'s student tools. Calculate CGPA, manage assignments, and access study resources all in one place.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://learn-flow-seven.vercel.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    author: {
      '@type': 'Person',
      name: 'SAFAL TIWARI',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LearnFlow',
      logo: {
        '@type': 'ImageObject',
        url: 'https://learn-flow-seven.vercel.app/logo.png'
      }
    }
  };

  return (
    <ThemeProvider>
      <AcademicProvider>
        <SEO 
          title="LearnFlow | Student Productivity Tools & Academic Resources"
          description="Boost your academic performance with LearnFlow's student tools. Calculate CGPA, manage assignments, and access study resources all in one place."
          canonicalUrl="https://learn-flow-seven.vercel.app/"
          structuredData={homeStructuredData}
        />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Hero />
          <StudentTools />
          <AcademicContent />
          <Footer />
        </div>
      </AcademicProvider>
    </ThemeProvider>
  );
};

export default Index;
