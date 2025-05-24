import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/legal-pages.css';
import BackButton from '../components/BackButton';

const TermsOfService: React.FC = () => {
  useEffect(() => {
    // Set document title
    document.title = 'Terms of Service - LearnFlow';
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <BackButton className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        </div>
        <div className="prose dark:prose-invert max-w-none legal-content">
          <h1>Terms and Conditions</h1>
          <p>Last updated: May 04, 2025</p>
          <p>Please read these terms and conditions carefully before using Our Service.</p>

          <h2>Interpretation and Definitions</h2>
          <h3>Interpretation</h3>
          <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

          <h3>Definitions</h3>
          <p>For the purposes of these Terms and Conditions:</p>
          <ul>
            <li><p><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p></li>
            <li><p><strong>Country</strong> refers to: Madhya Pradesh, India</p></li>
            <li><p><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to LearnFlow.</p></li>
            <li><p><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p></li>
            <li><p><strong>Service</strong> refers to the Website.</p></li>
            <li><p><strong>Terms and Conditions</strong> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.</p></li>
            <li><p><strong>Third-party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.</p></li>
            <li><p><strong>Website</strong> refers to LearnFlow, accessible from <a href="https://learn-flow-seven.vercel.app/" rel="external nofollow noopener" target="_blank">https://learn-flow-seven.vercel.app/</a></p></li>
            <li><p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p></li>
          </ul>

          <h2>Acknowledgment</h2>
          <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
          <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
          <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
          <p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>

          <h2>Links to Other Websites</h2>
          <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.</p>
          <p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
          <ul>
            <li><p>By email: safaltiwari602@gmail.com</p></li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;