
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesOverview from '../components/FeaturesOverview';
import AcademicResourcesPreview from '../components/AcademicResourcesPreview';
import StudentToolsShowcase from '../components/StudentToolsShowcase';
// import StatisticsSection from '../components/StatisticsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';
import PageFadeSection from '../components/PageFadeSection';
import LiveAnalyticsBadge from '../components/LiveAnalyticsBadge';
// import AnalyticsStatus from '../components/AnalyticsStatus';
import SEOStructuredData from '../components/SEOStructuredData';
import { ThemeProvider } from '../hooks/useTheme';

const Index = () => {
  return (
    <ThemeProvider>
      <SEOStructuredData page="home" />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Hero section with a subtle fade-in animation */}
        <PageFadeSection animationType="fade-in" threshold={0.05}>
          <Hero />
        </PageFadeSection>

        {/* Academic Resources Preview */}
        <PageFadeSection
          animationType="fade-up"
          threshold={0.15}
        >
          <AcademicResourcesPreview />
        </PageFadeSection>

        {/* Student Tools Showcase */}
        <PageFadeSection
          animationType="fade-up"
          threshold={0.15}
        >
          <StudentToolsShowcase />
        </PageFadeSection>

        {/* Features Overview Section */}
        <PageFadeSection
          animationType="fade-up"
          threshold={0.15}
        >
          <FeaturesOverview />
        </PageFadeSection>



        {/* Statistics Section
        <PageFadeSection
          animationType="fade-up"
          threshold={0.15}
        >
          <StatisticsSection />
        </PageFadeSection> */}

        {/* Testimonials Section */}
        <PageFadeSection
          animationType="fade-up"
          threshold={0.15}
        >
          <TestimonialsSection />
        </PageFadeSection>

        {/* Footer with a slight delay */}
        <PageFadeSection
          animationType="fade-up"
          threshold={0.1}
          delay={50}
        >
          <Footer />
        </PageFadeSection>

        {/* Live Analytics Badge */}
        <LiveAnalyticsBadge variant="compact" />
      </div>
    </ThemeProvider>
  );
};

export default Index;
