// D:\Project\NeuroFeel\client\src\app\publications\page.tsx
"use client";

import { useState } from "react";
import { 
  FileText, 
  BookOpen, 
  ArrowRight, 
  Mail, 
  ExternalLink, 
  AlertCircle 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function PublicationsPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the subscription
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-[#F5F5F5] rounded-full mb-4">
            <BookOpen className="h-6 w-6 text-[#4464AD]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D3142] mb-4">
            Research Publications
          </h1>
          <p className="text-lg text-[#424242] max-w-2xl mx-auto">
            Advancing emotion recognition through cross-dataset analysis and domain adaptation
          </p>
        </div>

        {/* Forthcoming Publications Section */}
        <Card className="bg-white border border-[#E0E0E0] shadow-sm mb-12">
          <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-[#2D3142]">Forthcoming Publications</CardTitle>
                <CardDescription className="text-[#424242]">
                  Our research findings will be published soon
                </CardDescription>
              </div>
              <Badge className="bg-[#4F8A8B]/20 text-[#4F8A8B] border-[#4F8A8B]/30">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert className="bg-[#B8B8FF]/10 border-[#4464AD]/20 text-[#2D3142] mb-6">
              <AlertCircle className="h-4 w-4 text-[#4464AD]" />
              <AlertTitle className="text-[#2D3142] font-medium">Research in Progress</AlertTitle>
              <AlertDescription className="text-[#424242]">
                Our team is currently finalizing research papers on cross-dataset emotion recognition. 
                Check back soon for our publications or subscribe to receive updates.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-dashed border-[#E0E0E0] bg-[#F5F5F5]/50">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#4464AD]/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-[#4464AD]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#2D3142] mb-2">
                    Cross-Dataset Emotion Recognition
                  </h3>
                  <p className="text-[#424242] text-sm">
                    Novel approaches for bridging laboratory and real-world physiological datasets
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="bg-[#F5F5F5] text-[#424242] border-[#E0E0E0]">
                      WESAD
                    </Badge>
                    <Badge variant="outline" className="bg-[#F5F5F5] text-[#424242] border-[#E0E0E0]">
                      K-EmoCon
                    </Badge>
                    <Badge variant="outline" className="bg-[#F5F5F5] text-[#424242] border-[#E0E0E0]">
                      Domain Adaptation
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-dashed border-[#E0E0E0] bg-[#F5F5F5]/50">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#4F8A8B]/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-[#4F8A8B]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#2D3142] mb-2">
                    Adaptive Personalization for Emotion Recognition
                  </h3>
                  <p className="text-[#424242] text-sm">
                    Confidence-based selection techniques for improved accuracy with minimal calibration
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="bg-[#F5F5F5] text-[#424242] border-[#E0E0E0]">
                      Personalization
                    </Badge>
                    <Badge variant="outline" className="bg-[#F5F5F5] text-[#424242] border-[#E0E0E0]">
                      Adaptive Models
                    </Badge>
                    <Badge variant="outline" className="bg-[#F5F5F5] text-[#424242] border-[#E0E0E0]">
                      Calibration
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe for Updates */}
        <Card className="border border-[#E0E0E0] bg-gradient-to-br from-[#F5F5F5] to-[#B8B8FF]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3142]">Stay Updated</CardTitle>
            <CardDescription className="text-[#424242]">
              Subscribe to receive notifications about our upcoming publications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <Alert className="bg-[#7BE495]/10 border-[#7BE495]/30 text-[#2D3142]">
                <AlertCircle className="h-4 w-4 text-[#7BE495]" />
                <AlertTitle className="text-[#2D3142] font-medium">Thank you for subscribing!</AlertTitle>
                <AlertDescription className="text-[#424242]">
                  We&apos;ll notify you when new publications are available.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full h-10 border-[#E0E0E0]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="bg-[#4464AD] hover:bg-[#2D3142] transition-colors">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="border-t border-[#E0E0E0] bg-[#F5F5F5] text-sm text-[#424242] flex justify-between items-center">
            <span>We respect your privacy and will never share your email.</span>
            <a 
              href="/privacy" 
              className="inline-flex items-center text-[#4464AD] hover:underline"
            >
              Privacy Policy
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </CardFooter>
        </Card>

        {/* Contact for Collaboration */}
        <div className="mt-12 text-center">
          <p className="text-[#424242] mb-4">
            Interested in research collaboration? Contact our research team:
          </p>
          <Button variant="outline" className="border-[#4F8A8B] text-[#4F8A8B] hover:bg-[#4F8A8B]/10">
            <Mail className="mr-2 h-4 w-4" />
            research@neurofeel.org
          </Button>
        </div>
      </div>
    </div>
  );
}