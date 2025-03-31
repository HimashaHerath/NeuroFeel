// D:\Project\NeuroFeel\client\src\app\privacy\page.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Database, HeartPulse, Brain, Lock } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#4464AD]/10 mb-4">
              <ShieldCheck className="h-6 w-6 text-[#4464AD]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2D3142] mb-2">
              Privacy Policy
            </h1>
            <p className="text-[#424242] max-w-2xl mx-auto">
              How we handle and protect your data in the NeuroFeel emotion
              recognition framework
            </p>
          </div>

          <Card className="bg-white border border-[#E0E0E0] shadow-sm p-6 md:p-8 mb-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-[#2D3142] mb-4 flex items-center">
                <Database className="mr-2 h-5 w-5 text-[#4464AD]" />
                Overview
              </h2>
              <p className="text-[#424242] mb-6">
                This Privacy Policy describes how NeuroFeel collects, uses, and
                shares personal and physiological data when you use our
                cross-dataset emotion recognition services. We are committed to
                protecting your privacy and handling your data with transparency
                and care.
              </p>

              <h2 className="text-2xl font-semibold text-[#2D3142] mb-4 flex items-center">
                <HeartPulse className="mr-2 h-5 w-5 text-[#4F8A8B]" />
                Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-[#2D3142] mb-2">
                Physiological Data
              </h3>
              <p className="text-[#424242] mb-4">
                With your explicit consent, we may collect physiological signals
                including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-[#424242]">
                <li>Heart rate and ECG measurements</li>
                <li>Electrodermal activity (EDA)</li>
                <li>Electromyography (EMG)</li>
                <li>Respiration patterns</li>
                <li>Body temperature</li>
              </ul>

              <h3 className="text-xl font-medium text-[#2D3142] mb-2">
                Personal Information
              </h3>
              <p className="text-[#424242] mb-4">
                We collect the following personal information:
              </p>
              <ul className="list-disc pl-6 mb-6 text-[#424242]">
                <li>Contact information (name, email)</li>
                <li>
                  Account credentials used to access the NeuroFeel platform
                </li>
                <li>
                  Demographic information for research purposes (with consent)
                </li>
              </ul>

              <h3 className="text-xl font-medium text-[#2D3142] mb-2">
                Usage Data
              </h3>
              <p className="text-[#424242] mb-4">
                We automatically collect certain information when you use our
                platform:
              </p>
              <ul className="list-disc pl-6 mb-6 text-[#424242]">
                <li>IP address and device information</li>
                <li>Browser type and settings</li>
                <li>Pages visited and features used</li>
                <li>Time spent on the platform</li>
              </ul>

              <Separator className="my-8 bg-[#E0E0E0]" />

              <h2 className="text-2xl font-semibold text-[#2D3142] mb-4 flex items-center">
                <Brain className="mr-2 h-5 w-5 text-[#7BE495]" />
                How We Use Your Information
              </h2>

              <p className="text-[#424242] mb-4">
                We use your information for the following purposes:
              </p>

              <div className="space-y-4 mb-6">
                <div className="rounded-lg bg-[#F5F5F5] p-4">
                  <h4 className="font-medium text-[#2D3142] mb-1">
                    Research and Development
                  </h4>
                  <p className="text-[#424242] text-sm">
                    Training and improving our emotion recognition algorithms,
                    conducting cross-dataset research, and developing new
                    features.
                  </p>
                </div>

                <div className="rounded-lg bg-[#F5F5F5] p-4">
                  <h4 className="font-medium text-[#2D3142] mb-1">
                    Service Operation
                  </h4>
                  <p className="text-[#424242] text-sm">
                    Providing, maintaining, and improving the NeuroFeel
                    platform, processing transactions, and sending service
                    updates.
                  </p>
                </div>

                <div className="rounded-lg bg-[#F5F5F5] p-4">
                  <h4 className="font-medium text-[#2D3142] mb-1">
                    Communication
                  </h4>
                  <p className="text-[#424242] text-sm">
                    Responding to your inquiries, providing technical support,
                    and sending information about our services.
                  </p>
                </div>
              </div>

              <Separator className="my-8 bg-[#E0E0E0]" />

              <h2 className="text-2xl font-semibold text-[#2D3142] mb-4 flex items-center">
                <Lock className="mr-2 h-5 w-5 text-[#B8B8FF]" />
                Data Security and Sharing
              </h2>

              <h3 className="text-xl font-medium text-[#2D3142] mb-2">
                How We Protect Your Data
              </h3>
              <p className="text-[#424242] mb-4">
                We implement appropriate technical and organizational measures to
                protect your information, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-[#424242]">
                <li>Encryption of sensitive data</li>
                <li>Secure access controls and authentication</li>
                <li>Regular security assessments</li>
                <li>Data minimization practices</li>
              </ul>

              <h3 className="text-xl font-medium text-[#2D3142] mb-2">
                Data Sharing
              </h3>
              <p className="text-[#424242] mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 mb-6 text-[#424242]">
                <li>
                  Research partners (anonymized data, with explicit consent)
                </li>
                <li>Service providers who help operate our platform</li>
                <li>
                  Legal authorities when required by law or to protect rights
                </li>
              </ul>

              <Separator className="my-8 bg-[#E0E0E0]" />

              <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">
                Your Rights
              </h2>
              <p className="text-[#424242] mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mb-6 text-[#424242]">
                <li>Access or download your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your data</li>
                <li>Restrict or object to certain processing activities</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <Separator className="my-8 bg-[#E0E0E0]" />

              <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">
                Dataset Usage and Research
              </h2>
              <p className="text-[#424242] mb-6">
                NeuroFeel uses anonymized datasets for emotion recognition
                research. When using our platform:
              </p>
              <ul className="list-disc pl-6 mb-6 text-[#424242]">
                <li>
                  All physiological data is anonymized before use in research
                </li>
                <li>
                  Our cross-dataset framework preserves privacy while enabling
                  advanced analysis
                </li>
                <li>
                  Research findings are presented in aggregate without
                  identifying individuals
                </li>
                <li>
                  You can opt-out of research participation while still using
                  the platform
                </li>
              </ul>

              <Separator className="my-8 bg-[#E0E0E0]" />

              <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">
                Contact Us
              </h2>
              <p className="text-[#424242] mb-4">
                If you have questions about this Privacy Policy or our data
                practices, please contact us at:
              </p>
              <div className="bg-[#F5F5F5] p-4 rounded-md mb-6">
                <p className="text-[#2D3142] mb-1 font-medium">
                  NeuroFeel Data Protection Team
                </p>
                <p className="text-[#424242]">Email: privacy@neurofeel.org</p>
              </div>

              <p className="text-sm text-[#424242] italic mt-8">
                Last updated: March 31, 2025. We may update this Privacy Policy
                from time to time to reflect changes in our practices or legal
                requirements.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}