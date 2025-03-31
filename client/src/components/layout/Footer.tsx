import Link from 'next/link';
import Image from 'next/image';
import { Mail, Github, Twitter, ArrowRight, Heart, ChevronRight, LineChart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="w-full pt-16 pb-8 bg-gradient-to-br from-[#2D3142] via-[#2D3142] to-[#2D3142]/95 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#4F8A8B]/5 blur-3xl"></div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#4464AD]/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Newsletter section */}
        <div className="max-w-4xl mx-auto mb-16 bg-gradient-to-br from-[#2D3142]/80 to-[#4464AD]/20 rounded-xl p-8 backdrop-blur-sm border border-[#4F8A8B]/20 shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-white">Stay Updated with NeuroFeel</h3>
              <p className="text-[#E0E0E0] mb-0">Subscribe to our newsletter for the latest updates on emotion recognition research and framework developments.</p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border-[#4F8A8B]/30 text-white placeholder:text-[#E0E0E0]/60 h-10"
              />
              <Button className="bg-[#4F8A8B] hover:bg-[#4464AD] transition-colors h-10">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            {/* Replace DIV + Brain icon with logo image */}
            <div className="mb-4">
              <Link href="/">
                <Image 
                  src="/NeuroFeelLogoHorizontal.png" 
                  alt="NeuroFeel Logo" 
                  width={200} 
                  height={200} 
                  className="object-contain" 
                />
              </Link>
            </div>
            <p className="text-sm text-[#E0E0E0] mt-3 mb-4 max-w-xs">
              Revolutionizing emotion recognition through advanced domain adaptation and personalization techniques.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="bg-white/10 hover:bg-[#4F8A8B]/30 p-2 rounded-full transition-colors">
                <Twitter className="h-4 w-4 text-[#F5F5F5]" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-[#4F8A8B]/30 p-2 rounded-full transition-colors">
                <Github className="h-4 w-4 text-[#F5F5F5]" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-[#4F8A8B]/30 p-2 rounded-full transition-colors">
                <Mail className="h-4 w-4 text-[#F5F5F5]" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#B8B8FF] uppercase tracking-wider">Frameworks</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/wesad" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#4464AD] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>WESAD Personalization</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cross-dataset" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#4F8A8B] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Cross-Dataset Framework</span>
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#7BE495] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Interactive Demo</span>
                  </Link>
                </li>
                {/* <li>
                  <Link href="/visualization" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#4ADEDE] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Data Visualization</span>
                  </Link>
                </li> */}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#B8B8FF] uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/documentation" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#4464AD] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Documentation</span>
                  </Link>
                </li>
                {/* <li>
                  <Link href="/api" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#4F8A8B] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>API Reference</span>
                  </Link>
                </li> */}
                <li>
                  <Link href="https://github.com/HimashaHerath/NeuroFeel" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#7BE495] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>GitHub Repository</span>
                  </Link>
                </li>
                <li>
                  <Link href="/publications" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#4ADEDE] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Research Publications</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#B8B8FF] uppercase tracking-wider">About Us</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about-us" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#4464AD] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>About Me</span>
                  </Link>
                </li>
                {/* <li>
                  <Link href="/contact" className="text-sm text-[#E0E0E0] hover:text-white flex items-center group">
                    <ChevronRight className="h-3 w-3 text-[#4F8A8B] mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Contact Us</span>
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-[#4F8A8B]/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <p className="text-sm text-[#E0E0E0]/80">
                © 2025 NeuroFeel. All rights reserved.
              </p>
              <div className="flex items-center ml-3 text-[#B8B8FF]">
                <Heart className="h-3 w-3 mr-1" />
                <span className="text-xs">Made with emotion recognition</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <Link href="/privacy" className="text-sm text-[#E0E0E0]/80 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-[#E0E0E0]/80 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-[#E0E0E0]/80 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-sm text-[#E0E0E0]/80 hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-center text-[#E0E0E0]/60">
            NeuroFeel is a research project focusing on cross-dataset emotion recognition for physiological signals.
            <br />Not intended for medical use. For research and educational purposes only.
          </div>
        </div>
      </div>
    </footer>
  );
}