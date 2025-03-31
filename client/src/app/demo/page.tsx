"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BadgeInfo,
  Brain,
  LineChart,
  Share2,
  GitCompare,
  PlayCircle,
  RefreshCw,
  BarChart2,
  AlertCircle,
  DownloadCloud,
  UserCheck,
  Plus,
  History,
  ChevronRight,
  ArrowUpDown,
  PieChart,
  ListChecks,
  Activity,
  Home,
  Info,
  Settings,
  Zap,
  Layers,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

// Import API clients for both frameworks
import {
  crossDatasetApi,
  PredictionRequest as CrossDatasetPredictionRequest,
  PredictionResponse as CrossDatasetPredictionResponse,
} from "@/lib/crossDatasetApiPredict";

// Import hooks for both frameworks
import {
  useHealthCheck,
  useAvailableSamples,
  useSampleDetails,
  usePrediction,
  useModelInfo,
} from "@/hooks/useCrossDataset";

// Import the updated WESAD hook
import { useWesadApi } from "@/hooks/useWesadApi";

// Define emotion labels
const EMOTION_CLASSES = ["Baseline", "Stress", "Amusement", "Meditation"];

// Define color scheme
const COLORS = {
  primary: "#3b82f6", // Blue
  secondary: "#10b981", // Green
  accent: "#8b5cf6", // Purple
  warning: "#f59e0b", // Amber
  error: "#ef4444", // Red
  success: "#10b981", // Green
  neutral: "#6b7280", // Gray
  background: "#f9fafb", // Light gray
};

const DemoPage = () => {
  // WESAD Framework state
  const [wesadSubjectId, setWesadSubjectId] = useState(null);
  const [wesadSampleIndex, setWesadSampleIndex] = useState(0);

  // Cross-Dataset Framework state
  const [crossDatasetDirection, setCrossDatasetDirection] =
    useState("wesad_to_kemocon");
  const [crossDatasetTarget, setCrossDatasetTarget] = useState("both");
  const [crossDatasetSampleIndex, setCrossDatasetSampleIndex] = useState(0);
  const [crossDatasetTab, setCrossDatasetTab] = useState("predict"); // New state to handle Cross-Dataset subtabs

  // Batch results state
  const [batchPredictions, setBatchPredictions] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchStats, setBatchStats] = useState(null);

  // Results history
  const [resultsHistory, setResultsHistory] = useState([]);

  // Cross-Dataset API Hooks
  const { health } = useHealthCheck();
  const { samples, loading: samplesLoading } = useAvailableSamples();
  const {
    prediction,
    loading: predictionLoading,
    error: predictionError,
    makePrediction,
  } = usePrediction();
  const { modelInfo, loading: modelInfoLoading } = useModelInfo();
  const { sampleDetails, loading: sampleDetailsLoading } = useSampleDetails(
    crossDatasetDirection,
    crossDatasetSampleIndex
  );

  // WESAD API Hooks - Using the updated hook
  const {
    subjects,
    currentSubject,
    prediction: wesadPrediction,
    evaluation,
    sampleFeatures,
    performance,
    isLoadingSubjects,
    isPredicting,
    isEvaluating,
    isLoadingFeatures,
    isLoadingPerformance,
    error: wesadError,
    fetchSubjects,
    makePrediction: makeWesadPrediction,
    evaluateSubject,
    fetchSampleFeatures,
    fetchOverallPerformance,
    selectSubject,
    clearError: clearWesadError,
  } = useWesadApi();

  // Effect to load WESAD subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Effect to select first subject if none selected
  useEffect(() => {
    if (subjects.length > 0 && wesadSubjectId === null) {
      setWesadSubjectId(subjects[0].subject_id);
      selectSubject(subjects[0].subject_id);
    }
  }, [subjects, wesadSubjectId, selectSubject]);

  // Effect to add prediction to history when it changes
  useEffect(() => {
    if (prediction) {
      setResultsHistory((prev) => {
        const newHistory = [...prev];
        // Add to front of array, limit to 5 items
        newHistory.unshift({
          ...prediction,
          timestamp: new Date().toLocaleTimeString(),
          type: "cross-dataset",
        });
        return newHistory.slice(0, 5);
      });
    }
  }, [prediction]);

  // Effect to add wesadResults to history when it changes
  useEffect(() => {
    if (wesadPrediction) {
      setResultsHistory((prev) => {
        const newHistory = [...prev];
        // Add to front of array, limit to 5 items
        newHistory.unshift({
          ...wesadPrediction,
          timestamp: new Date().toLocaleTimeString(),
          type: "wesad",
        });
        return newHistory.slice(0, 5);
      });
    }
  }, [wesadPrediction]);

  // Run WESAD model prediction
  const runWesadPrediction = async () => {
    if (wesadSubjectId !== null) {
      await makeWesadPrediction(wesadSubjectId, wesadSampleIndex);
    }
  };

  // Run WESAD model evaluation
  const runWesadEvaluation = async () => {
    if (wesadSubjectId !== null) {
      await evaluateSubject(wesadSubjectId);
    }
  };

  // Run Cross-Dataset model with real API
  const runCrossDatasetModel = async () => {
    try {
      const request = {
        direction: crossDatasetDirection,
        sample_index: crossDatasetSampleIndex,
        target_dimension: crossDatasetTarget,
      };

      await makePrediction(request);
    } catch (error) {
      console.error("Error making cross-dataset prediction:", error);
    }
  };

  // Run batch predictions
  const runBatchPredictions = async () => {
    if (!samples) return;

    setBatchLoading(true);
    setBatchPredictions([]);

    try {
      const direction = crossDatasetDirection;
      const maxSamples =
        direction === "wesad_to_kemocon"
          ? Math.min(samples.kemocon_samples, 10)
          : Math.min(samples.wesad_samples, 10);

      const batchResults = [];

      // Process samples sequentially to avoid overwhelming the API
      for (let i = 0; i < maxSamples; i++) {
        const request = {
          direction,
          sample_index: i,
          target_dimension: "both",
        };

        // Call the API directly here for batch processing
        try {
          const response = await crossDatasetApi.predict(request);
          batchResults.push(response);
        } catch (error) {
          console.error(`Error predicting sample ${i}:`, error);
        }

        // Short delay to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setBatchPredictions(batchResults);

      // Calculate batch statistics
      const arousalCorrect = batchResults.filter(
        (result) => result.arousal?.class === result.ground_truth?.arousal
      ).length;

      const valenceCorrect = batchResults.filter(
        (result) => result.valence?.class === result.ground_truth?.valence
      ).length;

      const stats = {
        total: batchResults.length,
        arousalAccuracy:
          batchResults.length > 0 ? arousalCorrect / batchResults.length : 0,
        valenceAccuracy:
          batchResults.length > 0 ? valenceCorrect / batchResults.length : 0,
        overallAccuracy:
          batchResults.length > 0
            ? (arousalCorrect + valenceCorrect) / (batchResults.length * 2)
            : 0,
      };

      setBatchStats(stats);
    } catch (error) {
      console.error("Error in batch prediction:", error);
    } finally {
      setBatchLoading(false);
    }
  };

  // Format time difference for timestamp display
  const formatTimeDiff = (timestamp) => {
    try {
      const time = new Date(`1/1/2025 ${timestamp}`);
      const now = new Date();
      const diff = now.getTime() - time.getTime();

      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      return `${Math.floor(diff / 3600000)}h ago`;
    } catch (e) {
      return timestamp;
    }
  };

  // Render the most influential features
  const renderFeatureImportance = (features) => {
    if (!features) return null;

    // Sort features by absolute importance
    const sortedFeatures = Object.entries(features)
      .sort(([, a], [, b]) => Math.abs(Number(b)) - Math.abs(Number(a)))
      .slice(0, 5); // Take top 5

    if (sortedFeatures.length === 0) return null;

    // Find the max absolute value for normalization
    const maxValue = Math.abs(Number(sortedFeatures[0][1]));

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium mb-1">Top Features by Impact</div>
        {sortedFeatures.map(([name, value], idx) => {
          const absValue = Math.abs(Number(value));
          const normalized = (absValue / maxValue) * 100;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="truncate max-w-[180px]">{name}</span>
                <span>{Number(value).toFixed(4)}</span>
              </div>
              <div className="flex h-2 w-full bg-slate-100 rounded overflow-hidden">
                <div
                  className="bg-blue-500"
                  style={{ width: `${normalized}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header Section - Improved */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Emotion Recognition Demo
            </h1>
            <p className="text-slate-600 mt-1">
              Interactive comparison of WESAD and Cross-Dataset frameworks
            </p>
          </div>
          <div className="flex gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <p className="text-sm">
                    This demo allows you to run and compare models from both
                    frameworks with live API connections to our emotion
                    recognition engines.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* API Status Badge - Enhanced */}
        <div className="flex flex-wrap gap-3 mt-3">
          <Badge
            variant={health?.status === "ok" ? "outline" : "destructive"}
            className="text-xs px-3 py-1 flex items-center gap-1 bg-white border shadow-sm"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === "ok" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            {health?.status === "ok" ? "API Connected" : "API Disconnected"}
          </Badge>

          {health?.status === "ok" && (
            <>
              <Badge
                variant="outline"
                className="text-xs px-3 py-1 flex items-center gap-1 bg-white border shadow-sm"
              >
                <Brain className="h-3 w-3 text-blue-500" />
                {health.samples?.wesad} WESAD Samples
              </Badge>
              <Badge
                variant="outline"
                className="text-xs px-3 py-1 flex items-center gap-1 bg-white border shadow-sm"
              >
                <Share2 className="h-3 w-3 text-green-500" />
                {health.samples?.kemocon} K-EmoCon Samples
              </Badge>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="wesad" className="w-full">
        <TabsList className="w-full grid-cols-3 mb-6 rounded-xl overflow-hidden shadow-sm">
          <TabsTrigger
            value="wesad"
            className="text-base py-3 flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            <Brain className="h-4 w-4" />
            <span>WESAD Framework</span>
          </TabsTrigger>
          <TabsTrigger
            value="crossDataset"
            className="text-base py-3 flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
          >
            <Share2 className="h-4 w-4" />
            <span>Cross-Dataset Framework</span>
          </TabsTrigger>
          <TabsTrigger
            value="comparison"
            className="text-base py-3 flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <GitCompare className="h-4 w-4" />
            <span>Comparison</span>
          </TabsTrigger>
        </TabsList>
        {/* WESAD Framework Tab - Improved */}
        <TabsContent value="wesad" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Selection Panel */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Make a Prediction
                </CardTitle>
                <CardDescription>
                  Select subject and sample to test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select
                    value={wesadSubjectId?.toString() || ""}
                    onValueChange={(val) => {
                      const id = parseInt(val);
                      setWesadSubjectId(id);
                      selectSubject(id);
                    }}
                    disabled={isLoadingSubjects}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem
                          key={subject.subject_id}
                          value={subject.subject_id.toString()}
                        >
                          Subject SS{subject.subject_id} ({subject.num_samples}{" "}
                          samples)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sample Index</label>
                  <Select
                    value={wesadSampleIndex.toString()}
                    onValueChange={(val) => setWesadSampleIndex(parseInt(val))}
                    disabled={isLoadingSubjects || !wesadSubjectId}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Sample" />
                    </SelectTrigger>
                    <SelectContent>
                      {wesadSubjectId !== null &&
                        subjects.find((s) => s.subject_id === wesadSubjectId)
                          ?.num_samples &&
                        Array.from(
                          {
                            length:
                              subjects.find(
                                (s) => s.subject_id === wesadSubjectId
                              )?.num_samples || 0,
                          },
                          (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              Sample {i}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    onClick={runWesadPrediction}
                    disabled={isPredicting || !wesadSubjectId}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    {isPredicting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Predicting...</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" />
                        <span>Make Prediction</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={runWesadEvaluation}
                    disabled={isEvaluating || !wesadSubjectId}
                    className="w-full flex items-center justify-center gap-2"
                    variant="outline"
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <BarChart2 className="h-4 w-4" />
                        <span>Evaluate All Models</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={fetchOverallPerformance}
                    disabled={isLoadingPerformance}
                    className="w-full flex items-center justify-center gap-2"
                    variant="ghost"
                  >
                    {isLoadingPerformance ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <PieChart className="h-4 w-4" />
                        <span>Overall Performance</span>
                      </>
                    )}
                  </Button>
                </div>

                {wesadError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {wesadError}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearWesadError}
                        className="mt-2 w-full"
                      >
                        Dismiss
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Subject Information */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Subject Information
                </CardTitle>
                <CardDescription>
                  {wesadSubjectId
                    ? `Data for Subject SS${wesadSubjectId}`
                    : "Select a subject to view data"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {wesadSubjectId && subjects.length > 0 ? (
                  <div className="space-y-4">
                    {subjects.find((s) => s.subject_id === wesadSubjectId) && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Total Samples:
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {subjects.find(
                              (s) => s.subject_id === wesadSubjectId
                            )?.num_samples || 0}
                          </Badge>
                        </div>

                        {/* Class Distribution */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Class Distribution:
                          </div>
                          {subjects.find((s) => s.subject_id === wesadSubjectId)
                            ?.class_distribution &&
                            Object.entries(
                              subjects.find(
                                (s) => s.subject_id === wesadSubjectId
                              )?.class_distribution || {}
                            ).map(([className, count]) => (
                              <div
                                key={className}
                                className="flex items-center justify-between"
                              >
                                <span className="text-xs">{className}:</span>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={
                                      (count /
                                        (subjects.find(
                                          (s) => s.subject_id === wesadSubjectId
                                        )?.num_samples || 1)) *
                                      100
                                    }
                                    className="w-24 h-2 bg-blue-100"
                                    indicatorClassName="bg-blue-500"
                                  />
                                  <span className="text-xs">{count}</span>
                                </div>
                              </div>
                            ))}
                        </div>

                        {sampleFeatures && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-sm font-medium mb-2">
                              Current Sample Features:
                            </div>
                            <ScrollArea className="h-32 border rounded p-3 bg-slate-50">
                              <div className="space-y-1">
                                {Object.entries(sampleFeatures.features)
                                  .slice(0, 8)
                                  .map(([name, value]) => (
                                    <div
                                      key={name}
                                      className="flex justify-between"
                                    >
                                      <span className="text-xs truncate max-w-[120px]">
                                        {name}:
                                      </span>
                                      <span className="text-xs font-mono">
                                        {Number(value).toFixed(4)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                    {isLoadingSubjects ? (
                      <>
                        <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                        <span>Loading subjects...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-8 w-8 mb-2 text-slate-300" />
                        <span>Select a subject to view details</span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sample Features Panel */}
            {wesadPrediction ? (
              <Card className="border-blue-100 shadow-sm">
                <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Current Prediction
                  </CardTitle>
                  <CardDescription>
                    Subject SS{wesadSubjectId}, Sample {wesadSampleIndex}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-inner">
                      <div className="text-sm font-medium mb-1 text-blue-800">
                        Predicted Emotion
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {wesadPrediction.base_model?.emotion_name}
                      </div>
                      <div className="mt-2">
                        {wesadPrediction.accuracy?.true_emotion ===
                        wesadPrediction.base_model?.emotion_name ? (
                          <Badge className="mt-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                            Correct
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="mt-1">
                            Incorrect (True:{" "}
                            {wesadPrediction.accuracy?.true_emotion})
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="text-sm font-medium text-blue-800">
                        Model Confidences
                      </div>
                      {Object.entries(
                        wesadPrediction.base_model?.probabilities || {}
                      ).map(([emotion, confidence]) => {
                        const value = Number(confidence) * 100;
                        let barColor = "bg-blue-500";

                        // Adjust color based on probability
                        if (value > 50) barColor = "bg-green-500";
                        if (value < 25) barColor = "bg-slate-400";

                        return (
                          <div key={emotion} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{emotion}</span>
                              <span className="font-medium">
                                {value.toFixed(1)}%
                              </span>
                            </div>
                            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`${barColor} h-full rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-blue-100 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
                <div className="text-center text-slate-400 p-6">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-500 mb-1">
                    No Prediction Yet
                  </h3>
                  <p className="text-sm max-w-[200px]">
                    Make a prediction to see the results here
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Evaluation Results (if available) */}
          {evaluation && (
            <Card className="shadow-sm border-blue-100">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Model Evaluation for Subject SS{evaluation.subject_id}
                </CardTitle>
                <CardDescription>
                  Comparison of all model approaches
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                        Base
                      </Badge>
                      <span>Model</span>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100 shadow-inner">
                      <div className="text-3xl font-bold mb-1 text-blue-700">
                        {(evaluation.accuracy.base * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500">Accuracy</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>F1 Score:</span>
                        <span>
                          {(evaluation.f1_score.base * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={evaluation.f1_score.base * 100}
                        className="h-2 bg-blue-100"
                        indicatorClassName="bg-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
                        Personal
                      </Badge>
                      <span>Model</span>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-indigo-50 border border-indigo-100 shadow-inner">
                      <div className="text-3xl font-bold mb-1 text-indigo-700">
                        {(evaluation.accuracy.personal * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500">Accuracy</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>F1 Score:</span>
                        <span>
                          {(evaluation.f1_score.personal * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={evaluation.f1_score.personal * 100}
                        className="h-2 bg-indigo-100"
                        indicatorClassName="bg-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none">
                        Ensemble
                      </Badge>
                      <span>Model</span>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100 shadow-inner">
                      <div className="text-3xl font-bold mb-1 text-purple-700">
                        {(evaluation.accuracy.ensemble * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500">Accuracy</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>F1 Score:</span>
                        <span>
                          {(evaluation.f1_score.ensemble * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={evaluation.f1_score.ensemble * 100}
                        className="h-2 bg-purple-100"
                        indicatorClassName="bg-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                      <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-none">
                        Adaptive
                      </Badge>
                      <span>Model</span>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-cyan-50 border border-cyan-100 shadow-inner">
                      <div className="text-3xl font-bold mb-1 text-cyan-700">
                        {(evaluation.accuracy.adaptive * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500">Accuracy</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>F1 Score:</span>
                        <span>
                          {(evaluation.f1_score.adaptive * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={evaluation.f1_score.adaptive * 100}
                        className="h-2 bg-cyan-100"
                        indicatorClassName="bg-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Confusion Matrix Visualization */}
                <div className="mt-8 pt-6 border-t">
                  <div className="text-lg font-medium mb-4 text-blue-800 flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Confusion Matrix
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="text-center mb-2 font-medium text-blue-800">
                        Base Model
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="p-2 bg-blue-50 border border-blue-100"></th>
                              {EMOTION_CLASSES.map((emotion, i) => (
                                <th
                                  key={i}
                                  className="p-2 border border-blue-100 bg-blue-50 text-xs text-blue-800"
                                >
                                  {emotion}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {evaluation.confusion_matrix.base.map((row, i) => (
                              <tr key={i}>
                                <td className="p-2 border border-blue-100 text-xs font-medium bg-blue-50 text-blue-800">
                                  {EMOTION_CLASSES[i]}
                                </td>
                                {row.map((cell, j) => (
                                  <td
                                    key={j}
                                    className={`p-2 border border-blue-100 text-center text-xs ${
                                      i === j
                                        ? "bg-green-100 text-green-800 font-medium"
                                        : cell > 0
                                        ? "bg-red-50 text-red-800"
                                        : ""
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="text-center mb-2 font-medium text-cyan-800">
                        Adaptive Model
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="p-2 bg-cyan-50 border border-cyan-100"></th>
                              {EMOTION_CLASSES.map((emotion, i) => (
                                <th
                                  key={i}
                                  className="p-2 border border-cyan-100 bg-cyan-50 text-xs text-cyan-800"
                                >
                                  {emotion}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {evaluation.confusion_matrix.adaptive.map(
                              (row, i) => (
                                <tr key={i}>
                                  <td className="p-2 border border-cyan-100 text-xs font-medium bg-cyan-50 text-cyan-800">
                                    {EMOTION_CLASSES[i]}
                                  </td>
                                  {row.map((cell, j) => (
                                    <td
                                      key={j}
                                      className={`p-2 border border-cyan-100 text-center text-xs ${
                                        i === j
                                          ? "bg-green-100 text-green-800 font-medium"
                                          : cell > 0
                                          ? "bg-red-50 text-red-800"
                                          : ""
                                      }`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Performance (if available) */}
          {performance && (
            <Card className="shadow-sm border-blue-100">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Overall Framework Performance
                </CardTitle>
                <CardDescription>
                  Across all {performance.per_subject.subject_ids.length}{" "}
                  subjects
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center border rounded-lg p-4 shadow-sm bg-gradient-to-b from-blue-50 to-white">
                    <div className="text-sm text-blue-600 mb-1">Base Model</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {(performance.mean_metrics.base_accuracy * 100).toFixed(
                        1
                      )}
                      %
                    </div>
                    <div className="text-xs text-slate-500">Accuracy</div>
                  </div>

                  <div className="text-center border rounded-lg p-4 shadow-sm bg-gradient-to-b from-indigo-50 to-white">
                    <div className="text-sm text-indigo-600 mb-1">
                      Personal Model
                    </div>
                    <div className="text-2xl font-bold text-indigo-700">
                      {(
                        performance.mean_metrics.personal_accuracy * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-slate-500">Accuracy</div>
                  </div>

                  <div className="text-center border rounded-lg p-4 shadow-sm bg-gradient-to-b from-purple-50 to-white">
                    <div className="text-sm text-purple-600 mb-1">
                      Ensemble Model
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                      {(
                        performance.mean_metrics.ensemble_accuracy * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-slate-500">Accuracy</div>
                  </div>

                  <div className="text-center border rounded-lg p-4 shadow-sm bg-gradient-to-b from-cyan-50 to-white">
                    <div className="text-sm text-cyan-600 mb-1">
                      Adaptive Model
                    </div>
                    <div className="text-2xl font-bold text-cyan-700">
                      {(
                        performance.mean_metrics.adaptive_accuracy * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-slate-500">Accuracy</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="text-lg font-medium mb-2 text-blue-800">
                    Improvement over Base Model
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Personal Model:</span>
                        <span
                          className={
                            performance.improvements.personal_vs_base >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {(
                            performance.improvements.personal_vs_base * 100
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${
                            performance.improvements.personal_vs_base >= 0
                              ? "bg-green-500"
                              : "bg-red-500"
                          } h-full rounded-full transition-all duration-500 ease-out`}
                          style={{
                            width: `${
                              Math.abs(
                                performance.improvements.personal_vs_base * 100
                              ) + 5
                            }%`,
                            marginLeft:
                              performance.improvements.personal_vs_base >= 0
                                ? "0"
                                : "auto",
                            marginRight:
                              performance.improvements.personal_vs_base >= 0
                                ? "auto"
                                : "0",
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Ensemble Model:</span>
                        <span
                          className={
                            performance.improvements.ensemble_vs_base >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {(
                            performance.improvements.ensemble_vs_base * 100
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${
                            performance.improvements.ensemble_vs_base >= 0
                              ? "bg-green-500"
                              : "bg-red-500"
                          } h-full rounded-full transition-all duration-500 ease-out`}
                          style={{
                            width: `${
                              Math.abs(
                                performance.improvements.ensemble_vs_base * 100
                              ) + 5
                            }%`,
                            marginLeft:
                              performance.improvements.ensemble_vs_base >= 0
                                ? "0"
                                : "auto",
                            marginRight:
                              performance.improvements.ensemble_vs_base >= 0
                                ? "auto"
                                : "0",
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Adaptive Model:</span>
                        <span
                          className={
                            performance.improvements.adaptive_vs_base >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {(
                            performance.improvements.adaptive_vs_base * 100
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${
                            performance.improvements.adaptive_vs_base >= 0
                              ? "bg-green-500"
                              : "bg-red-500"
                          } h-full rounded-full transition-all duration-500 ease-out`}
                          style={{
                            width: `${
                              Math.abs(
                                performance.improvements.adaptive_vs_base * 100
                              ) + 5
                            }%`,
                            marginLeft:
                              performance.improvements.adaptive_vs_base >= 0
                                ? "0"
                                : "auto",
                            marginRight:
                              performance.improvements.adaptive_vs_base >= 0
                                ? "auto"
                                : "0",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="text-lg font-medium mb-3 text-blue-800 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Performance by Subject
                  </div>
                  <div className="overflow-x-auto border rounded-lg shadow-sm">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-blue-50 border-b border-blue-100">
                          <th className="p-2 text-left text-xs text-blue-800">
                            Subject
                          </th>
                          <th className="p-2 text-center text-xs text-blue-800">
                            Base
                          </th>
                          <th className="p-2 text-center text-xs text-indigo-800">
                            Personal
                          </th>
                          <th className="p-2 text-center text-xs text-purple-800">
                            Ensemble
                          </th>
                          <th className="p-2 text-center text-xs text-cyan-800">
                            Adaptive
                          </th>
                          <th className="p-2 text-center text-xs text-blue-800">
                            Best Model
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {performance.per_subject.subject_ids.map(
                          (subject, idx) => {
                            const baseAcc =
                              performance.per_subject.metrics.base_accuracy[
                                idx
                              ];
                            const personalAcc =
                              performance.per_subject.metrics.personal_accuracy[
                                idx
                              ];
                            const ensembleAcc =
                              performance.per_subject.metrics.ensemble_accuracy[
                                idx
                              ];
                            const adaptiveAcc =
                              performance.per_subject.metrics.adaptive_accuracy[
                                idx
                              ];

                            // Find the best model
                            const accuracies = [
                              { name: "Base", value: baseAcc, color: "blue" },
                              {
                                name: "Personal",
                                value: personalAcc,
                                color: "indigo",
                              },
                              {
                                name: "Ensemble",
                                value: ensembleAcc,
                                color: "purple",
                              },
                              {
                                name: "Adaptive",
                                value: adaptiveAcc,
                                color: "cyan",
                              },
                            ];

                            const bestModel = accuracies.reduce(
                              (prev, current) =>
                                prev.value > current.value ? prev : current
                            );

                            return (
                              <tr
                                key={subject}
                                className="border-b hover:bg-slate-50"
                              >
                                <td className="p-2 text-xs font-medium">
                                  SS{subject}
                                </td>
                                <td className="p-2 text-center text-xs">
                                  {(baseAcc * 100).toFixed(1)}%
                                </td>
                                <td className="p-2 text-center text-xs">
                                  {(personalAcc * 100).toFixed(1)}%
                                </td>
                                <td className="p-2 text-center text-xs">
                                  {(ensembleAcc * 100).toFixed(1)}%
                                </td>
                                <td className="p-2 text-center text-xs">
                                  {(adaptiveAcc * 100).toFixed(1)}%
                                </td>
                                <td className="p-2 text-center text-xs">
                                  <Badge
                                    className={`bg-${bestModel.color}-100 text-${bestModel.color}-800 border-${bestModel.color}-200`}
                                  >
                                    {bestModel.name} (
                                    {(bestModel.value * 100).toFixed(1)}%)
                                  </Badge>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Cross-Dataset Framework Tab - Improved with subtabs */}
        <TabsContent value="crossDataset" className="space-y-6">
          <Card className="shadow-sm border-green-100">
            <CardHeader className="bg-green-50 rounded-t-lg border-b border-green-100">
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Cross-Dataset Recognition
              </CardTitle>
              <CardDescription>
                Run cross-dataset models to predict emotion dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-0">
              {/* Sub-tabs for Predict and Batch Testing */}
              <Tabs
                value={crossDatasetTab}
                onValueChange={setCrossDatasetTab}
                className="w-full"
              >
                <TabsList className="mb-6 inline-flex bg-green-50 p-1 rounded-lg">
                  <TabsTrigger
                    value="predict"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Single Prediction
                  </TabsTrigger>
                  <TabsTrigger
                    value="batch"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Batch Testing
                  </TabsTrigger>
                </TabsList>

                {/* Single Prediction Tab */}
                <TabsContent value="predict" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-green-800">
                        Direction
                      </label>
                      <Select
                        value={crossDatasetDirection}
                        onValueChange={setCrossDatasetDirection}
                        disabled={samplesLoading}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wesad_to_kemocon">
                            WESAD → K-EmoCon
                          </SelectItem>
                          <SelectItem value="kemocon_to_wesad">
                            K-EmoCon → WESAD
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-green-800">
                        Sample
                      </label>
                      <Select
                        value={crossDatasetSampleIndex.toString()}
                        onValueChange={(val) =>
                          setCrossDatasetSampleIndex(parseInt(val))
                        }
                        disabled={samplesLoading}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Sample Index" />
                        </SelectTrigger>
                        <SelectContent>
                          {samples &&
                            crossDatasetDirection === "wesad_to_kemocon" &&
                            Array.from(
                              { length: samples.kemocon_samples },
                              (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  K-EmoCon Sample {i}
                                </SelectItem>
                              )
                            )}
                          {samples &&
                            crossDatasetDirection === "kemocon_to_wesad" &&
                            Array.from(
                              { length: samples.wesad_samples },
                              (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  WESAD Sample {i}
                                </SelectItem>
                              )
                            )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-green-800">
                        Target Dimension
                      </label>
                      <Select
                        value={crossDatasetTarget}
                        onValueChange={setCrossDatasetTarget}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Target" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arousal">Arousal</SelectItem>
                          <SelectItem value="valence">Valence</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Sample Details */}
                  {sampleDetails && !sampleDetailsLoading ? (
                    <div className="mt-6 p-4 border rounded-lg bg-green-50 border-green-100 shadow-inner">
                      <div className="text-sm font-medium mb-2 text-green-800">
                        Sample Details
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="font-medium">Subject ID:</span>{" "}
                          {sampleDetails.subject_id}
                        </div>
                        <div>
                          <span className="font-medium">Direction:</span>{" "}
                          {sampleDetails.direction === "wesad_to_kemocon"
                            ? "WESAD → K-EmoCon"
                            : "K-EmoCon → WESAD"}
                        </div>
                        <div>
                          <span className="font-medium">Arousal:</span>{" "}
                          <Badge
                            className={
                              sampleDetails.arousal_binary
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            {sampleDetails.arousal_binary ? "High" : "Low"}
                          </Badge>{" "}
                          ({sampleDetails.arousal?.toFixed(1)})
                        </div>
                        <div>
                          <span className="font-medium">Valence:</span>{" "}
                          <Badge
                            className={
                              sampleDetails.valence_binary
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {sampleDetails.valence_binary ? "High" : "Low"}
                          </Badge>{" "}
                          ({sampleDetails.valence?.toFixed(1)})
                        </div>
                        {sampleDetails.emotion_label && (
                          <div className="col-span-2">
                            <span className="font-medium">Emotion Label:</span>{" "}
                            {sampleDetails.emotion_label}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : sampleDetailsLoading ? (
                    <div className="mt-6 p-4 border rounded-lg flex justify-center items-center h-24">
                      <RefreshCw className="h-6 w-6 animate-spin text-green-500" />
                    </div>
                  ) : null}

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={runCrossDatasetModel}
                      disabled={predictionLoading || samplesLoading}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    >
                      {predictionLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          <span>Run Prediction</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {predictionError && (
                    <Alert variant="destructive" className="mt-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        An error occurred while making the prediction. Please
                        try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {prediction && (
                    <div className="mt-6 border-t pt-6">
                      <Card className="border-green-100 shadow-sm">
                        <CardHeader className="bg-green-50 rounded-t-lg border-b border-green-100">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-green-800 flex items-center gap-2">
                              <Activity className="h-5 w-5" />
                              {prediction.direction === "wesad_to_kemocon"
                                ? "WESAD → K-EmoCon"
                                : "K-EmoCon → WESAD"}
                            </CardTitle>
                            <Badge variant="outline" className="bg-white">
                              Subject {prediction.subject_id}, Sample{" "}
                              {prediction.sample_index}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <Tabs defaultValue="results" className="w-full">
                            <TabsList className="w-full grid grid-cols-2 mb-4">
                              <TabsTrigger
                                value="results"
                                className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                              >
                                Prediction Results
                              </TabsTrigger>
                              <TabsTrigger
                                value="features"
                                className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                              >
                                Features Used
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="results" className="pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {prediction.arousal && (
                                  <div className="space-y-4">
                                    <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-100 shadow-inner">
                                      <div className="text-lg font-semibold mb-2 text-yellow-800">
                                        Arousal Prediction
                                      </div>
                                      <div className="text-3xl font-bold text-yellow-700">
                                        {prediction.arousal.class.toUpperCase()}
                                      </div>
                                      <div className="mt-2 text-sm text-slate-500">
                                        with{" "}
                                        {(
                                          prediction.arousal.confidence * 100
                                        ).toFixed(1)}
                                        % confidence
                                      </div>
                                      <div className="mt-3 flex justify-center">
                                        <Badge
                                          className={
                                            prediction.arousal.class ===
                                            prediction.ground_truth.arousal
                                              ? "bg-green-100 text-green-800 border-green-200"
                                              : "bg-red-100 text-red-800 border-red-200"
                                          }
                                        >
                                          {prediction.arousal.class ===
                                          prediction.ground_truth.arousal
                                            ? "Correct"
                                            : "Incorrect"}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Confidence</span>
                                        <span className="font-medium text-yellow-700">
                                          {(
                                            prediction.arousal.confidence * 100
                                          ).toFixed(1)}
                                          %
                                        </span>
                                      </div>
                                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                          className="bg-yellow-500 h-full rounded-full transition-all duration-500 ease-out"
                                          style={{
                                            width: `${
                                              prediction.arousal.confidence *
                                              100
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2 p-3 border rounded-lg bg-white">
                                      <div className="flex justify-between text-xs">
                                        <span>Probability of HIGH:</span>
                                        <span className="font-mono">
                                          {prediction.arousal.probability.toFixed(
                                            4
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span>Probability of LOW:</span>
                                        <span className="font-mono">
                                          {(
                                            1 - prediction.arousal.probability
                                          ).toFixed(4)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs font-medium mt-1 pt-1 border-t">
                                        <span>Ground Truth:</span>
                                        <span className="text-yellow-700">
                                          {prediction.ground_truth.arousal.toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {prediction.valence && (
                                  <div className="space-y-4">
                                    <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100 shadow-inner">
                                      <div className="text-lg font-semibold mb-2 text-green-800">
                                        Valence Prediction
                                      </div>
                                      <div className="text-3xl font-bold text-green-700">
                                        {prediction.valence.class.toUpperCase()}
                                      </div>
                                      <div className="mt-2 text-sm text-slate-500">
                                        with{" "}
                                        {(
                                          prediction.valence.confidence * 100
                                        ).toFixed(1)}
                                        % confidence
                                      </div>
                                      <div className="mt-3 flex justify-center">
                                        <Badge
                                          className={
                                            prediction.valence.class ===
                                            prediction.ground_truth.valence
                                              ? "bg-green-100 text-green-800 border-green-200"
                                              : "bg-red-100 text-red-800 border-red-200"
                                          }
                                        >
                                          {prediction.valence.class ===
                                          prediction.ground_truth.valence
                                            ? "Correct"
                                            : "Incorrect"}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Confidence</span>
                                        <span className="font-medium text-green-700">
                                          {(
                                            prediction.valence.confidence * 100
                                          ).toFixed(1)}
                                          %
                                        </span>
                                      </div>
                                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                          className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
                                          style={{
                                            width: `${
                                              prediction.valence.confidence *
                                              100
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2 p-3 border rounded-lg bg-white">
                                      <div className="flex justify-between text-xs">
                                        <span>Probability of HIGH:</span>
                                        <span className="font-mono">
                                          {prediction.valence.probability.toFixed(
                                            4
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span>Probability of LOW:</span>
                                        <span className="font-mono">
                                          {(
                                            1 - prediction.valence.probability
                                          ).toFixed(4)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs font-medium mt-1 pt-1 border-t">
                                        <span>Ground Truth:</span>
                                        <span className="text-green-700">
                                          {prediction.ground_truth.valence.toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TabsContent>

                            <TabsContent value="features" className="pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div className="text-lg font-semibold mb-2 text-green-800">
                                    Features Used
                                  </div>
                                  <ScrollArea className="h-64 border rounded-lg p-4 bg-white shadow-inner">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b">
                                          <th className="py-2 text-left text-sm text-green-800">
                                            Feature Name
                                          </th>
                                          <th className="py-2 text-right text-sm text-green-800">
                                            Value
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Object.entries(
                                          prediction.features_used
                                        )
                                          .sort(
                                            (a, b) =>
                                              Math.abs(b[1]) - Math.abs(a[1])
                                          )
                                          .map(([feature, value], idx) => (
                                            <tr
                                              key={idx}
                                              className="border-b hover:bg-green-50"
                                            >
                                              <td className="py-2 text-xs">
                                                {feature}
                                              </td>
                                              <td className="py-2 text-right text-xs font-mono">
                                                {value.toFixed(4)}
                                              </td>
                                            </tr>
                                          ))}
                                      </tbody>
                                    </table>
                                  </ScrollArea>
                                </div>

                                {renderFeatureImportance(
                                  prediction.features_used
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* Batch Testing Tab */}
                <TabsContent value="batch" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-green-800">
                        Direction
                      </label>
                      <Select
                        value={crossDatasetDirection}
                        onValueChange={setCrossDatasetDirection}
                        disabled={batchLoading || samplesLoading}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wesad_to_kemocon">
                            WESAD → K-EmoCon
                          </SelectItem>
                          <SelectItem value="kemocon_to_wesad">
                            K-EmoCon → WESAD
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="text-xs text-slate-500 mt-2">
                        This will run prediction on up to 10 samples from the
                        selected direction.
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={runBatchPredictions}
                        disabled={batchLoading || samplesLoading}
                        className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                      >
                        {batchLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Running Batch Test...</span>
                          </>
                        ) : (
                          <>
                            <ListChecks className="h-4 w-4" />
                            <span>Run Batch Test</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {batchStats && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="text-xl font-medium mb-4 text-green-800 flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Batch Results
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border rounded-lg p-5 text-center space-y-2 bg-gradient-to-b from-green-50 to-white shadow-sm">
                          <div className="text-sm text-green-600">
                            Overall Accuracy
                          </div>
                          <div className="text-4xl font-bold text-green-700">
                            {(batchStats.overallAccuracy * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-500">
                            {batchStats.total} samples tested
                          </div>
                        </div>

                        <div className="border rounded-lg p-5 text-center space-y-2 bg-gradient-to-b from-yellow-50 to-white shadow-sm">
                          <div className="text-sm text-yellow-600">
                            Arousal Accuracy
                          </div>
                          <div className="text-4xl font-bold text-yellow-700">
                            {(batchStats.arousalAccuracy * 100).toFixed(1)}%
                          </div>
                          <div className="bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                            <div
                              className="bg-yellow-500 h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${batchStats.arousalAccuracy * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="border rounded-lg p-5 text-center space-y-2 bg-gradient-to-b from-green-50 to-white shadow-sm">
                          <div className="text-sm text-green-600">
                            Valence Accuracy
                          </div>
                          <div className="text-4xl font-bold text-green-700">
                            {(batchStats.valenceAccuracy * 100).toFixed(1)}%
                          </div>
                          <div className="bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                            <div
                              className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${batchStats.valenceAccuracy * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Results Table */}
                      <div className="mt-6">
                        <div className="text-lg font-medium mb-3 text-green-800 flex items-center gap-2">
                          <ListChecks className="h-5 w-5" />
                          Sample Results
                        </div>
                        <div className="border rounded-lg overflow-hidden shadow-sm">
                          <table className="min-w-full">
                            <thead className="bg-green-50 border-b border-green-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                  Sample
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                  Arousal
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                  Valence
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                                  Confidence
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {batchPredictions.map((result, idx) => (
                                <tr key={idx} className="hover:bg-green-50">
                                  <td className="px-4 py-2 text-xs font-medium">
                                    {idx + 1}
                                  </td>
                                  <td className="px-4 py-2">
                                    {result.arousal && (
                                      <div className="flex items-center">
                                        <span className="text-xs font-medium">
                                          {result.arousal.class.toUpperCase()}
                                        </span>
                                        <Badge
                                          className={
                                            result.arousal.class ===
                                            result.ground_truth.arousal
                                              ? "ml-2 text-[0.6rem] py-0 bg-green-100 text-green-800 border-green-200"
                                              : "ml-2 text-[0.6rem] py-0 bg-red-100 text-red-800 border-red-200"
                                          }
                                        >
                                          {result.arousal.class ===
                                          result.ground_truth.arousal
                                            ? "✓"
                                            : "✗"}
                                        </Badge>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    {result.valence && (
                                      <div className="flex items-center">
                                        <span className="text-xs font-medium">
                                          {result.valence.class.toUpperCase()}
                                        </span>
                                        <Badge
                                          className={
                                            result.valence.class ===
                                            result.ground_truth.valence
                                              ? "ml-2 text-[0.6rem] py-0 bg-green-100 text-green-800 border-green-200"
                                              : "ml-2 text-[0.6rem] py-0 bg-red-100 text-red-800 border-red-200"
                                          }
                                        >
                                          {result.valence.class ===
                                          result.ground_truth.valence
                                            ? "✓"
                                            : "✗"}
                                        </Badge>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span>
                                        A:{" "}
                                        {(
                                          (result.arousal?.confidence || 0) *
                                          100
                                        ).toFixed(0)}
                                        %
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span>
                                        V:{" "}
                                        {(
                                          (result.valence?.confidence || 0) *
                                          100
                                        ).toFixed(0)}
                                        %
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comparison" className="space-y-6">
          <Card className="shadow-sm border-purple-100">
            <CardHeader className="bg-purple-50 rounded-t-lg border-b border-purple-100">
              <CardTitle className="text-2xl text-purple-800 flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Framework Comparison
              </CardTitle>
              <CardDescription>
                Comprehensive comparison of WESAD personalization and
                Cross-Dataset transfer learning frameworks
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Framework Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border rounded-lg p-6 space-y-4 shadow-sm bg-blue-50 border-blue-100">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-medium text-blue-800">
                      WESAD Framework
                    </h3>
                  </div>

                  <div className="px-3 py-2 bg-blue-100 rounded-md text-blue-800 text-sm italic">
                    "Subject-specific personalization through transfer learning"
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Core Approach:</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Personalization
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Model Design:</span>
                      <span>Four-model system</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Innovation:</span>
                      <span>Confidence-based selection</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Best Accuracy:</span>
                      <span className="font-medium text-blue-700">
                        88.16% (Adaptive)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dataset:</span>
                      <span>WESAD (Lab) - 15 subjects</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Features:</span>
                      <span>20 physiological markers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Emotion Model:</span>
                      <span>Discrete (4 classes)</span>
                    </div>
                  </div>

                  <Separator className="bg-blue-200" />

                  <div className="pt-2 space-y-3">
                    <div className="text-sm font-medium text-blue-800">
                      Model Performance
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Base Model:</span>
                          <span className="font-medium">86.36%</span>
                        </div>
                        <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: "86.36%" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Personal Model:</span>
                          <span className="font-medium">84.51%</span>
                        </div>
                        <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: "84.51%" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Ensemble Model:</span>
                          <span className="font-medium">87.52%</span>
                        </div>
                        <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: "87.52%" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Adaptive Model:</span>
                          <span className="font-medium">88.16%</span>
                        </div>
                        <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: "88.16%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6 space-y-4 shadow-sm bg-green-50 border-green-100">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-medium text-green-800">
                      Cross-Dataset Framework
                    </h3>
                  </div>

                  <div className="px-3 py-2 bg-green-100 rounded-md text-green-800 text-sm italic">
                    "Cross-domain knowledge transfer between datasets"
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Core Approach:</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Domain Adaptation
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Model Design:</span>
                      <span>Bidirectional adaptation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Innovation:</span>
                      <span>Domain gap reduction</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Best Accuracy:</span>
                      <span className="font-medium text-green-700">
                        80.27% (W→K Valence)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Datasets:</span>
                      <span>WESAD + K-EmoCon (In-wild)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Features:</span>
                      <span>9 common features</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Emotion Model:</span>
                      <span>Dimensional (arousal/valence)</span>
                    </div>
                  </div>

                  <Separator className="bg-green-200" />

                  <div className="pt-2 space-y-3">
                    <div className="text-sm font-medium text-green-800">
                      Transfer Performance
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>W→K Arousal:</span>
                          <span className="font-medium">63.14%</span>
                        </div>
                        <div className="bg-green-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-yellow-500 h-full rounded-full"
                            style={{ width: "63.14%" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>K→W Arousal:</span>
                          <span className="font-medium">65.57%</span>
                        </div>
                        <div className="bg-green-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-yellow-500 h-full rounded-full"
                            style={{ width: "65.57%" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>W→K Valence:</span>
                          <span className="font-medium">80.27%</span>
                        </div>
                        <div className="bg-green-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-600 h-full rounded-full"
                            style={{ width: "80.27%" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>K→W Valence:</span>
                          <span className="font-medium">61.62%</span>
                        </div>
                        <div className="bg-green-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: "61.62%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Architecture Section */}
              <div className="mt-8 pt-6 border-t">
                <div className="text-xl font-medium mb-6 text-purple-800 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Technical Architecture
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border rounded-lg p-5 space-y-4 shadow-sm bg-white">
                    <h3 className="font-medium text-lg text-blue-800 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      WESAD Architecture
                    </h3>

                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg bg-blue-50 border-blue-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-blue-100 text-blue-800 border-blue-200">
                          Base Model
                        </Badge>
                        <div className="text-sm">
                          <p>Trained on all subjects except target</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Captures universal emotion patterns
                          </p>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg bg-blue-50 border-blue-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-blue-100 text-blue-800 border-blue-200">
                          Personal Model
                        </Badge>
                        <div className="text-sm">
                          <p>Fine-tuned for each specific subject</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Transfer learning from base model
                          </p>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg bg-blue-50 border-blue-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-blue-100 text-blue-800 border-blue-200">
                          Ensemble Model
                        </Badge>
                        <div className="text-sm">
                          <p>Weighted combination of base and personal</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Subject-specific optimal weighting
                          </p>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg bg-blue-50 border-blue-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-blue-100 text-blue-800 border-blue-200">
                          Adaptive Model
                        </Badge>
                        <div className="text-sm">
                          <p>Dynamic selection between base/personal</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Confidence-based switching mechanism
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-5 space-y-4 shadow-sm bg-white">
                    <h3 className="font-medium text-lg text-green-800 flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-green-600" />
                      Cross-Dataset Architecture
                    </h3>

                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg bg-green-50 border-green-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-green-100 text-green-800 border-green-200">
                          Feature Mapping
                        </Badge>
                        <div className="text-sm">
                          <p>ECG/HR feature correspondence mapping</p>
                          <p className="text-xs text-green-700 mt-1">
                            Identifies common physiological markers
                          </p>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg bg-green-50 border-green-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-green-100 text-green-800 border-green-200">
                          Domain Adaptation
                        </Badge>
                        <div className="text-sm">
                          <p>CORAL, subspace alignment techniques</p>
                          <p className="text-xs text-green-700 mt-1">
                            Reduces domain gap between datasets
                          </p>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg bg-green-50 border-green-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-green-100 text-green-800 border-green-200">
                          Emotion Mapping
                        </Badge>
                        <div className="text-sm">
                          <p>Discrete-to-dimensional conversion</p>
                          <p className="text-xs text-green-700 mt-1">
                            Bridges different emotion models
                          </p>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg bg-green-50 border-green-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-green-100 text-green-800 border-green-200">
                          Bidirectional Evaluation
                        </Badge>
                        <div className="text-sm">
                          <p>Testing transfer in both directions</p>
                          <p className="text-xs text-green-700 mt-1">
                            Analyzing cross-dataset generalizability
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Importance Section */}
              <div className="mt-8 pt-6 border-t">
                <div className="text-xl font-medium mb-6 text-purple-800 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Feature Importance
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border rounded-lg p-5 space-y-4 shadow-sm bg-white">
                    <h3 className="font-medium text-lg text-blue-800 mb-4">
                      WESAD Features
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ECG_median</span>
                          <span className="font-medium">High importance</span>
                        </div>
                        <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: "85%" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>EMG_iqr</span>
                          <span className="font-medium">High importance</span>
                        </div>
                        <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: "80%" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ECG_energy</span>
                          <span className="font-medium">High importance</span>
                        </div>
                        <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: "78%" }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 mt-4">
                        <p>• Total of 20 physiological features used</p>
                        <p>
                          • Feature importance varies significantly between
                          subjects
                        </p>
                        <p>
                          • Selected using mutual information with class labels
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-5 space-y-4 shadow-sm bg-white">
                    <h3 className="font-medium text-lg text-green-800 mb-4">
                      Cross-Dataset Features
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ECG_max/HR_max</span>
                          <span className="font-medium">
                            Arousal prediction
                          </span>
                        </div>
                        <div className="bg-green-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-yellow-500 h-full rounded-full"
                            style={{ width: "75%" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ECG_energy/HR_energy</span>
                          <span className="font-medium">
                            Valence prediction
                          </span>
                        </div>
                        <div className="bg-green-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-600 h-full rounded-full"
                            style={{ width: "82%" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ECG_min/HR_min</span>
                          <span className="font-medium">Both dimensions</span>
                        </div>
                        <div className="bg-green-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: "70%" }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 mt-4">
                        <p>• 9 common features identified between datasets</p>
                        <p>
                          • Selected using mutual information with target
                          dimension
                        </p>
                        <p>
                          • ECG/HR features have highest cross-dataset stability
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications & Use Cases */}
              <div className="mt-8 pt-6 border-t">
                <div className="text-xl font-medium mb-6 text-purple-800 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Key Applications & Research Contributions
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border rounded-lg p-5 space-y-3 shadow-sm bg-blue-50 border-blue-100">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        When to use WESAD Framework
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm pl-6 list-disc">
                      <li>
                        When high accuracy is mission-critical (88%+ accuracy)
                      </li>
                      <li>For applications with laboratory-grade sensors</li>
                      <li>
                        When calibration with user is possible (minimal data
                        needed)
                      </li>
                      <li>For discrete emotion classification applications</li>
                      <li>
                        When adaptation to individual differences is important
                      </li>
                      <li>Personalized emotion monitoring in healthcare</li>
                    </ul>

                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="font-medium text-blue-800 mb-2">
                        Research Contributions
                      </div>
                      <ul className="space-y-2 text-sm pl-6 list-disc">
                        <li>
                          Novel adaptive selection mechanism between models
                        </li>
                        <li>
                          Achieving high accuracy with minimal calibration data
                        </li>
                        <li>
                          Addressing personalization gap in emotion recognition
                        </li>
                        <li>
                          Transfer learning efficiency from population to
                          individuals
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="border rounded-lg p-5 space-y-3 shadow-sm bg-green-50 border-green-100">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        When to use Cross-Dataset Framework
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm pl-6 list-disc">
                      <li>
                        For working across different data collection
                        environments
                      </li>
                      <li>
                        When using consumer-grade or variable quality sensors
                      </li>
                      <li>
                        When user calibration is not feasible or practical
                      </li>
                      <li>
                        For applications focused on arousal/valence dimensions
                      </li>
                      <li>
                        When feature compatibility is constrained across devices
                      </li>
                      <li>
                        For real-world deployment in naturalistic settings
                      </li>
                    </ul>

                    <div className="mt-4 pt-4 border-t border-green-200">
                      <div className="font-medium text-green-800 mb-2">
                        Research Contributions
                      </div>
                      <ul className="space-y-2 text-sm pl-6 list-disc">
                        <li>
                          Novel bidirectional evaluation of cross-dataset
                          transfer
                        </li>
                        <li>
                          Data-driven mapping between discrete and dimensional
                          emotions
                        </li>
                        <li>
                          Systematic identification of transferable
                          physiological features
                        </li>
                        <li>
                          Addressing cross-dataset generalizability gap (40% gap
                          reduction)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results History Component (if present) */}
              {resultsHistory.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="text-xl font-medium mb-4 text-purple-800 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Results History
                  </div>
                  <div className="border rounded-lg shadow-sm overflow-hidden">
                    <ScrollArea className="h-64">
                      <div className="p-4 space-y-3">
                        {resultsHistory.map((result, idx) => (
                          <div
                            key={idx}
                            className={`border rounded-lg p-3 hover:bg-slate-50 transition-colors ${
                              result.type === "wesad"
                                ? "border-blue-100"
                                : "border-green-100"
                            }`}
                          >
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {result.type === "wesad" ? (
                                  <Brain className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Share2 className="h-4 w-4 text-green-500" />
                                )}
                                <span className="font-medium text-sm">
                                  {result.type === "wesad"
                                    ? `WESAD | S${result.subject_id} | ${
                                        result.model_type || "Base"
                                      }`
                                    : `${
                                        result.direction === "wesad_to_kemocon"
                                          ? "W→K"
                                          : "K→W"
                                      } | Sample ${result.sample_index}`}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                {formatTimeDiff(result.timestamp)}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {result.type === "wesad" ? (
                                <>
                                  <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100">
                                    <span className="font-medium">
                                      Emotion:
                                    </span>{" "}
                                    <span className="text-blue-700">
                                      {result.base_model?.emotion_name ||
                                        result.predicted_emotion}
                                    </span>
                                  </div>
                                  <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100">
                                    <span className="font-medium">
                                      Accuracy:
                                    </span>{" "}
                                    <span className="text-blue-700">
                                      {result.model_metrics
                                        ? (
                                            result.model_metrics.accuracy * 100
                                          ).toFixed(1) + "%"
                                        : result.accuracy?.correct
                                        ? "Correct"
                                        : "Incorrect"}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  {result.arousal && (
                                    <div className="text-xs bg-yellow-50 p-2 rounded border border-yellow-100">
                                      <span className="font-medium">
                                        Arousal:
                                      </span>{" "}
                                      <span className="text-yellow-700">
                                        {result.arousal.class.toUpperCase()}
                                      </span>
                                      <Badge
                                        className={`ml-1 text-[0.6rem] py-0 ${
                                          result.arousal.class ===
                                          result.ground_truth?.arousal
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : "bg-red-100 text-red-800 border-red-200"
                                        }`}
                                      >
                                        {result.arousal.class ===
                                        result.ground_truth?.arousal
                                          ? "✓"
                                          : "✗"}
                                      </Badge>
                                    </div>
                                  )}
                                  {result.valence && (
                                    <div className="text-xs bg-green-50 p-2 rounded border border-green-100">
                                      <span className="font-medium">
                                        Valence:
                                      </span>{" "}
                                      <span className="text-green-700">
                                        {result.valence.class.toUpperCase()}
                                      </span>
                                      <Badge
                                        className={`ml-1 text-[0.6rem] py-0 ${
                                          result.valence.class ===
                                          result.ground_truth?.valence
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : "bg-red-100 text-red-800 border-red-200"
                                        }`}
                                      >
                                        {result.valence.class ===
                                        result.ground_truth?.valence
                                          ? "✓"
                                          : "✗"}
                                      </Badge>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DemoPage;
