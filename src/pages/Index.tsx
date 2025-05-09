
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AcademicContent from '../components/AcademicContent';
import StudentTools from '../components/StudentTools';
import Footer from '../components/Footer';
import PageFadeSection from '../components/PageFadeSection';
import { ThemeProvider } from '../hooks/useTheme';
import { AcademicProvider } from '../context/AcademicContext';

const Index = () => {
  return (
    <ThemeProvider>
      <AcademicProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          {/* Hero section with a subtle fade-in animation */}
          <PageFadeSection animationType="fade-in" threshold={0.05}>
            <Hero />
          </PageFadeSection>
          
          {/* Student Tools section with bottom-to-top fade animation */}
          <PageFadeSection 
            animationType="fade-up" 
            threshold={0.15}
          >
            <StudentTools />
          </PageFadeSection>
          
          {/* Academic Content section with bottom-to-top fade animation */}
          <PageFadeSection 
            animationType="fade-up" 
            threshold={0.15}
          >
            <AcademicContent />
          </PageFadeSection>
          
          {/* Footer with a slight delay */}
          <PageFadeSection 
            animationType="fade-up" 
            threshold={0.1}
            delay={100}
          >
            <Footer />
          </PageFadeSection>
        </div>
      </AcademicProvider>
    </ThemeProvider>
  );
};

export default Index;
