"use client";

import { Card } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#2D3142] mb-6">Terms of Service</h1>
      <Card className="p-6 shadow-sm border border-[#E0E0E0]">
        <div className="prose max-w-none text-[#424242]">
          <p className="text-sm text-[#4F8A8B] mb-4">Last Updated: March 31, 2025</p>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NeuroFeel&apos;s services, website, or platforms, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">2. Description of Services</h2>
            <p>
              NeuroFeel provides a cross-dataset emotion recognition platform that processes physiological data to recognize emotional states. Our services may include data visualization, emotion recognition, and research tools.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">3. User Accounts</h2>
            <p>
              You may be required to create an account to access certain features of our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">4. Data Usage and Privacy</h2>
            <p>
              Our collection and use of personal and physiological data is governed by our Privacy Policy. By using our services, you consent to the collection and processing of your data as described in the Privacy Policy.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">5. User Responsibilities</h2>
            <p>
              When using our services, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload or transmit harmful content or malware</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use our services in any manner that could damage or overburden our infrastructure</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">6. Intellectual Property</h2>
            <p>
              All content, features, and functionality of our services, including but not limited to text, graphics, logos, algorithms, and software, are owned by NeuroFeel and are protected by intellectual property laws.
            </p>
            <p className="mt-2">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit our content without explicit permission.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">7. Research Use</h2>
            <p>
              If you use our platform for research purposes, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Comply with all applicable research ethics guidelines</li>
              <li>Properly cite NeuroFeel in any resulting publications</li>
              <li>Notify us of any significant findings that may affect the safety or efficacy of our technology</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">8. Limitation of Liability</h2>
            <p>
              NeuroFeel is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of our services, including but not limited to direct, indirect, incidental, consequential, or punitive damages.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">10. Changes to Terms</h2>
            <p>
              We may modify these Terms of Service at any time. We will notify users of any significant changes. Your continued use of our services after such modifications constitutes your acceptance of the updated terms.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">11. Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of [Your Jurisdiction], without regard to its conflict of law principles.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#2D3142] mb-3">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:terms@neurofeel.org" className="text-[#4464AD] hover:underline">terms@neurofeel.org</a>
            </p>
          </section>

          <div className="text-sm text-[#424242] mt-8 pt-4 border-t border-[#E0E0E0]">
            <p>
              By using NeuroFeel&apos;s services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}