"use client";

import React from "react";
import OverviewDashboard from "@/components/cross-dataset/OverviewDashboard";
import DomainGapVisualization from "@/components/cross-dataset/DomainGapVisualization";
import FeatureMappingVisualization from "@/components/cross-dataset/FeatureMappingVisualization";
import ClassDistributionVisualization from "@/components/cross-dataset/ClassDistributionVisualization";
import ConfusionMatrixVisualization from "@/components/cross-dataset/ConfusionMatrixVisualization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  // Download,
  Network,
  GitCompare,
  BarChart2,
  GanttChart,
  Brain,
  LayoutDashboard,
} from "lucide-react";
// import { generateReportUrl } from "@/lib/cross-dataset-api";

const CrossDatasetPage = () => {
  // Fixed values instead of state variables
  const target = "arousal";
  const direction = "wesad-to-kemocon";

  // const handleDownloadReport = (reportType: string) => {
  //   const url = generateReportUrl(reportType, target, direction);
  //   window.open(url, "_blank");
  // };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto py-4 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#2D3142]">
                cross-dataset Emotion Recognition
              </h1>
              <p className="text-sm text-[#424242] mt-1">
                Cross-Dataset Physiological Signal Analysis Platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#7BE495]/20 text-[#2D3142] text-xs font-medium rounded-full border border-[#7BE495]/30">
                Live Data
              </span>
              <span className="px-3 py-1 bg-[#4464AD]/20 text-[#2D3142] text-xs font-medium rounded-full border border-[#4464AD]/30">
                WESAD + K-EmoCon Dataset
              </span>
            </div>
          </div>
        </div>
      </header>
      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
          <CardTitle className="flex items-center gap-2 text-[#2D3142]">
            <LayoutDashboard className="h-5 w-5 text-[#4464AD]" />
            Performance Overview
          </CardTitle>
          <CardDescription className="text-[#424242]">
            Summary of cross-dataset emotion recognition performance for arousal
            recognition
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <OverviewDashboard target={target} direction={direction} />
        </CardContent>
      </Card>

      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
          <CardTitle className="flex items-center gap-2 text-[#2D3142]">
            <Brain className="h-5 w-5 text-[#4F8A8B]" />
            Detailed Analysis
          </CardTitle>
          <CardDescription className="text-[#424242]">
            In-depth analysis of cross-dataset transfer from WESAD to K-EmoCon
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="domain-gap" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-[#F5F5F5] border border-[#E0E0E0]">
              <TabsTrigger
                value="domain-gap"
                className="flex items-center gap-1 data-[state=active]:bg-[#4464AD] data-[state=active]:text-white"
              >
                <Network className="h-4 w-4" />
                <span>Domain Gap</span>
              </TabsTrigger>
              <TabsTrigger
                value="feature-mapping"
                className="flex items-center gap-1 data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white"
              >
                <GitCompare className="h-4 w-4" />
                <span>Feature Mapping</span>
              </TabsTrigger>
              <TabsTrigger
                value="class-distribution"
                className="flex items-center gap-1 data-[state=active]:bg-[#7BE495] data-[state=active]:text-[#2D3142]"
              >
                <BarChart2 className="h-4 w-4" />
                <span>Class Distribution</span>
              </TabsTrigger>
              <TabsTrigger
                value="confusion-matrices"
                className="flex items-center gap-1 data-[state=active]:bg-[#B8B8FF] data-[state=active]:text-[#2D3142]"
              >
                <GanttChart className="h-4 w-4" />
                <span>Confusion Matrices</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="domain-gap" className="space-y-4">
              <div className="bg-[#F5F5F5] p-4 rounded-lg border border-[#E0E0E0] mb-4">
                <h3 className="font-semibold mb-2 text-[#2D3142]">
                  Domain Gap Analysis
                </h3>
                <p className="text-sm text-[#424242]">
                  This visualization shows the distribution of features before
                  and after domain adaptation, demonstrating how the adaptation
                  techniques reduce the gap between datasets.
                </p>
              </div>
              <DomainGapVisualization target={target} direction={direction} />
              {/* <div className="flex justify-end">
                <Button
                  onClick={() => handleDownloadReport("adaptation")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-[#4464AD] text-[#4464AD] hover:bg-[#4464AD]/10"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Domain Adaptation Report</span>
                </Button>
              </div> */}
            </TabsContent>

            <TabsContent value="feature-mapping" className="space-y-4">
              <div className="bg-[#F5F5F5] p-4 rounded-lg border border-[#E0E0E0] mb-4">
                <h3 className="font-semibold mb-2 text-[#2D3142]">
                  Feature Mapping Analysis
                </h3>
                <p className="text-sm text-[#424242]">
                  This visualization shows how features are mapped between
                  datasets and their relative importance for cross-dataset
                  emotion recognition.
                </p>
              </div>
              <FeatureMappingVisualization
                target={target}
                direction={direction}
              />
              {/* <div className="flex justify-end">
                <Button
                  onClick={() => handleDownloadReport("features")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-[#4F8A8B] text-[#4F8A8B] hover:bg-[#4F8A8B]/10"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Feature Mapping Report</span>
                </Button>
              </div> */}
            </TabsContent>

            <TabsContent value="class-distribution" className="space-y-4">
              <div className="bg-[#F5F5F5] p-4 rounded-lg border border-[#E0E0E0] mb-4">
                <h3 className="font-semibold mb-2 text-[#2D3142]">
                  Class Distribution Analysis
                </h3>
                <p className="text-sm text-[#424242]">
                  This visualization shows the class distribution before and
                  after balancing, highlighting how class imbalance is addressed
                  in both datasets.
                </p>
              </div>
              <ClassDistributionVisualization
                target={target}
                direction={direction}
              />
              {/* <div className="flex justify-end">
                <Button
                  onClick={() => handleDownloadReport("balancing")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-[#7BE495] text-[#7BE495] hover:bg-[#7BE495]/10"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Class Balancing Report</span>
                </Button>
              </div> */}
            </TabsContent>

            <TabsContent value="confusion-matrices" className="space-y-4">
              <div className="bg-[#F5F5F5] p-4 rounded-lg border border-[#E0E0E0] mb-4">
                <h3 className="font-semibold mb-2 text-[#2D3142]">
                  Confusion Matrix Analysis
                </h3>
                <p className="text-sm text-[#424242]">
                  This visualization shows the confusion matrices for the source
                  and target datasets, highlighting common misclassification
                  patterns in cross-dataset emotion recognition.
                </p>
              </div>
              <ConfusionMatrixVisualization
                target={target}
                direction={direction}
              />
              {/* <div className="flex justify-end">
                <Button
                  onClick={() => handleDownloadReport("performance")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-[#B8B8FF] text-[#B8B8FF] hover:bg-[#B8B8FF]/10"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Performance Report</span>
                </Button>
              </div> */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossDatasetPage;
