// D:\Project\NeuroFeel\client\src\app\accessibility\page.tsx

import React from 'react';
import { Eye, EyeOff, Headphones, MousePointer, Type, Clock } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#2D3142] mb-8">Accessibility</h1>
      
      <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E0E0E0] mb-8">
        <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">Our Commitment</h2>
        <p className="text-[#424242] mb-6">
          NeuroFeel is committed to ensuring digital accessibility for people of all abilities. 
          We are continually improving the user experience for everyone and applying the relevant 
          accessibility standards.
        </p>
        
        <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">Accessibility Standards</h2>
        <p className="text-[#424242] mb-6">
          NeuroFeel aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 
          Level AA standards. These guidelines explain how to make web content more accessible 
          for people with disabilities.
        </p>
        
        <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">Accessible Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start p-4 bg-[#F5F5F5] rounded-lg">
            <div className="mt-1 mr-3">
              <Type className="h-5 w-5 text-[#4464AD]" />
            </div>
            <div>
              <h3 className="font-medium text-[#2D3142] mb-1">Text Readability</h3>
              <p className="text-sm text-[#424242]">
                Clear typography and color contrast for improved readability.
              </p>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-[#F5F5F5] rounded-lg">
            <div className="mt-1 mr-3">
              <MousePointer className="h-5 w-5 text-[#4F8A8B]" />
            </div>
            <div>
              <h3 className="font-medium text-[#2D3142] mb-1">Keyboard Navigation</h3>
              <p className="text-sm text-[#424242]">
                Fully navigable interface using keyboard controls.
              </p>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-[#F5F5F5] rounded-lg">
            <div className="mt-1 mr-3">
              <Headphones className="h-5 w-5 text-[#7BE495]" />
            </div>
            <div>
              <h3 className="font-medium text-[#2D3142] mb-1">Screen Reader Compatibility</h3>
              <p className="text-sm text-[#424242]">
                Semantic HTML and ARIA attributes for screen reader users.
              </p>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-[#F5F5F5] rounded-lg">
            <div className="mt-1 mr-3">
              <Clock className="h-5 w-5 text-[#B8B8FF]" />
            </div>
            <div>
              <h3 className="font-medium text-[#2D3142] mb-1">Time-Insensitive Interactions</h3>
              <p className="text-sm text-[#424242]">
                No time-limited functions that could disadvantage users.
              </p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">Compatibility Statement</h2>
        <p className="text-[#424242] mb-6">
          NeuroFeel is designed to be compatible with the following assistive technologies:
        </p>
        <ul className="list-disc pl-6 mb-6 text-[#424242]">
          <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
          <li>Screen magnification software</li>
          <li>Speech recognition software</li>
          <li>Keyboard-only navigation</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">Limitations</h2>
        <p className="text-[#424242] mb-6">
          While we strive to ensure the highest level of accessibility, some aspects of the 
          data visualization components may present challenges for users with certain visual 
          impairments. We are working to improve these areas and provide alternative means 
          of accessing the information.
        </p>
      </div>
      
      <div className="bg-[#4464AD]/10 rounded-xl p-6 border border-[#4464AD]/20">
        <h2 className="text-xl font-semibold text-[#2D3142] mb-4">Feedback</h2>
        <p className="text-[#424242] mb-4">
          We welcome your feedback on the accessibility of NeuroFeel. Please let us know if you 
          encounter accessibility barriers:
        </p>
        <div className="mb-4">
          <p className="text-[#424242]">
            <span className="font-medium">Email:</span> <a href="mailto:accessibility@neurofeel.org" className="text-[#4464AD] hover:underline">accessibility@neurofeel.org</a>
          </p>
        </div>
        <p className="text-[#424242] text-sm">
          We aim to respond to feedback within 2 business days.
        </p>
      </div>
    </div>
  );
}