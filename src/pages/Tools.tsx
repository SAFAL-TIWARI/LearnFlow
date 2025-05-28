import React from 'react';
import Navbar from '../components/Navbar';
import StudentTools from '../components/StudentTools';
import Footer from '../components/Footer';
import PageFadeSection from '../components/PageFadeSection';
import { ThemeProvider } from '../hooks/useTheme';

const Tools = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        {/* Student Tools section with bottom-to-top fade animation */}
        <PageFadeSection 
          animationType="fade-up" 
          threshold={0.15}
        >
          <StudentTools />
        </PageFadeSection>
        
        {/* Footer with a slight delay */}
        <PageFadeSection 
          animationType="fade-up" 
          threshold={0.1}
          delay={50}
        >
          <Footer />
        </PageFadeSection>
      </div>
    </ThemeProvider>
  );
};

export default Tools;