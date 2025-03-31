// app/wesad/page.tsx
"use client";

import { ModelAccuracyCard } from "@/components/wesad/overview/ModelAccuracyCard";
import { EmotionRecognitionCard } from "@/components/wesad/overview/EmotionRecognitionCard";
// import { ModelComparisonCard } from "@/components/dashboard/ModelAccuracyCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SubjectSelector } from "@/components/wesad/subjects/SubjectSelector";
import { ConfusionMatrix } from "@/components/wesad/subjects/ConfusionMatrix";
import { SignalVisualization } from "@/components/signals/SignalVisualization";
import { useState } from "react";
import { FeatureImportance } from "@/components/wesad/features/FeatureImportance";
import { AdaptiveThresholdSimulation } from "@/components/wesad/simulation/AdaptiveThresholdSimulation";
import { EnsembleWeightSimulation } from "@/components/wesad/simulation/EnsembleWeightSimulation";
import { ModelPerformanceAnalysis } from "@/components/wesad/analysis/ModelPerformanceAnalysis";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  UserCheck, 
  BarChart2, 
  FileText, 
  Activity, 
  LayoutDashboard, 
  Users, 
  LineChart, 
  CloudLightning,
  BarChart
} from "lucide-react";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Header */}
        <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto py-4 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#2D3142]">
                  WESAD Emotion Recognition
                </h1>
                <p className="text-sm text-[#424242] mt-1">
                  Cross-Dataset Physiological Signal Analysis Platform
                </p>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#7BE495]/20 text-[#2D3142] text-xs font-medium rounded-full border border-[#7BE495]/30">
                  Live Data
                </span>
                <span className="px-3 py-1 bg-[#4464AD]/20 text-[#2D3142] text-xs font-medium rounded-full border border-[#4464AD]/30">
                  WESAD Dataset
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto py-8 px-4">
          <Tabs defaultValue="overview" className="space-y-8">
            {/* Updated Tab List with consistent design */}
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0]">
              <TabsList className="flex w-full bg-transparent p-1 gap-1">
                <TabsTrigger
                  value="overview"
                  className="flex-1 py-3 rounded-md data-[state=active]:bg-[#4464AD] data-[state=active]:text-white data-[state=inactive]:text-[#424242] data-[state=inactive]:hover:bg-[#F5F5F5] transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="subject-analysis"
                  className="flex-1 py-3 rounded-md data-[state=active]:bg-[#4464AD] data-[state=active]:text-white data-[state=inactive]:text-[#424242] data-[state=inactive]:hover:bg-[#F5F5F5] transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Subject Analysis</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="feature-analysis"
                  className="flex-1 py-3 rounded-md data-[state=active]:bg-[#4464AD] data-[state=active]:text-white data-[state=inactive]:text-[#424242] data-[state=inactive]:hover:bg-[#F5F5F5] transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <LineChart className="h-4 w-4" />
                    <span>Feature Analysis</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="simulation"
                  className="flex-1 py-3 rounded-md data-[state=active]:bg-[#4464AD] data-[state=active]:text-white data-[state=inactive]:text-[#424242] data-[state=inactive]:hover:bg-[#F5F5F5] transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CloudLightning className="h-4 w-4" />
                    <span>Simulation</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="flex-1 py-3 rounded-md data-[state=active]:bg-[#4464AD] data-[state=active]:text-white data-[state=inactive]:text-[#424242] data-[state=inactive]:hover:bg-[#F5F5F5] transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <BarChart className="h-4 w-4" />
                    <span>Performance</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Contents */}
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-[#4464AD]" />
                    Performance Metrics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModelAccuracyCard />
                    <EmotionRecognitionCard />
                  </div>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="subject-analysis" className="mt-4">
              <EnhancedSubjectAnalysis />
            </TabsContent>

            <TabsContent value="feature-analysis" className="mt-4">
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#4464AD]" />
                    Global Feature Importance
                  </h2>
                  <Card className="border border-[#E0E0E0] shadow-sm">
                    <CardContent className="pt-6">
                      <FeatureImportance topN={15} />
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-[#4F8A8B]" />
                    Subject-Specific Feature Importance
                  </h2>
                  <Card className="border border-[#E0E0E0] shadow-sm">
                    <CardContent className="pt-6">
                      <EnhancedSubjectFeatureImportance />
                    </CardContent>
                  </Card>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="simulation" className="mt-4">
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center gap-2">
                    <CloudLightning className="h-5 w-5 text-[#4F8A8B]" />
                    Adaptive Model Threshold Simulation
                  </h2>
                  <AdaptiveThresholdSimulation />
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#7BE495]" />
                    Ensemble Weight Simulation
                  </h2>
                  <EnsembleWeightSimulation />
                </section>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <section>
                <h2 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-[#4ADEDE]" />
                  Model Performance Analysis
                </h2>
                <Card className="bg-white border border-[#E0E0E0] shadow-sm">
                  <CardContent className="pt-6">
                    <ModelPerformanceAnalysis />
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </QueryClientProvider>
  );
}

function EnhancedSubjectAnalysis() {
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
  const [selectedEmotion, setSelectedEmotion] = useState<string>("all");

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-[#E0E0E0] shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                Select Subject
              </label>
              <SubjectSelector onSelect={setSelectedSubject} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1">
                Filter by Emotion
              </label>
              <Select
                value={selectedEmotion}
                onValueChange={(value) => setSelectedEmotion(value)}
                disabled={!selectedSubject}
              >
                <SelectTrigger className="w-[180px] border-[#E0E0E0]">
                  <SelectValue placeholder="Select emotion" />
                </SelectTrigger>
                <SelectContent className="border-[#E0E0E0]">
                  <SelectItem value="all">All emotions</SelectItem>
                  <SelectItem value="Baseline">Baseline</SelectItem>
                  <SelectItem value="Stress">Stress</SelectItem>
                  <SelectItem value="Amusement">Amusement</SelectItem>
                  <SelectItem value="Meditation">Meditation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSubject ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-[#4F8A8B]" />
              Confusion Matrices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfusionMatrix subjectId={selectedSubject} modelType="base" />
              <ConfusionMatrix
                subjectId={selectedSubject}
                modelType="personal"
              />
              <ConfusionMatrix
                subjectId={selectedSubject}
                modelType="ensemble"
              />
              <ConfusionMatrix
                subjectId={selectedSubject}
                modelType="adaptive"
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D3142] mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-[#4464AD]" />
              Physiological Signal Analysis
            </h2>
            <Card className="border border-[#E0E0E0] shadow-sm">
              <CardContent className="pt-6">
                <SignalVisualization
                  subjectId={selectedSubject}
                  emotion={
                    selectedEmotion === "all" ? undefined : selectedEmotion
                  }
                />
              </CardContent>
            </Card>
          </section>
        </div>
      ) : (
        <Card className="bg-white border-2 border-dashed border-[#E0E0E0]">
          <CardContent className="py-12">
            <div className="text-center">
              <UserCheck className="w-12 h-12 mx-auto text-[#B8B8FF]" />
              <h3 className="mt-4 text-lg font-medium text-[#2D3142]">
                No Subject Selected
              </h3>
              <p className="mt-1 text-sm text-[#424242]">
                Please select a subject to view detailed analysis
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EnhancedSubjectFeatureImportance() {
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#2D3142] mb-1">
            Select Subject
          </label>
          <SubjectSelector onSelect={setSelectedSubject} />
        </div>
      </div>

      {selectedSubject ? (
        <FeatureImportance subjectId={selectedSubject} topN={15} />
      ) : (
        <div className="text-center p-10 border border-dashed rounded-lg bg-[#F5F5F5]">
          <FileText className="w-10 h-10 mx-auto text-[#B8B8FF]" />
          <p className="mt-4 text-[#424242]">
            Please select a subject to view feature importance
          </p>
        </div>
      )}
    </div>
  );
}