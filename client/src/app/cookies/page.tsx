"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 text-[#4464AD] hover:bg-[#4464AD]/10"
          asChild
        >
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Card className="bg-white border border-[#E0E0E0] shadow-sm p-8 rounded-lg">
          <div className="flex items-center mb-6">
            <Cookie className="h-8 w-8 text-[#4F8A8B] mr-3" />
            <h1 className="text-3xl font-bold text-[#2D3142]">Cookies Policy</h1>
          </div>

          <div className="prose max-w-none text-[#424242]">
            <p className="text-lg mb-6">
              This page explains how NeuroFeel uses cookies and similar technologies to provide, improve, and protect our services.
            </p>

            <h2 className="text-xl font-semibold text-[#2D3142] mt-8 mb-4">What are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your browser or device when you visit our website. They allow us to remember your preferences, analyze how our website is used, and improve your experience.
            </p>

            <h2 className="text-xl font-semibold text-[#2D3142] mt-8 mb-4">Types of Cookies We Use</h2>
            <ul className="space-y-4">
              <li>
                <span className="font-medium text-[#4464AD]">Essential Cookies:</span> These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.
              </li>
              <li>
                <span className="font-medium text-[#4F8A8B]">Preference Cookies:</span> These cookies remember your choices and preferences to provide enhanced, personalized features.
              </li>
              <li>
                <span className="font-medium text-[#7BE495]">Analytics Cookies:</span> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2D3142] mt-8 mb-4">Managing Your Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may impact your overall user experience. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit{" "}
              <a 
                href="https://www.allaboutcookies.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#4464AD] hover:underline"
              >
                www.allaboutcookies.org
              </a>.
            </p>

            <h2 className="text-xl font-semibold text-[#2D3142] mt-8 mb-4">Changes to this Cookies Policy</h2>
            <p>
              We may update our Cookies Policy from time to time. We will notify you of any changes by posting the new Cookies Policy on this page.
            </p>

            <h2 className="text-xl font-semibold text-[#2D3142] mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about our Cookies Policy, please contact us at:{" "}
              <a 
                href="mailto:privacy@neurofeel.org" 
                className="text-[#4464AD] hover:underline"
              >
                privacy@neurofeel.org
              </a>
            </p>

            <div className="mt-10 pt-6 border-t border-[#E0E0E0] text-sm text-[#424242]">
              <p>Last updated: March 31, 2025</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}