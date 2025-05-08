
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CGPACalculator = () => {
  const navigate = useNavigate();

  // Define structured data for the CGPA Calculator
  const cgpaCalculatorStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CGPA Calculator - LearnFlow',
    description: 'Calculate your Cumulative Grade Point Average (CGPA) easily with our free online calculator tool for students.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    url: 'https://learn-flow-seven.vercel.app/tools/cgpa-calculator'
  };

  return (
    <>
      <SEO 
        title="CGPA Calculator | LearnFlow Student Tools"
        description="Calculate your Cumulative Grade Point Average (CGPA) easily with our free online calculator tool for students."
        keywords="CGPA calculator, GPA calculator, grade point average, student tools, academic calculator"
        canonicalUrl="https://learn-flow-seven.vercel.app/tools/cgpa-calculator"
        structuredData={cgpaCalculatorStructuredData}
      />
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mr-4"
            aria-label="Back to Home"
          >
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">CGPA Calculator</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Calculate Your CGPA</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This tool helps you calculate your Cumulative Grade Point Average based on your semester grades.
          </p>
          
          {/* Calculator interface will be implemented here */}
          <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
            <p className="text-xl">CGPA Calculator coming soon</p>
            <p className="text-gray-500 mt-2">Full implementation in progress</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CGPACalculator;
