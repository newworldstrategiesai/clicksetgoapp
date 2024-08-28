// components/ui/PrivacyPolicy/PrivacyPolicy.tsx
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-6 shadow-md rounded-md w-full max-w-md">
        <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-4 text-sm text-gray-700">
          This Privacy Policy explains how we collect, use, and safeguard your information.
        </p>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">1. Information We Collect</h2>
        <p className="mt-2 text-sm text-gray-700">
          We collect information you provide to us, including personal data like your name and email address.
        </p>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">2. How We Use Your Information</h2>
        <p className="mt-2 text-sm text-gray-700">
          We use your information to operate and improve our services and to communicate with you.
        </p>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">3. Information Sharing</h2>
        <p className="mt-2 text-sm text-gray-700">
          We do not sell your information to third parties. We may share your information with service providers who assist us in delivering our services.
        </p>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">4. Your Choices</h2>
        <p className="mt-2 text-sm text-gray-700">
          You can access, update, or delete your information by contacting us directly.
        </p>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">5. Contact Us</h2>
        <p className="mt-2 text-sm text-gray-700">
          If you have any questions about this Privacy Policy, please contact us at [Your Contact Information].
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
