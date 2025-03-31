import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Brain,
  LineChart,
  Share2,
  GitCompare,
  Database,
  RefreshCw,
  BarChart2,
  Zap,
  Network,
  UserCheck,
  BookOpen,
  ExternalLink,
  Activity,
  PieChart,
  Layers,
  HeartPulse,
  ChevronRight,
  MenuSquare,
  GraduationCap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Enhanced with Biometric Spectrum theme */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-[#2D3142] via-[#4464AD] to-[#2D3142] text-white relative overflow-hidden">
        {/* Animated particles/dots background */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 animate-pulse"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-[#4F8A8B]/20 blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-[10%] w-64 h-64 rounded-full bg-[#4464AD]/20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-2/3 left-[30%] w-64 h-64 rounded-full bg-[#B8B8FF]/20 blur-3xl animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#4F8A8B]/30 bg-[#4F8A8B]/10 backdrop-blur-sm text-[#F5F5F5] text-sm mb-4">
              <HeartPulse className="h-4 w-4 mr-2" />
              <span>Next-Generation Emotion Recognition</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-white via-[#F5F5F5] to-[#B8B8FF] drop-shadow-sm">
                NeuroFeel
              </h1>
              <p className="text-xl md:text-2xl text-[#E0E0E0] max-w-[800px] mx-auto">
                Bridging laboratory precision with real-world emotion
                recognition through advanced domain adaptation
              </p>
            </div>

            <p className="max-w-[800px] text-[#E0E0E0] md:text-xl/relaxed">
              Our revolutionary framework brings together physiological sensing
              and machine learning to deliver consistent emotion recognition
              across different environments and datasets.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Button
                size="lg"
                className="bg-[#F5F5F5] text-[#2D3142] hover:bg-[#E0E0E0] transition-all shadow-lg"
                asChild
              >
                <Link href="/demo">
                  <span className="flex items-center">
                    Try Live Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white 
             hover:bg-white/10 backdrop-blur-sm 
             transition-colors duration-200 
             focus:ring-2 focus:ring-white/50"
                asChild
              >
                <Link href="/frameworks">
                  <span className="flex items-center">
                    Explore Frameworks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats badges with enhanced glass morphism effect */}
        <div className="hidden lg:block">
          <div className="absolute top-1/3 left-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-4 shadow-lg">
            <p className="text-sm font-medium text-[#E0E0E0]">
              Personalization Accuracy
            </p>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#B8B8FF]">
              88.16%
            </p>
          </div>
          <div className="absolute top-2/3 right-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-4 shadow-lg">
            <p className="text-sm font-medium text-[#E0E0E0]">
              Domain Gap Reduction
            </p>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#B8B8FF]">
              89%
            </p>
          </div>
        </div>
      </section>

      {/* Featured Frameworks Section - With Biometric Spectrum Theme */}
      <section className="w-full py-20 -mt-10 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-[#E0E0E0]">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#4464AD] to-[#2D3142] flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#2D3142]">
                WESAD Personalization
              </h3>
              <p className="text-[#424242] mb-6">
                Our personalized approach delivers exceptional accuracy through
                adaptive model selection, achieving 88.16% accuracy in discrete
                emotion recognition.
              </p>
              <div className="mb-6 bg-[#F5F5F5] p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#424242]">Accuracy</span>
                  <Badge className="bg-[#4464AD] text-white">88.16%</Badge>
                </div>
                <div className="w-full bg-[#E0E0E0] rounded-full h-2.5">
                  <div
                    className="bg-[#4464AD] h-2.5 rounded-full"
                    style={{ width: "88.16%" }}
                  ></div>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/wesad">
                  <span className="flex items-center justify-center">
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-[#E0E0E0]">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#4F8A8B] to-[#2D3142] flex items-center justify-center mb-6">
                <Share2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#2D3142]">
                Cross-Dataset Transfer
              </h3>
              <p className="text-[#424242] mb-6">
                Our pioneering framework bridges laboratory and real-world
                environments, achieving 80.27% valence recognition accuracy
                across different datasets.
              </p>
              <div className="mb-6 bg-[#F5F5F5] p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#424242]">
                    Domain Gap Reduction
                  </span>
                  <Badge className="bg-[#4F8A8B] text-white">89%</Badge>
                </div>
                <div className="w-full bg-[#E0E0E0] rounded-full h-2.5">
                  <div
                    className="bg-[#4F8A8B] h-2.5 rounded-full"
                    style={{ width: "89%" }}
                  ></div>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/cross-dataset">
                  <span className="flex items-center justify-center">
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section - With Biometric Spectrum Theme */}
      <section className="w-full py-16 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm border-[#B8B8FF] bg-[#F5F5F5]"
            >
              Our Approach
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#2D3142] max-w-[800px]">
              Revolutionizing Emotion Recognition Across Environments
            </h2>
            <p className="max-w-[800px] text-[#424242] md:text-lg/relaxed">
              NeuroFeel tackles the fundamental challenge of making emotion
              recognition systems work consistently across different
              environments and datasets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-[#4464AD] shadow-md hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="bg-[#F5F5F5] p-2 rounded-lg">
                    <Brain className="h-6 w-6 text-[#4464AD]" />
                  </div>
                  <CardTitle>Cross-Dataset Analysis</CardTitle>
                </div>
                <CardDescription>
                  Breaking free from single-dataset limitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#424242]">
                  Our framework systematically combines WESAD (lab-controlled)
                  and K-EmoCon (in-the-wild) datasets, enabling emotion
                  recognition across different data collection contexts.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-[#424242]">
                  <Database className="h-4 w-4 mr-1" />
                  <span>2 Datasets</span>
                </div>
                <div className="flex items-center text-sm text-[#424242]">
                  <UserCheck className="h-4 w-4 mr-1" />
                  <span>26 Subjects</span>
                </div>
              </CardFooter>
            </Card>

            <Card className="border-t-4 border-t-[#4F8A8B] shadow-md hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="bg-[#F5F5F5] p-2 rounded-lg">
                    <Share2 className="h-6 w-6 text-[#4F8A8B]" />
                  </div>
                  <CardTitle>Domain Adaptation</CardTitle>
                </div>
                <CardDescription>
                  Advanced techniques to bridge the domain gap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#424242]">
                  Our novel ensemble approach combines CORAL, subspace
                  alignment, and feature scaling to significantly reduce the
                  domain gap between laboratory and real-world settings.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-[#424242]">
                  <Network className="h-4 w-4 mr-1" />
                  <span>3 Techniques</span>
                </div>
                <div className="flex items-center text-sm text-[#424242]">
                  <LineChart className="h-4 w-4 mr-1" />
                  <span>89% Gap Reduction</span>
                </div>
              </CardFooter>
            </Card>

            <Card className="border-t-4 border-t-[#7BE495] shadow-md hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="bg-[#F5F5F5] p-2 rounded-lg">
                    <GitCompare className="h-6 w-6 text-[#7BE495]" />
                  </div>
                  <CardTitle>Bidirectional Evaluation</CardTitle>
                </div>
                <CardDescription>Train anywhere, test anywhere</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#424242]">
                  Our framework uniquely provides comprehensive bidirectional
                  evaluation, allowing models to be trained on one dataset and
                  tested on another in both directions.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-[#424242]">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span>Bi-directional</span>
                </div>
                <div className="flex items-center text-sm text-[#424242]">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  <span>Balanced Metrics</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Frameworks Section - With Biometric Spectrum Theme */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm border-[#4464AD] bg-[#F5F5F5]"
            >
              Our Frameworks
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#2D3142]">
              The Science Behind NeuroFeel
            </h2>
            <p className="max-w-[800px] text-[#424242] md:text-lg/relaxed">
              Two complementary frameworks that represent the future of emotion
              recognition technology
            </p>
          </div>

          <Tabs defaultValue="wesad" className="w-full max-w-5xl mx-auto">
            <TabsList className="w-full grid-cols-2 mb-8 rounded-lg">
              <TabsTrigger
                value="wesad"
                className="text-base py-4 data-[state=active]:bg-[#F5F5F5] data-[state=active]:text-[#4464AD] transition-all"
              >
                <div className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  <span>WESAD Personalization</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="cross-dataset"
                className="text-base py-4 data-[state=active]:bg-[#F5F5F5] data-[state=active]:text-[#4F8A8B] transition-all"
              >
                <div className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  <span>Cross-Dataset Framework</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wesad" className="p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-[#2D3142]">
                    WESAD Personalization
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start">
                      <div className="mt-1 bg-[#F5F5F5] p-2 rounded-full mr-4">
                        <Zap className="h-5 w-5 text-[#4464AD]" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">
                          Adaptive Model Selection
                        </p>
                        <p className="text-[#424242]">
                          Dynamically selects between base and personal models
                          based on confidence thresholds
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mt-1 bg-[#F5F5F5] p-2 rounded-full mr-4">
                        <Layers className="h-5 w-5 text-[#4464AD]" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">
                          Four-Model Architecture
                        </p>
                        <p className="text-[#424242]">
                          Base, Personal, Ensemble, and Adaptive models working
                          in harmony
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mt-1 bg-[#F5F5F5] p-2 rounded-full mr-4">
                        <UserCheck className="h-5 w-5 text-[#4464AD]" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">
                          Minimal Calibration
                        </p>
                        <p className="text-[#424242]">
                          Achieves high accuracy with very limited
                          personalization data
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#F5F5F5] p-5 rounded-xl mt-8 border border-[#E0E0E0]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[#424242] font-medium">
                          Model Accuracy Comparison
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Base Model</span>
                            <span className="font-medium">86.36%</span>
                          </div>
                          <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                            <div
                              className="bg-[#4464AD] h-2 rounded-full"
                              style={{ width: "86.36%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Personal Model</span>
                            <span className="font-medium">84.51%</span>
                          </div>
                          <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                            <div
                              className="bg-[#4464AD] h-2 rounded-full"
                              style={{ width: "84.51%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Ensemble Model</span>
                            <span className="font-medium">87.52%</span>
                          </div>
                          <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                            <div
                              className="bg-[#4464AD] h-2 rounded-full"
                              style={{ width: "87.52%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Adaptive Model</span>
                            <span className="font-medium text-[#4464AD]">
                              88.16%
                            </span>
                          </div>
                          <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                            <div
                              className="bg-[#4464AD] h-2 rounded-full"
                              style={{ width: "88.16%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button className="bg-[#4464AD] hover:bg-[#2D3142]" asChild>
                      <Link href="/wesad">
                        <span className="flex items-center justify-center">
                          Explore WESAD Framework
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#F5F5F5] to-[#B8B8FF]/30 p-8 rounded-xl shadow-lg">
                  <div className="relative aspect-[4/3] bg-white rounded-lg shadow-md p-6 flex flex-col justify-center">
                    <div className="absolute -top-4 -left-4 h-10 w-10 bg-[#4464AD] rounded-full flex items-center justify-center shadow-md">
                      <Brain className="h-5 w-5 text-white" />
                    </div>

                    <h4 className="text-lg font-medium mb-4 text-[#2D3142]">
                      Adaptive Selection Architecture
                    </h4>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="rounded-lg bg-[#F5F5F5] border border-[#E0E0E0] p-3 shadow-sm">
                        <div className="font-medium text-[#4464AD] mb-1 text-sm">
                          Base Model
                        </div>
                        <div className="text-xs text-[#424242]">
                          Universal patterns from all subjects
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#B8B8FF]/30 border border-[#B8B8FF]/50 p-3 shadow-sm">
                        <div className="font-medium text-[#4464AD] mb-1 text-sm">
                          Personal Model
                        </div>
                        <div className="text-xs text-[#424242]">
                          Tailored to individual
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#7BE495]/20 border border-[#7BE495]/30 p-3 shadow-sm mb-4">
                      <div className="font-medium text-[#4F8A8B] mb-1 text-sm">
                        Confidence Analyzer
                      </div>
                      <div className="text-xs text-[#424242]">
                        Dynamic selection based on prediction confidence
                      </div>
                    </div>

                    <svg
                      width="100%"
                      height="40"
                      viewBox="0 0 300 40"
                      className="mb-2"
                    >
                      <path
                        d="M150,0 L150,40"
                        stroke="#E0E0E0"
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                      <text
                        x="75"
                        y="25"
                        textAnchor="middle"
                        className="text-xs fill-[#424242]"
                      >
                        Low Confidence
                      </text>
                      <text
                        x="225"
                        y="25"
                        textAnchor="middle"
                        className="text-xs fill-[#424242]"
                      >
                        High Confidence
                      </text>
                    </svg>

                    <div className="rounded-lg bg-[#4464AD] p-3 text-center text-white shadow-md">
                      <div className="font-medium mb-1">
                        Adaptive Model (88.16%)
                      </div>
                      <div className="text-xs text-[#F5F5F5]">
                        Optimal performance across all subjects
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center text-sm text-[#424242]">
                    NeuroFeel's adaptive model selection visualized
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cross-dataset" className="p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-[#2D3142]">
                    Cross-Dataset Framework
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start">
                      <div className="mt-1 bg-[#F5F5F5] p-2 rounded-full mr-4">
                        <MenuSquare className="h-5 w-5 text-[#4F8A8B]" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">Feature Mapping</p>
                        <p className="text-[#424242]">
                          Identifies and maps common physiological features
                          between different datasets
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mt-1 bg-[#F5F5F5] p-2 rounded-full mr-4">
                        <Activity className="h-5 w-5 text-[#4F8A8B]" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">Domain Adaptation</p>
                        <p className="text-[#424242]">
                          Ensemble of CORAL, subspace alignment, and feature
                          scaling techniques
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mt-1 bg-[#F5F5F5] p-2 rounded-full mr-4">
                        <PieChart className="h-5 w-5 text-[#4F8A8B]" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">
                          Emotion Space Translation
                        </p>
                        <p className="text-[#424242]">
                          Bridges discrete and dimensional emotion
                          representations
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="bg-[#F5F5F5] p-5 rounded-xl border border-[#E0E0E0]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Badge className="bg-[#4ADEDE]/20 text-[#4ADEDE] border-[#4ADEDE]/50 mr-2">
                              Arousal
                            </Badge>
                          </div>
                          <Badge className="bg-[#4F8A8B]">63.14%</Badge>
                        </div>
                        <div className="w-full bg-[#E0E0E0] rounded-full h-2 mb-2">
                          <div
                            className="bg-[#4ADEDE] h-2 rounded-full"
                            style={{ width: "63.14%" }}
                          ></div>
                        </div>
                        <div className="text-xs text-[#424242] mt-2">
                          WESAD → K-EmoCon performance
                        </div>
                      </div>

                      <div className="bg-[#F5F5F5] p-5 rounded-xl border border-[#E0E0E0]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Badge className="bg-[#7BE495]/20 text-[#7BE495] border-[#7BE495]/50 mr-2">
                              Valence
                            </Badge>
                          </div>
                          <Badge className="bg-[#4F8A8B]">80.27%</Badge>
                        </div>
                        <div className="w-full bg-[#E0E0E0] rounded-full h-2 mb-2">
                          <div
                            className="bg-[#7BE495] h-2 rounded-full"
                            style={{ width: "80.27%" }}
                          ></div>
                        </div>
                        <div className="text-xs text-[#424242] mt-2">
                          WESAD → K-EmoCon performance
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button className="bg-[#4F8A8B] hover:bg-[#2D3142]" asChild>
                      <Link href="/cross-dataset">
                        <span className="flex items-center justify-center">
                          Explore Cross-Dataset Framework
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#F5F5F5] to-[#B8B8FF]/30 p-8 rounded-xl shadow-lg">
                  <div className="aspect-[4/3] bg-white rounded-lg shadow-md relative p-6 flex flex-col justify-center">
                    <div className="absolute -top-4 -right-4 h-10 w-10 bg-[#4F8A8B] rounded-full flex items-center justify-center shadow-md">
                      <Share2 className="h-5 w-5 text-white" />
                    </div>

                    <h4 className="text-lg font-medium mb-6 text-[#2D3142]">
                      Domain Adaptation Process
                    </h4>

                    <div className="relative h-[180px]">
                      {/* Lab Dataset */}
                      <div className="absolute left-0 top-0 w-[120px] h-[120px] bg-[#4ADEDE]/20 rounded-lg border border-[#4ADEDE]/30 shadow-sm flex flex-col items-center justify-center p-3">
                        <div className="text-sm font-medium text-[#4464AD] mb-1">
                          WESAD
                        </div>
                        <div className="text-xs text-center text-[#424242]">
                          Laboratory
                          <br />
                          Environment
                        </div>
                        <div className="mt-2 text-xs text-[#4464AD]">
                          15 subjects
                        </div>
                      </div>

                      {/* Real-world Dataset */}
                      <div className="absolute right-0 bottom-0 w-[120px] h-[120px] bg-[#B8B8FF]/20 rounded-lg border border-[#B8B8FF]/30 shadow-sm flex flex-col items-center justify-center p-3">
                        <div className="text-sm font-medium text-[#4F8A8B] mb-1">
                          K-EmoCon
                        </div>
                        <div className="text-xs text-center text-[#424242]">
                          Real-world
                          <br />
                          Environment
                        </div>
                        <div className="mt-2 text-xs text-[#4F8A8B]">
                          11 subjects
                        </div>
                      </div>

                      {/* Domain Adaptation */}
                      <div className="absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-[#7BE495]/10 rounded-full border-2 border-dashed border-[#7BE495]/30 flex items-center justify-center">
                        <div className="text-xs text-center text-[#4F8A8B] font-medium">
                          Domain
                          <br />
                          Adaptation
                        </div>
                      </div>

                      {/* Connection arrows */}
                      <svg
                        width="100%"
                        height="100%"
                        className="absolute top-0 left-0"
                        overflow="visible"
                      >
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="0"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              className="fill-[#4F8A8B]"
                            />
                          </marker>
                        </defs>
                        <path
                          d="M120,60 L150,90"
                          stroke="#4F8A8B"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                        <path
                          d="M150,90 L180,120"
                          stroke="#4F8A8B"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      </svg>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-xs text-[#424242]">
                        <div className="w-3 h-3 rounded-full bg-[#4464AD] mr-2"></div>
                        <span>Feature Mapping (9 common features)</span>
                      </div>
                      <div className="flex items-center text-xs text-[#424242]">
                        <div className="w-3 h-3 rounded-full bg-[#4F8A8B] mr-2"></div>
                        <span>CORAL + Subspace Alignment</span>
                      </div>
                      <div className="flex items-center text-xs text-[#424242]">
                        <div className="w-3 h-3 rounded-full bg-[#7BE495] mr-2"></div>
                        <span>89% Domain Gap Reduction</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center text-sm text-[#424242]">
                    NeuroFeel's cross-dataset domain adaptation visualized
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Research Results Section - With Biometric Spectrum Theme */}
      <section className="w-full py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm border-[#7BE495] bg-[#F5F5F5]"
            >
              Key Findings
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#2D3142]">
              Breakthrough Research Results
            </h2>
            <p className="max-w-[800px] text-[#424242] md:text-lg/relaxed">
              NeuroFeel represents a significant advancement in emotion
              recognition technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border border-[#E0E0E0] shadow-md hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#4ADEDE] to-[#4464AD] mb-4 shadow-md">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Personalization Success</CardTitle>
                <CardDescription>
                  Superior personalized emotion recognition
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-[#424242] mb-4">
                  Our adaptive personalization framework achieved 88.16%
                  accuracy with a +1.80% improvement over base models,
                  demonstrating the effectiveness of our confidence-based
                  selection approach.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                    <div className="text-xl font-bold text-[#4464AD]">
                      88.16%
                    </div>
                    <div className="text-sm text-[#424242]">
                      Adaptive Accuracy
                    </div>
                  </div>
                  <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                    <div className="text-xl font-bold text-[#4464AD]">
                      +1.80%
                    </div>
                    <div className="text-sm text-[#424242]">
                      Over Base Model
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#E0E0E0] shadow-md hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#4F8A8B] to-[#2D3142] mb-4 shadow-md">
                  <Share2 className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Domain Gap Reduction</CardTitle>
                <CardDescription>
                  Bridging laboratory and real-world environments
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-[#424242] mb-4">
                  Our ensemble adaptation approach successfully reduced the
                  domain gap by 89% between laboratory and real-world datasets,
                  with significant performance improvements in cross-dataset
                  emotion recognition.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                    <div className="text-xl font-bold text-[#4F8A8B]">89%</div>
                    <div className="text-sm text-[#424242]">Gap Reduction</div>
                  </div>
                  <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                    <div className="text-xl font-bold text-[#4F8A8B]">
                      80.27%
                    </div>
                    <div className="text-sm text-[#424242]">
                      Valence Accuracy
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#E0E0E0] shadow-md hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#7BE495] to-[#4F8A8B] mb-4 shadow-md">
                  <HeartPulse className="h-7 w-7 text-white" />
                </div>
                <CardTitle>Transferable Features</CardTitle>
                <CardDescription>
                  Discovering universal emotion markers
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-[#424242] mb-4">
                  We identified key physiological features that transfer well
                  between datasets, with ECG/HR features showing consistently
                  high importance for cross-dataset emotion recognition.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                    <div className="text-xl font-bold text-[#7BE495]">
                      ECG/HR
                    </div>
                    <div className="text-sm text-[#424242]">
                      Top Signal Type
                    </div>
                  </div>
                  <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                    <div className="text-xl font-bold text-[#7BE495]">
                      9 Features
                    </div>
                    <div className="text-sm text-[#424242]">
                      Common Features
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md border border-[#E0E0E0]">
            <h3 className="text-xl font-bold mb-8 text-center">
              Applications & Future Directions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center text-[#2D3142]">
                  <Zap className="h-5 w-5 text-[#4464AD] mr-2" />
                  Practical Applications
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] text-[#4464AD] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="text-[#424242]">
                      Wearable emotion sensing devices with consistent
                      performance
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] text-[#4464AD] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="text-[#424242]">
                      Mental health applications with reduced calibration
                      requirements
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] text-[#4464AD] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="text-[#424242]">
                      Affective computing systems with improved generalizability
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] text-[#4464AD] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="text-[#424242]">
                      Human-computer interaction with consistent emotion
                      recognition
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center text-[#2D3142]">
                  <GraduationCap className="h-5 w-5 text-[#4F8A8B] mr-2" />
                  Future Research Directions
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] text-[#4F8A8B] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="text-[#424242]">
                      Expanding to additional physiological datasets and sensor
                      modalities
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] text-[#4F8A8B] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="text-[#424242]">
                      Integrating visual and audio emotion cues with
                      physiological signals
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] text-[#4F8A8B] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="text-[#424242]">
                      Enhancing domain adaptation with self-supervised
                      approaches
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] text-[#4F8A8B] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="text-[#424242]">
                      Developing real-time adaptation for continuous emotion
                      monitoring
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section - With Biometric Spectrum Theme */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm border-[#B8B8FF] bg-[#F5F5F5]"
            >
              Interactive Demo
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#2D3142]">
              Experience NeuroFeel in Action
            </h2>
            <p className="max-w-[800px] text-[#424242] md:text-lg/relaxed">
              Explore our interactive demonstration to see domain adaptation and
              personalization in real-time
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#F5F5F5] to-[#B8B8FF]/20 rounded-xl p-8 shadow-lg border border-[#B8B8FF]/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[#2D3142]">
                  Live Framework Demo
                </h3>
                <p className="text-[#424242] mb-6">
                  Our interactive demo allows you to explore both frameworks
                  side by side, comparing performance and visualizing the domain
                  adaptation process in real-time.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3 text-[#4464AD]" />
                    </div>
                    <div className="text-sm text-[#424242]">
                      Test the WESAD personalization framework on different
                      subjects
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3 text-[#4464AD]" />
                    </div>
                    <div className="text-sm text-[#424242]">
                      Visualize cross-dataset transfer learning in both
                      directions
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 bg-[#F5F5F5] p-1 rounded-full mr-3">
                      <ChevronRight className="h-3 w-3 text-[#4464AD]" />
                    </div>
                    <div className="text-sm text-[#424242]">
                      Compare model performances across different approaches
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="bg-[#4464AD] hover:bg-[#2D3142] shadow-md"
                  asChild
                >
                  <Link href="/demo">
                    <span className="flex items-center">
                      Launch Interactive Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-[#E0E0E0]">
                <div className="aspect-[4/3] bg-[#F5F5F5] rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full p-4">
                    {/* UI mockup elements */}
                    <div className="absolute top-0 left-0 right-0 h-10 bg-[#4464AD] rounded-t-lg flex items-center px-3">
                      <div className="bg-white/20 h-5 w-24 rounded"></div>
                      <div className="bg-white/20 h-5 w-24 rounded ml-2"></div>
                    </div>

                    <div className="absolute top-12 left-2 w-[calc(50%-8px)] h-[calc(50%-16px)] bg-white rounded shadow-sm border border-[#E0E0E0] p-2">
                      <div className="h-3 w-16 bg-[#4ADEDE]/30 rounded mb-2"></div>
                      <div className="h-3 w-full bg-[#E0E0E0] rounded mb-1"></div>
                      <div className="h-3 w-full bg-[#E0E0E0] rounded mb-1"></div>
                      <div className="h-3 w-3/4 bg-[#E0E0E0] rounded"></div>
                    </div>

                    <div className="absolute top-12 right-2 w-[calc(50%-8px)] h-[calc(50%-16px)] bg-white rounded shadow-sm border border-[#E0E0E0] p-2">
                      <div className="h-3 w-16 bg-[#B8B8FF]/30 rounded mb-2"></div>
                      <div className="h-3 w-full bg-[#E0E0E0] rounded mb-1"></div>
                      <div className="h-3 w-full bg-[#E0E0E0] rounded mb-1"></div>
                      <div className="h-3 w-3/4 bg-[#E0E0E0] rounded"></div>
                    </div>

                    <div className="absolute bottom-6 left-2 right-2 h-[calc(50%-20px)] bg-white rounded shadow-sm border border-[#E0E0E0] p-2">
                      <div className="h-3 w-24 bg-[#7BE495]/30 rounded mb-2"></div>
                      <div className="flex mb-2">
                        <div className="h-4 w-1/3 bg-[#4464AD] rounded-l"></div>
                        <div className="h-4 w-1/2 bg-[#4F8A8B]"></div>
                        <div className="h-4 w-1/6 bg-[#7BE495] rounded-r"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="h-3 w-full bg-[#E0E0E0] rounded"></div>
                        <div className="h-3 w-full bg-[#E0E0E0] rounded"></div>
                        <div className="h-3 w-full bg-[#E0E0E0] rounded"></div>
                      </div>
                    </div>

                    {/* Animation pulse overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4464AD]/5 to-[#4F8A8B]/5 animate-pulse rounded-lg pointer-events-none"></div>
                  </div>
                </div>
                <div className="text-center text-sm text-[#424242] mt-3">
                  Interactive demo of NeuroFeel frameworks
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Datasets Section - With Biometric Spectrum Theme */}
      <section className="w-full py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm border-[#E0E0E0] bg-[#F5F5F5]"
            >
              Research Data
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#2D3142]">
              Foundational Datasets
            </h2>
            <p className="max-w-[800px] text-[#424242] md:text-lg/relaxed">
              NeuroFeel builds upon these key emotion recognition datasets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-md hover:shadow-xl transition-all border-t-4 border-t-[#4464AD]">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="bg-[#F5F5F5] p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-[#4464AD]" />
                  </div>
                  <CardTitle>WESAD Dataset</CardTitle>
                </div>
                <CardDescription>
                  Wearable Stress and Affect Detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-[#F5F5F5] p-4 rounded-lg mb-4 border border-[#E0E0E0]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-[#424242] mb-1">
                        Environment
                      </div>
                      <div className="font-medium text-[#4464AD]">
                        Laboratory
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#424242] mb-1">
                        Subjects
                      </div>
                      <div className="font-medium text-[#4464AD]">15</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#424242] mb-1">
                        Emotion Model
                      </div>
                      <div className="font-medium text-[#4464AD]">Discrete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#424242] mb-1">
                        Signal Quality
                      </div>
                      <div className="font-medium text-[#4464AD]">
                        High (700Hz)
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[#424242] mb-4">
                  WESAD is a multimodal dataset for wearable stress and affect
                  detection featuring physiological and motion data recorded
                  from both wrist and chest-worn devices in a controlled
                  laboratory environment.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4464AD] border-[#4464AD]/20"
                  >
                    ECG
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4464AD] border-[#4464AD]/20"
                  >
                    EDA
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4464AD] border-[#4464AD]/20"
                  >
                    EMG
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4464AD] border-[#4464AD]/20"
                  >
                    RESP
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4464AD] border-[#4464AD]/20"
                  >
                    Multi-modal
                  </Badge>
                </div>
                <div className="text-sm text-[#424242] italic border-t pt-3 border-[#E0E0E0]">
                  Schmidt, P., Reiss, A., Duerichen, R., Marberger, C., & Van
                  Laerhoven, K. (2018). Introducing WESAD, a multimodal dataset
                  for Wearable Stress and Affect Detection. ICMI 2018, Boulder,
                  USA.
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href="https://archive.ics.uci.edu/ml/datasets/WESAD+%28Wearable+Stress+and+Affect+Detection%29"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="flex items-center justify-center">
                      Dataset Details
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </span>
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-md hover:shadow-xl transition-all border-t-4 border-t-[#4F8A8B]">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="bg-[#F5F5F5] p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-[#4F8A8B]" />
                  </div>
                  <CardTitle>K-EmoCon Dataset</CardTitle>
                </div>
                <CardDescription>
                  Continuous Emotion Recognition in Naturalistic Settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-[#F5F5F5] p-4 rounded-lg mb-4 border border-[#E0E0E0]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-[#424242] mb-1">
                        Environment
                      </div>
                      <div className="font-medium text-[#4F8A8B]">
                        In-the-wild
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#424242] mb-1">
                        Sessions
                      </div>
                      <div className="font-medium text-[#4F8A8B]">16</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#424242] mb-1">
                        Emotion Model
                      </div>
                      <div className="font-medium text-[#4F8A8B]">
                        Dimensional
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#424242] mb-1">
                        Signal Quality
                      </div>
                      <div className="font-medium text-[#4F8A8B]">
                        Variable (4Hz)
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[#424242] mb-4">
                  K-EmoCon is a multimodal dataset with comprehensive
                  annotations of continuous emotions during naturalistic
                  conversations, featuring audiovisual recordings, EEG, and
                  peripheral physiological signals.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4F8A8B] border-[#4F8A8B]/20"
                  >
                    HR
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4F8A8B] border-[#4F8A8B]/20"
                  >
                    EDA
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4F8A8B] border-[#4F8A8B]/20"
                  >
                    EEG
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4F8A8B] border-[#4F8A8B]/20"
                  >
                    Social Interaction
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F5F5] text-[#4F8A8B] border-[#4F8A8B]/20"
                  >
                    Multi-perspective
                  </Badge>
                </div>
                <div className="text-sm text-[#424242] italic border-t pt-3 border-[#E0E0E0]">
                  Park, C. Y., Cha, N., Kang, S., Kim, A., Khandoker, A. H.,
                  Hadjileontiadis, L., Oh, A., Jeong, Y., & Lee, U. (2020).
                  K-EmoCon, a multimodal sensor dataset for continuous emotion
                  recognition in naturalistic conversations. Scientific Data,
                  7(1), 293.
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href="https://zenodo.org/records/3931963"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="flex items-center justify-center">
                      Dataset Details
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </span>
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - With Biometric Spectrum Theme */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-br from-[#2D3142] via-[#4464AD] to-[#4F8A8B] text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#4F8A8B]/20 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[#B8B8FF]/20 blur-3xl"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-xl">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              {/* <div className="bg-white/20 p-2 rounded-full inline-flex"> */}
                <Badge className="bg-white text-[#2D3142] px-3 py-1 text-sm">
                  NeuroFeel Project
                </Badge>
              {/* </div> */}
              <h2 className="text-3xl font-bold tracking-tighter md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-[#B8B8FF]">
                Ready to Experience the Future of Emotion Recognition?
              </h2>
              <p className="max-w-[800px] text-[#F5F5F5] md:text-xl/relaxed">
                Explore our interactive demos and see how NeuroFeel bridges the
                gap between laboratory precision and real-world applications in
                emotion recognition technology
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <Button
                  size="lg"
                  className="bg-white text-[#2D3142] hover:bg-[#F5F5F5] transition-all shadow-lg"
                  asChild
                >
                  <Link href="/demo">
                    <span className="flex items-center">
                      Launch Interactive Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white/10 transition-colors duration-200 focus:ring-2 focus:ring-white/50"
                  asChild
                >
                  <Link href="/documentation">
                    <span className="flex items-center">
                      View Documentation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
