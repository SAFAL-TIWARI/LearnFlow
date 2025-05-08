
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AcademicContent from '../components/AcademicContent';
import StudentTools from '../components/StudentTools';
import Footer from '../components/Footer';
import { ThemeProvider } from '../hooks/useTheme';
import { AcademicProvider } from '../context/AcademicContext';

const Index = () => {
  return (
    <ThemeProvider>
      <AcademicProvider>
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
