import Navbar from '../components/Navbar';
import AcademicContent from '../components/AcademicContent';
import Footer from '../components/Footer';
import PageFadeSection from '../components/PageFadeSection';
import { ThemeProvider } from '../hooks/useTheme';

const Resources = () => {
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
          delay={100}
        >
          <Footer />
        </PageFadeSection>
      </div>
    </ThemeProvider>
  );
};

export default Resources;