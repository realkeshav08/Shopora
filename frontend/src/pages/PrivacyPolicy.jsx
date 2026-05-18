import React from 'react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';

const sections = [
  {
    heading: '1. Information We Collect',
    body: 'We collect information you provide directly to us — such as your name, email address, shipping address, and payment details — when you create an account, place an order, or contact us. We also automatically collect certain technical data, including your device type, browser, and pages viewed, to improve your shopping experience.',
  },
  {
    heading: '2. How We Use Your Information',
    body: 'Your information is used to process and deliver orders, manage your account, personalise product recommendations, respond to support requests, and send you order updates. With your consent, we may also send you promotional offers and newsletters.',
  },
  {
    heading: '3. Sharing of Information',
    body: 'We do not sell your personal information. We share it only with trusted partners who help us operate Shopora — such as payment processors (Stripe, Razorpay), delivery providers, and cloud hosting services — and only to the extent needed to provide our services or comply with the law.',
  },
  {
    heading: '4. Cookies & Tracking',
    body: 'Shopora uses cookies and similar technologies to keep you signed in, remember your cart, and understand how the site is used. You can disable cookies in your browser settings, though some features of the site may not function correctly.',
  },
  {
    heading: '5. Data Security',
    body: 'We use industry-standard safeguards, including encrypted connections and secure authentication, to protect your data. While no method of transmission over the internet is completely secure, we work continuously to keep your information safe.',
  },
  {
    heading: '6. Your Rights',
    body: 'You may access, update, or delete your personal information at any time from your profile page, or by contacting us. You may also opt out of marketing communications using the unsubscribe link in any promotional email.',
  },
  {
    heading: '7. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review it periodically.',
  },
  {
    heading: '8. Contact Us',
    body: 'If you have any questions about this Privacy Policy or how your data is handled, please reach out to us at ',
    email: 'shopora@keshavkashyap.me',
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  // navigate(-1) replays a browser "back" — a POP navigation — so the page
  // you came from is restored to the exact scroll position you left it at.
  const goBack = () => navigate(-1);

  return (
    <div className='border-t pt-10'>
      <button
        onClick={goBack}
        className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors mb-6'
      >
        <span className='text-lg leading-none'>←</span> Back
      </button>

      <div className='text-center text-2xl'>
        <Title text1={'PRIVACY'} text2={'POLICY'} />
      </div>

      <p className='text-center text-sm text-gray-400 -mt-2 mb-10'>
        Last updated: 18 May 2026
      </p>

      <div className='max-w-3xl mx-auto flex flex-col gap-8 pb-16'>
        <p className='text-gray-500 leading-relaxed'>
          At Shopora, your privacy matters to us. This policy explains what
          information we collect, how we use it, and the choices you have. By
          using our website, you agree to the practices described below.
        </p>

        {sections.map((section, index) => (
          <div key={index}>
            <h2 className='text-lg font-semibold text-gray-800 mb-2'>
              {section.heading}
            </h2>
            <p className='text-gray-500 leading-relaxed'>
              {section.body}
              {section.email && (
                <>
                  <a
                    href='mailto:asuskeshavkashyap@gmail.com'
                    className='text-primary hover:underline'
                  >
                    {section.email}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        ))}

        <button
          onClick={goBack}
          className='self-center mt-4 px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all duration-300'
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
