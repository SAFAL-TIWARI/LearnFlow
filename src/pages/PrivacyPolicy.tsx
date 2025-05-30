import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/legal-pages.css';
import BackButton from '../components/BackButton';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    // Set document title
    document.title = 'Privacy Policy - LearnFlow';
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <BackButton className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        </div>
        <div className="prose dark:prose-invert max-w-none legal-content">
          <h1>Privacy Policy</h1>
          <p>Last updated: May 04, 2025</p>
          <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
          <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>

          <h2>Interpretation and Definitions</h2>
          <h3>Interpretation</h3>
          <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

          <h3>Definitions</h3>
          <p>For the purposes of this Privacy Policy:</p>
          <ul>
            <li><p><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</p></li>
            <li><p><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p></li>
            <li><p><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to LearnFlow.</p></li>
            <li><p><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</p></li>
            <li><p><strong>Country</strong> refers to: Madhya Pradesh, India</p></li>
            <li><p><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p></li>
            <li><p><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</p></li>
            <li><p><strong>Service</strong> refers to the Website.</p></li>
            <li><p><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p></li>
            <li><p><strong>Third-party Social Media Service</strong> refers to any website or any social network website through which a User can log in or create an account to use the Service.</p></li>
            <li><p><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p></li>
            <li><p><strong>Website</strong> refers to LearnFlow, accessible from <a href="https://learn-flow-seven.vercel.app/" rel="external nofollow noopener" target="_blank">https://learn-flow-seven.vercel.app/</a></p></li>
            <li><p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p></li>
          </ul>

          <h2>Collecting and Using Your Personal Data</h2>
          <h3>Types of Data Collected</h3>
          <h4>Personal Data</h4>
          <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
          <ul>
            <li><p>Email address</p></li>
            <li><p>First name and last name</p></li>
            <li><p>Usage Data</p></li>
          </ul>

          <h4>Usage Data</h4>
          <p>Usage Data is collected automatically when using the Service.</p>
          <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, You can contact us:</p>
          <ul>
            <li><p>By email: safaltiwari602@gmail.com</p></li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;