"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FileText,
  Brain,
  Database,
  Share2,
  Github,
  GraduationCap,
  LayoutList,
  History,
  Code,
  Target,
  User,
  BarChart,
  BookOpen,
  MessageCircle,
  Award,
  HeartPulse,
  FlaskConical,
  Linkedin,
  Mail,
  Globe,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="w-full py-16 bg-gradient-to-br from-[#2D3142] via-[#4464AD] to-[#2D3142] text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-[#4F8A8B]/20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-[10%] w-64 h-64 rounded-full bg-[#B8B8FF]/20 blur-3xl"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="inline-flex mb-4 bg-[#4F8A8B]/20 text-[#F5F5F5] border-[#4F8A8B]/30 backdrop-blur-sm">
              About The Project
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-sm">
              The NeuroFeel Project
            </h1>

            <Separator className="w-24 h-1 mx-auto my-6 bg-gradient-to-r from-[#4ADEDE] to-[#7BE495] rounded-full" />

            <p className="text-xl md:text-2xl text-[#E0E0E0] max-w-2xl mx-auto">
              A final year software engineering project exploring cross-dataset
              emotion recognition using physiological signals
            </p>
          </div>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-3/4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg p-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-[#4464AD] data-[state=active]:text-white transition-all"
                >
                  <LayoutList className="h-4 w-4 mr-2" />
                  Project Overview
                </TabsTrigger>
                <TabsTrigger
                  value="about-me"
                  className="data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white transition-all"
                >
                  <User className="h-4 w-4 mr-2" />
                  About Me
                </TabsTrigger>
                <TabsTrigger
                  value="research"
                  className="data-[state=active]:bg-[#B8B8FF] data-[state=active]:text-[#2D3142] transition-all"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Research Details
                </TabsTrigger>
              </TabsList>

              {/* Project Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* FYP Information */}
                <Card className="border border-[#E0E0E0] shadow-sm overflow-hidden">
                  <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                    <CardTitle className="text-[#2D3142] text-xl flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-[#4464AD]" />
                      Final Year Project Information
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-[#4464AD]/10 flex items-center justify-center mr-3 mt-1 shrink-0">
                            <BookOpen className="h-5 w-5 text-[#4464AD]" />
                          </div>

                          <div>
                            <h3 className="text-lg font-medium text-[#2D3142] mb-1">
                              BEng (Hons) Software Engineering
                            </h3>

                            <p className="text-[#424242]">
                              This project was developed as part of the Final
                              Year Project (FYP) for the BEng (Hons) Software
                              Engineering degree program at IIT, affiliated with
                              University of Westminster.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="bg-[#F5F5F5] p-4 rounded-lg border border-[#E0E0E0]">
                          <h3 className="text-lg font-medium text-[#2D3142] flex items-center mb-4">
                            <FileText className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                            Project Details
                          </h3>

                          <div className="space-y-3">
                            <div className="flex items-start">
                              <div className="w-36 font-medium text-[#2D3142]">
                                Project Name
                              </div>

                              <div className="flex-1 text-[#424242]">
                                NeuroFeel: Cross-Dataset Emotion Recognition
                                Framework
                              </div>
                            </div>

                            <div className="flex items-start">
                              <div className="w-36 font-medium text-[#2D3142]">
                                Academic Year
                              </div>

                              <div className="flex-1 text-[#424242]">
                                2024-2025
                              </div>
                            </div>

                            <div className="flex items-start">
                              <div className="w-36 font-medium text-[#2D3142]">
                                Student
                              </div>

                              <div className="flex-1 text-[#424242]">
                                Himasha Herath
                              </div>
                            </div>

                            <div className="flex items-start">
                              <div className="w-36 font-medium text-[#2D3142]">
                                Supervisor
                              </div>

                              <div className="flex-1 text-[#424242]">
                                Achala Aponso
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                            <div className="font-medium text-[#2D3142] mb-2">
                              Project Overview
                            </div>

                            <p className="text-sm text-[#424242]">
                              This project investigates cross-dataset emotion
                              recognition challenges using physiological signals
                              and develops frameworks for personalization and
                              domain adaptation to improve real-world
                              applicability of emotion detection systems.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Overview */}
                <Card className="border border-[#E0E0E0] shadow-sm">
                  <CardHeader className="border-b border-[#E0E0E0]">
                    <CardTitle className="text-[#2D3142] text-xl flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-[#4464AD]" />
                      Project Overview
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    <p className="text-[#424242]">
                      NeuroFeel is an individual research project focused on
                      developing advanced emotion recognition systems that work
                      consistently across different environments. The innovative
                      framework addresses the fundamental challenge of
                      transferring emotion recognition models between laboratory
                      and real-world settings, enabling more reliable affective
                      computing applications.
                    </p>

                    <p className="text-[#424242]">
                      The project consists of two complementary frameworks: a
                      WESAD personalization framework for enhanced
                      subject-specific emotion recognition and a cross-dataset
                      framework that bridges the gap between WESAD (laboratory)
                      and K-EmoCon (in-the-wild) datasets using advanced domain
                      adaptation techniques.
                    </p>
                  </CardContent>

                  <Separator className="bg-[#E0E0E0]" />

                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-[#2D3142] mb-4">
                      Key Project Components
                    </h3>

                    <div className="grid md:grid-cols-3 gap-5">
                      <div className="bg-[#F5F5F5] rounded-lg p-5 border border-[#E0E0E0]">
                        <div className="h-12 w-12 rounded-lg bg-[#4464AD]/10 flex items-center justify-center mb-4">
                          <Brain className="h-6 w-6 text-[#4464AD]" />
                        </div>

                        <div>
                          <h4 className="font-medium text-[#2D3142] mb-2">
                            WESAD Personalization
                          </h4>

                          <p className="text-sm text-[#424242]">
                            Adaptive model selection for enhanced personalized
                            emotion recognition
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#F5F5F5] rounded-lg p-5 border border-[#E0E0E0]">
                        <div className="h-12 w-12 rounded-lg bg-[#4F8A8B]/10 flex items-center justify-center mb-4">
                          <Share2 className="h-6 w-6 text-[#4F8A8B]" />
                        </div>

                        <div>
                          <h4 className="font-medium text-[#2D3142] mb-2">
                            Cross-Dataset Framework
                          </h4>

                          <p className="text-sm text-[#424242]">
                            Domain adaptation techniques for real-world
                            generalizability
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#F5F5F5] rounded-lg p-5 border border-[#E0E0E0]">
                        <div className="h-12 w-12 rounded-lg bg-[#7BE495]/10 flex items-center justify-center mb-4">
                          <Target className="h-6 w-6 text-[#7BE495]" />
                        </div>

                        <div>
                          <h4 className="font-medium text-[#2D3142] mb-2">
                            Interactive Demo
                          </h4>

                          <p className="text-sm text-[#424242]">
                            Visual comparison of both frameworks with real-time
                            results
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Challenges */}
                <Card className="border border-[#E0E0E0] shadow-sm">
                  <CardHeader className="border-b border-[#E0E0E0]">
                    <CardTitle className="text-[#2D3142] flex items-center">
                      <Target className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                      Challenges Addressed
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="bg-[#4464AD]/10 p-3 rounded-lg inline-flex">
                          <Database className="h-5 w-5 text-[#4464AD]" />
                        </div>
                        <h3 className="font-medium text-[#2D3142]">
                          Sensor Discrepancies
                        </h3>

                        <p className="text-sm text-[#424242]">
                          The laboratory WESAD dataset used high-quality sensors
                          at 700Hz, while K-EmoCon used consumer-grade wearables
                          at 4Hz. I developed specialized normalization
                          techniques to address this fundamental quality gap.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-[#4F8A8B]/10 p-3 rounded-lg inline-flex">
                          <BarChart className="h-5 w-5 text-[#4F8A8B]" />
                        </div>
                        <h3 className="font-medium text-[#2D3142]">
                          Emotion Taxonomy Mapping
                        </h3>

                        <p className="text-sm text-[#424242]">
                          Bridging discrete emotions (WESAD) with dimensional
                          valence-arousal ratings (K-EmoCon) required creating a
                          data-driven mapping between these fundamentally
                          different emotion representation approaches.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-[#7BE495]/10 p-3 rounded-lg inline-flex">
                          <Award className="h-5 w-5 text-[#7BE495]" />
                        </div>
                        <h3 className="font-medium text-[#2D3142]">
                          Performance Evaluation
                        </h3>

                        <p className="text-sm text-[#424242]">
                          Developing fair comparison metrics across different
                          datasets and emotion models presented unique
                          challenges. I implemented balanced evaluation methods
                          to ensure accurate assessment of cross-dataset
                          performance.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* About Me Tab */}
              <TabsContent value="about-me" className="space-y-8">
                {/* Student Profile */}
                <Card className="border border-[#E0E0E0] shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-3">
                      <div className="bg-gradient-to-br from-[#2D3142] to-[#4464AD] p-6 text-white flex flex-col items-center text-center">
                        <Avatar className="h-32 w-32 border-4 border-white/20 shadow-lg mb-4">
                          <AvatarImage src="/avatar.jpg" alt="Himasha Herath" />
                          <AvatarFallback className="bg-[#4F8A8B] text-white text-2xl">
                            HH
                          </AvatarFallback>
                        </Avatar>

                        <h3 className="text-xl font-semibold mb-1">
                          Himasha Herath
                        </h3>

                        <p className="text-[#B8B8FF] mb-4">
                          Software Engineering Student
                        </p>

                        <div className="flex justify-center gap-4 mb-4">
                          <a
                            href="#"
                            className="text-white hover:text-[#B8B8FF] transition-colors"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                          <a
                            href="#"
                            className="text-white hover:text-[#B8B8FF] transition-colors"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                          <a
                            href="#"
                            className="text-white hover:text-[#B8B8FF] transition-colors"
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                        </div>

                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center">
                            <Github className="h-4 w-4 mr-2 opacity-70" />
                            <span className="opacity-90">HimashaHerath</span>
                          </div>

                          <div className="flex items-center">
                            <Linkedin className="h-4 w-4 mr-2 opacity-70" />
                            <span className="opacity-90">himasha-herath</span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 p-6">
                        <h3 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center">
                          <User className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                          About Me
                        </h3>

                        <div className="space-y-4 text-[#424242]">
                          <p>
                            I am a final year Software Engineering student at
                            IIT (affiliated with University of Westminster),
                            passionate about machine learning, affective
                            computing, and developing solutions that bridge the
                            gap between research and real-world applications.
                          </p>

                          <p>
                            My interest in emotion recognition technology began
                            during my coursework in machine learning and
                            human-computer interaction. This led me to explore
                            how physiological signals can be used to detect
                            emotional states, and the challenges in making these
                            systems work outside laboratory environments.
                          </p>

                          <p>
                            Through my final year project, NeuroFeel, I've
                            developed expertise in signal processing, machine
                            learning for physiological data, and domain
                            adaptation techniques that enable emotion
                            recognition models to generalize across different
                            datasets and environments.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <h4 className="font-medium text-[#2D3142] flex items-center mb-3">
                              <Code className="h-4 w-4 mr-2 text-[#4464AD]" />
                              Technical Skills
                            </h4>

                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20 hover:bg-[#4464AD]/20">
                                Python
                              </Badge>
                              <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20 hover:bg-[#4464AD]/20">
                                Machine Learning
                              </Badge>
                              <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20 hover:bg-[#4464AD]/20">
                                Signal Processing
                              </Badge>
                              <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20 hover:bg-[#4464AD]/20">
                                TensorFlow
                              </Badge>
                              <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20 hover:bg-[#4464AD]/20">
                                React
                              </Badge>
                              <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20 hover:bg-[#4464AD]/20">
                                Next.js
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-[#2D3142] flex items-center mb-3">
                              <FlaskConical className="h-4 w-4 mr-2 text-[#4F8A8B]" />
                              Research Interests
                            </h4>

                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20 hover:bg-[#4F8A8B]/20">
                                Affective Computing
                              </Badge>
                              <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20 hover:bg-[#4F8A8B]/20">
                                Physiological Signals
                              </Badge>
                              <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20 hover:bg-[#4F8A8B]/20">
                                Domain Adaptation
                              </Badge>
                              <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20 hover:bg-[#4F8A8B]/20">
                                HCI
                              </Badge>
                              <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20 hover:bg-[#4F8A8B]/20">
                                Personalized ML
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Education & Supervisor */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-[#E0E0E0] shadow-sm h-full">
                    <CardHeader className="border-b border-[#E0E0E0]">
                      <CardTitle className="text-[#2D3142] flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2 text-[#4464AD]" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex">
                          <div className="mr-4">
                            <div className="h-12 w-12 rounded-lg bg-[#4464AD]/10 flex items-center justify-center">
                              <GraduationCap className="h-6 w-6 text-[#4464AD]" />
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                              <h4 className="font-medium text-[#2D3142]">
                                BEng (Hons) Software Engineering
                              </h4>

                              <div className="text-sm text-[#4F8A8B] bg-[#4F8A8B]/10 px-2 py-0.5 rounded">
                                2021 - 2025
                              </div>
                            </div>

                            <div className="text-sm text-[#424242]">
                              Informatics Institute of Technology (IIT)
                            </div>

                            <div className="text-sm text-[#424242]">
                              Affiliated with University of Westminster
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-2">
                            Final Year Project
                          </h4>

                          <p className="text-sm text-[#424242]">
                            NeuroFeel: Cross-Dataset Emotion Recognition
                            Framework - A novel approach to bridge laboratory
                            and real-world emotion recognition through
                            personalization and domain adaptation techniques.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-[#E0E0E0] shadow-sm h-full">
                    <CardHeader className="border-b border-[#E0E0E0]">
                      <CardTitle className="text-[#2D3142] flex items-center">
                        <User className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                        Project Supervisor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarFallback className="bg-[#4F8A8B] text-white">
                            AA
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-[#2D3142]">
                            Achala Aponso
                          </h4>

                          <p className="text-sm text-[#424242]">
                            Project Supervisor
                          </p>
                        </div>
                      </div>

                      <p className="text-[#424242]">
                        Provided guidance on research methodology, technical
                        implementation, and academic standards throughout the
                        project development process.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Research Details Tab */}
              <TabsContent value="research" className="space-y-8">
                {/* Research Methodology */}
                <Card className="border border-[#E0E0E0] shadow-sm">
                  <CardHeader className="border-b border-[#E0E0E0]">
                    <CardTitle className="text-[#2D3142] flex items-center">
                      <FlaskConical className="h-5 w-5 mr-2 text-[#4464AD]" />
                      Research Methodology
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-[#4464AD]/10 p-3 rounded-lg inline-flex mb-3">
                          <Brain className="h-5 w-5 text-[#4464AD]" />
                        </div>
                        <h3 className="font-medium text-[#2D3142] mb-4">
                          WESAD Framework
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-[#2D3142] mb-1">
                              Personalization Approach
                            </h4>

                            <p className="text-sm text-[#424242]">
                              Developed a four-model architecture with base,
                              personal, ensemble, and adaptive models to
                              optimize emotion recognition for individual
                              subjects.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-[#2D3142] mb-1">
                              Adaptive Selection
                            </h4>

                            <p className="text-sm text-[#424242]">
                              Implemented confidence-based adaptive selection to
                              dynamically choose between different models based
                              on prediction confidence.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-[#2D3142] mb-1">
                              Performance
                            </h4>

                            <p className="text-sm text-[#424242]">
                              Achieved 88.16% accuracy with the adaptive model,
                              representing a +1.80% improvement over the base
                              model.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="bg-[#4F8A8B]/10 p-3 rounded-lg inline-flex mb-3">
                          <Share2 className="h-5 w-5 text-[#4F8A8B]" />
                        </div>
                        <h3 className="font-medium text-[#2D3142] mb-4">
                          Cross-Dataset Framework
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-[#2D3142] mb-1">
                              Domain Adaptation
                            </h4>

                            <p className="text-sm text-[#424242]">
                              Combined CORAL, subspace alignment, and feature
                              scaling techniques to reduce the domain gap
                              between laboratory and real-world datasets.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-[#2D3142] mb-1">
                              Feature Mapping
                            </h4>

                            <p className="text-sm text-[#424242]">
                              Developed a novel approach to map physiological
                              features between datasets with different sensor
                              configurations and quality levels.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-[#2D3142] mb-1">
                              Performance
                            </h4>

                            <p className="text-sm text-[#424242]">
                              Achieved 80.27% accuracy for valence recognition
                              across datasets, with an overall domain gap
                              reduction of 89%.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Datasets */}
                <Card className="border border-[#E0E0E0] shadow-sm">
                  <CardHeader className="border-b border-[#E0E0E0]">
                    <CardTitle className="text-[#2D3142] flex items-center">
                      <Database className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                      Datasets
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border border-[#E0E0E0] shadow-sm">
                        <CardHeader className="pb-3 bg-[#4464AD]/5">
                          <CardTitle className="text-[#2D3142] flex items-center text-lg">
                            <BookOpen className="h-5 w-5 mr-2 text-[#4464AD]" />
                            WESAD Dataset
                          </CardTitle>
                          <CardDescription>
                            Wearable Stress and Affect Detection
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                              <div className="text-sm text-[#424242] mb-1">
                                Environment
                              </div>

                              <div className="font-medium text-[#2D3142]">
                                Laboratory
                              </div>
                            </div>

                            <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                              <div className="text-sm text-[#424242] mb-1">
                                Subjects
                              </div>

                              <div className="font-medium text-[#2D3142]">
                                15
                              </div>
                            </div>

                            <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                              <div className="text-sm text-[#424242] mb-1">
                                Emotion Model
                              </div>

                              <div className="font-medium text-[#2D3142]">
                                Discrete
                              </div>
                            </div>

                            <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                              <div className="text-sm text-[#424242] mb-1">
                                Signal Quality
                              </div>

                              <div className="font-medium text-[#2D3142]">
                                High (700Hz)
                              </div>
                            </div>
                          </div>

                          <p className="text-[#424242] text-sm mb-3">
                            WESAD is a multimodal dataset for wearable stress
                            and affect detection featuring physiological and
                            motion data, recorded from both a wrist- and a
                            chest-worn device during a lab study.
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20">
                              ECG
                            </Badge>
                            <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20">
                              EDA
                            </Badge>
                            <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20">
                              EMG
                            </Badge>
                            <Badge className="bg-[#4464AD]/10 text-[#4464AD] border-[#4464AD]/20">
                              RESP
                            </Badge>
                          </div>

                          <div className="text-xs text-[#424242] italic border-t border-[#E0E0E0] pt-3">
                            Schmidt, P., Reiss, A., Duerichen, R., Marberger,
                            C., & Van Laerhoven, K. (2018). ICMI 2018.
                          </div>

                          <div className="text-xs text-[#424242] mt-2">
                            Note: Data used for academic research and
                            non-commercial purposes only.
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-[#E0E0E0] shadow-sm">
                        <CardHeader className="pb-3 bg-[#4F8A8B]/5">
                          <CardTitle className="text-[#2D3142] flex items-center text-lg">
                            <BookOpen className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                            K-EmoCon Dataset
                          </CardTitle>
                          <CardDescription>
                            Continuous Emotion Recognition in Naturalistic
                            Settings
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                              <div className="text-sm text-[#424242] mb-1">
                                Environment
                              </div>

                              <div className="font-medium text-[#2D3142]">
                                In-the-wild
                              </div>
                            </div>

                            <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                              <div className="text-sm text-[#424242] mb-1">
                                Sessions
                              </div>

                              <div className="font-medium text-[#2D3142]">
                                16
                              </div>
                            </div>

                            <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                              <div className="text-sm text-[#424242] mb-1">
                                Emotion Model
                              </div>

                              <div className="font-medium text-[#2D3142]">
                                Dimensional
                              </div>
                            </div>

                            <div className="bg-[#F5F5F5] p-3 rounded-lg border border-[#E0E0E0]">
                              <div className="text-sm text-[#424242] mb-1">
                                Signal Quality
                              </div>

                              <div className="font-medium text-[#2D3142]">
                                Variable (4Hz)
                              </div>
                            </div>
                          </div>

                          <p className="text-[#424242] text-sm mb-3">
                            K-EmoCon is a multimodal dataset with comprehensive
                            annotations of continuous emotions during
                            naturalistic conversations, including physiological
                            signals from wearable devices during social
                            interactions.
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20">
                              HR
                            </Badge>
                            <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20">
                              EDA
                            </Badge>
                            <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20">
                              EEG
                            </Badge>
                            <Badge className="bg-[#4F8A8B]/10 text-[#4F8A8B] border-[#4F8A8B]/20">
                              BVP
                            </Badge>
                          </div>

                          <div className="text-xs text-[#424242] italic border-t border-[#E0E0E0] pt-3">
                            Park, C.Y., et al. (2020). Scientific Data, 7(1),
                            293.
                          </div>

                          <div className="text-xs text-[#424242] mt-2">
                            Note: Dataset requires access approval via a form
                            submission.
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Acknowledgments */}
                <Card className="border border-[#E0E0E0] shadow-sm">
                  <CardHeader className="border-b border-[#E0E0E0]">
                    <CardTitle className="text-[#2D3142] flex items-center">
                      <HeartPulse className="h-5 w-5 mr-2 text-[#F76C5E]" />
                      Acknowledgments
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <p className="text-[#424242] mb-4">
                      This project would not have been possible without the
                      support and contributions of various individuals and
                      organizations who have shared resources, knowledge, and
                      datasets.
                    </p>

                    <ul className="space-y-2 text-[#424242]">
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#4464AD]/10 flex items-center justify-center mr-3 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-[#4464AD]" />
                        </div>
                        <span>
                          University of Westminster and IIT for providing the
                          academic framework and resources
                        </span>
                      </li>

                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#4464AD]/10 flex items-center justify-center mr-3 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-[#4464AD]" />
                        </div>
                        <span>
                          Achala Aponso for supervision and guidance throughout
                          the project
                        </span>
                      </li>

                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#4F8A8B]/10 flex items-center justify-center mr-3 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-[#4F8A8B]" />
                        </div>
                        <span>
                          WESAD dataset creators: Schmidt, P., Reiss, A.,
                          Duerichen, R., Marberger, C., & Van Laerhoven, K.
                        </span>
                      </li>

                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#4F8A8B]/10 flex items-center justify-center mr-3 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-[#4F8A8B]" />
                        </div>
                        <span>
                          K-EmoCon dataset creators: Park, C.Y., Cha, N., Kang,
                          S., Kim, A., Khandoker, A.H., Hadjileontiadis, L., Oh,
                          A., Jeong, Y., Lee, U.
                        </span>
                      </li>

                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#7BE495]/10 flex items-center justify-center mr-3 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-[#7BE495]" />
                        </div>
                        <span>
                          Open source community members who shared tools and
                          knowledge about emotion recognition
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/4 space-y-6">
            {/* Project Resources */}
            <Card className="border border-[#E0E0E0] shadow-sm">
              <CardHeader className="border-b border-[#E0E0E0] pb-3">
                <CardTitle className="text-[#2D3142] flex items-center text-lg">
                  <BookOpen className="h-5 w-5 mr-2 text-[#4464AD]" />
                  Project Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="outline"
                    className="justify-start text-[#424242] border-[#E0E0E0] hover:bg-[#F5F5F5] hover:text-[#4464AD]"
                    asChild
                  >
                    <Link href="/demo">
                      <Target className="h-4 w-4 mr-2 text-[#4464AD]" />
                      Interactive Demo
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-[#424242] border-[#E0E0E0] hover:bg-[#F5F5F5] hover:text-[#4464AD]"
                    asChild
                  >
                    <Link href="/documentation">
                      <FileText className="h-4 w-4 mr-2 text-[#4F8A8B]" />
                      Technical Documentation
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-[#424242] border-[#E0E0E0] hover:bg-[#F5F5F5] hover:text-[#4464AD]"
                    asChild
                  >
                    <a
                      href="https://github.com/username/neurofeel"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2 text-[#2D3142]" />
                      GitHub Repository
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-[#424242] border-[#E0E0E0] hover:bg-[#F5F5F5] hover:text-[#4464AD]"
                    disabled
                  >
                    <FileText className="h-4 w-4 mr-2 text-[#B8B8FF]" />
                    Project Report (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dataset Information */}
            <Card className="border border-[#E0E0E0] shadow-sm">
              <CardHeader className="border-b border-[#E0E0E0] pb-3">
                <CardTitle className="text-[#2D3142] flex items-center text-lg">
                  <Database className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                  Dataset Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="bg-[#4464AD]/10 p-3 rounded-lg border border-[#4464AD]/20">
                    <h4 className="font-medium text-[#2D3142] mb-1">
                      WESAD Dataset
                    </h4>

                    <p className="text-xs text-[#424242] mb-1">
                      Used for academic research only
                    </p>

                    <p className="text-xs text-[#424242]">
                      Schmidt et al. (2018), ICMI
                    </p>
                  </div>

                  <div className="bg-[#4F8A8B]/10 p-3 rounded-lg border border-[#4F8A8B]/20">
                    <h4 className="font-medium text-[#2D3142] mb-1">
                      K-EmoCon Dataset
                    </h4>

                    <p className="text-xs text-[#424242] mb-1">
                      Requires access approval
                    </p>

                    <p className="text-xs text-[#424242]">
                      Park et al. (2020), Scientific Data
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-[#4464AD] hover:bg-[#2D3142]"
                    asChild
                  >
                    <a
                      href="https://archive.ics.uci.edu/ml/datasets/WESAD+%28Wearable+Stress+and+Affect+Detection%29"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View WESAD dataset
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border border-[#E0E0E0] shadow-sm bg-gradient-to-br from-[#F5F5F5] to-[#B8B8FF]/10">
              <CardHeader className="border-b border-[#E0E0E0] pb-3">
                <CardTitle className="text-[#2D3142] flex items-center text-lg">
                  <MessageCircle className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                  Get In Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-[#424242] mb-4">
                  Interested in learning more about this project or discussing
                  potential collaboration? Feel free to reach out.
                </p>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-[#4464AD]/20 hover:bg-[#4464AD]/10"
                    asChild
                  >
                    <a
                      href="https://github.com/username"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5 text-[#4464AD]" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-[#4F8A8B]/20 hover:bg-[#4F8A8B]/10"
                    asChild
                  >
                    <a
                      href="https://linkedin.com/in/username"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-5 w-5 text-[#4F8A8B]" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-br from-[#2D3142] via-[#4464AD] to-[#2D3142] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#4F8A8B]/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#B8B8FF]/10 blur-3xl"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Experience NeuroFeel in Action
            </h2>

            <p className="text-xl text-[#E0E0E0] mb-8">
              Try the interactive demo to see how the frameworks perform across
              different datasets and scenarios.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#2D3142] hover:bg-[#F5F5F5] transition-colors shadow-lg"
                asChild
              >
                <Link href="/demo">
                  <Target className="mr-2 h-5 w-5" />
                  Launch Interactive Demo
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 transition-colors duration-200 focus:ring-2 focus:ring-white/50"
                asChild
              >
                <Link href="/documentation">
                  <FileText className="mr-2 h-5 w-5" />
                  View Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
