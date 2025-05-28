import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AcademicContent from '../components/AcademicContent';
import Footer from '../components/Footer';
import PageFadeSection from '../components/PageFadeSection';
import { ThemeProvider } from '../hooks/useTheme';
import { useAcademic } from '../context/AcademicContext';

const Resources = () => {
  const [searchParams] = useSearchParams();
  const { setYear } = useAcademic();

  useEffect(() => {
    const yearParam = searchParams.get('year');
    if (yearParam) {
      const year = parseInt(yearParam, 10);
      if (year >= 1 && year <= 4) {
        setYear(year);
      }
    }
  }, [searchParams, setYear]);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />

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
          delay={50}
        >
          <Footer />
        </PageFadeSection>
      </div>
    </ThemeProvider>
  );
};

export default Resources;