import React, { useState } from 'react';
import { useCrossDatasetOverview } from '@/hooks/useCrossDatasetData';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, ArrowRight, Info, BarChart2, Database, TrendingUp, 
  ArrowUpRight, ArrowDownRight, HelpCircle, Layers, Zap,
  TrendingDown, CheckCircle, XCircle, Activity, ArrowUpDown,
  Award, Eye, FileText, ExternalLink, Bolt
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the data structure
interface CrossDatasetMetrics {
  accuracy: number;
  f1_score: number;
  balanced_accuracy: number;
  roc_auc: number;
  pr_auc: number;
  threshold: number;
  adaptation_method?: string;
  direction?: string;
  target?: string;
}

interface AdaptationInfo {
  success_rate: number;
  best_direction: string;
  method?: string;
}

interface TargetMetrics {
  wesad_to_kemocon: CrossDatasetMetrics;
  kemocon_to_wesad: CrossDatasetMetrics;
}

interface DatasetInfo {
  subjects?: number;
  participants?: number;
  total_segments?: number;
  segment_size_seconds?: number;
  sampling_rate_hz?: number;
  description?: string;
  features?: string[];
}

interface OverviewData {
  average_metrics: {
    accuracy: number;
    f1_score: number;
    roc_auc: number;
  };
  arousal: TargetMetrics;
  valence: TargetMetrics;
  datasets: {
    WESAD: DatasetInfo;
    "K-EmoCon": DatasetInfo;
  };
  adaptation: {
    arousal: AdaptationInfo;
    valence: AdaptationInfo;
  };
}

// Helper functions for metric grading
const getPerformanceGrade = (value: number): string => {
  if (value >= 0.8) return "excellent";
  if (value >= 0.7) return "good";
  if (value >= 0.6) return "moderate";
  if (value >= 0.5) return "poor";
  return "failed";
};

const getPerformanceColor = (value: number): string => {
  if (value >= 0.8) return "bg-[#7BE495]";
  if (value >= 0.7) return "bg-[#4F8A8B]";
  if (value >= 0.6) return "bg-[#4464AD]";
  if (value >= 0.5) return "bg-[#B8B8FF]";
  return "bg-[#F76C5E]";
};

const getPerformanceTextColor = (value: number): string => {
  if (value >= 0.8) return "text-[#7BE495]";
  if (value >= 0.7) return "text-[#4F8A8B]";
  if (value >= 0.6) return "text-[#4464AD]";
  if (value >= 0.5) return "text-[#B8B8FF]";
  return "text-[#F76C5E]";
};

const getPerformanceDescription = (value: number, metric: string): string => {
  if (value >= 0.8) return `Excellent ${metric.toLowerCase()} demonstrates strong cross-dataset generalization`;
  if (value >= 0.7) return `Good ${metric.toLowerCase()} indicates reasonable transfer learning`;
  if (value >= 0.6) return `Moderate ${metric.toLowerCase()} suggests partial domain transfer`;
  if (value >= 0.5) return `Poor ${metric.toLowerCase()} indicates weak cross-dataset generalization`;
  return `Failed ${metric.toLowerCase()} shows no effective cross-dataset transfer`;
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

// Tooltip component for metric explanations
const MetricTooltip: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ 
  title, 
  description, 
  children 
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-white border border-[#E0E0E0] shadow-md p-3">
        <h4 className="font-medium text-[#2D3142] mb-1">{title}</h4>
        <p className="text-xs text-[#424242]">{description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Badge component for performance grades
const PerformanceBadge: React.FC<{ value: number, type?: string }> = ({ value, type = "neutral" }) => {
  const grade = getPerformanceGrade(value);
  const getIcon = () => {
    if (grade === "excellent") return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
    if (grade === "good") return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
    if (grade === "moderate") return <ArrowUpDown className="h-3.5 w-3.5 mr-1" />;
    if (grade === "poor") return <TrendingDown className="h-3.5 w-3.5 mr-1" />;
    return <XCircle className="h-3.5 w-3.5 mr-1" />;
  };
  
  const getVariant = () => {
    if (grade === "excellent") return "bg-[#7BE495]/20 text-[#2D3142] border-[#7BE495]/30";
    if (grade === "good") return "bg-[#4F8A8B]/20 text-[#2D3142] border-[#4F8A8B]/30";
    if (grade === "moderate") return "bg-[#4464AD]/20 text-[#2D3142] border-[#4464AD]/30";
    if (grade === "poor") return "bg-[#B8B8FF]/20 text-[#2D3142] border-[#B8B8FF]/30";
    return "bg-[#F76C5E]/20 text-[#2D3142] border-[#F76C5E]/30";
  };
  
  return (
    <Badge className={`text-xs font-medium inline-flex items-center ${getVariant()}`}>
      {getIcon()}
      {grade.charAt(0).toUpperCase() + grade.slice(1)}
    </Badge>
  );
};

// Performance metric bar component with animations
const MetricBar: React.FC<{ 
  label: string;
  value: number;
  tooltipTitle: string;
  tooltipDescription: string;
  comparison?: number;
}> = ({ label, value, tooltipTitle, tooltipDescription, comparison }) => {
  const performanceColor = getPerformanceColor(value);
  const difference = comparison !== undefined ? value - comparison : undefined;
  
  return (
    <div className="space-y-1.5 mb-4">
      <div className="flex justify-between items-center">
        <MetricTooltip title={tooltipTitle} description={tooltipDescription}>
          <div className="flex items-center text-sm font-medium text-[#2D3142]">
            {label}
          </div>
        </MetricTooltip>
        <div className="flex items-center">
          <div className={`text-sm font-bold ${getPerformanceTextColor(value)}`}>
            {(value * 100).toFixed(1)}%
          </div>
          {difference !== undefined && (
            <div className={`ml-2 text-xs flex items-center ${difference > 0 ? 'text-[#7BE495]' : difference < 0 ? 'text-[#F76C5E]' : 'text-[#424242]'}`}>
              {difference > 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : difference < 0 ? (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              ) : null}
              {Math.abs(difference * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-[#F5F5F5] rounded-full h-2 overflow-hidden">
        <motion.div 
          className={`h-full ${performanceColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="text-xs text-[#424242] italic">
        {getPerformanceDescription(value, label)}
      </div>
    </div>
  );
};

// Domain adaptation visualization component
const DomainAdaptationVisual: React.FC<{ success_rate: number; method?: string }> = ({ 
  success_rate, 
  method 
}) => {
  // Calculate the positioning for the arrow
  const arrowPosition = Math.min(Math.max(success_rate / 100, 0), 1) * 100;
  
  return (
    <div className="border border-[#E0E0E0] rounded-lg p-4 bg-[#F5F5F5] mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-[#2D3142]">
          Domain Gap Reduction
        </h4>
        <span className="text-xs text-[#424242]">
          {method || "Ensemble"} Method
        </span>
      </div>
      
      <div className="relative w-full h-10 mt-6 mb-2">
        {/* Markers */}
        <div className="absolute w-full flex justify-between text-xs text-[#424242] -top-5">
          0%
          25%
          50%
          75%
          100%
        </div>
        
        {/* Bar with gradient */}
        <div className="absolute w-full h-2 rounded-full bg-gradient-to-r from-[#F76C5E] via-[#B8B8FF] to-[#7BE495] top-6">
          {/* Indicator */}
          <motion.div 
            className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#4464AD] shadow-md -mt-1 -ml-2"
            initial={{ left: 0 }}
            animate={{ left: `${arrowPosition}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-xs mt-2">
        <span className="text-[#F76C5E]">High Domain Gap</span>
        <span className="font-medium text-[#4464AD]">{success_rate.toFixed(1)}% Reduction</span>
        <span className="text-[#7BE495]">Low Domain Gap</span>
      </div>
    </div>
  );
};

// Performance card for a specific direction
const PerformanceCard: React.FC<{ 
  title: string;
  target: string;
  metrics: CrossDatasetMetrics;
  adaptation: AdaptationInfo;
  bestDirection: boolean;
  comparisonMetrics?: CrossDatasetMetrics;
}> = ({ 
  title, 
  target, 
  metrics, 
  adaptation,
  bestDirection,
  comparisonMetrics
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Card className="mb-6 border border-[#E0E0E0] shadow-sm">
      <CardHeader className="pb-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-[#2D3142]">
              {title}
            </span>
            {bestDirection && (
              <Badge className="bg-[#4F8A8B]/20 text-[#2D3142] border-[#4F8A8B]/30">
                <Award className="h-3.5 w-3.5 text-[#4F8A8B] mr-1" />
                Best Direction
              </Badge>
            )}
            <MetricTooltip 
              title="Transfer Direction" 
              description="This indicates which dataset the model was trained on (source) and which dataset it was tested on (target)."
            >
              <div className="text-[#424242] cursor-help">
                <HelpCircle className="h-4 w-4" />
              </div>
            </MetricTooltip>
          </div>
        </div>
        <CardDescription className="text-[#424242]">
          {target.charAt(0).toUpperCase() + target.slice(1)} recognition transfer learning
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1">
          <MetricBar 
            label="Accuracy" 
            value={metrics.accuracy} 
            tooltipTitle="Accuracy" 
            tooltipDescription="Percentage of correctly classified instances across all classes."
            comparison={comparisonMetrics?.accuracy}
          />
          <MetricBar 
            label="F1 Score" 
            value={metrics.f1_score} 
            tooltipTitle="F1 Score" 
            tooltipDescription="Harmonic mean of precision and recall, balancing both metrics."
            comparison={comparisonMetrics?.f1_score}
          />
          <MetricBar 
            label="Balanced Accuracy" 
            value={metrics.balanced_accuracy} 
            tooltipTitle="Balanced Accuracy" 
            tooltipDescription="Average of sensitivity and specificity, useful for imbalanced classes."
            comparison={comparisonMetrics?.balanced_accuracy}
          />
          <MetricBar 
            label="ROC AUC" 
            value={metrics.roc_auc} 
            tooltipTitle="ROC AUC" 
            tooltipDescription="Area Under the Receiver Operating Characteristic curve, measuring model's ability to discriminate between classes."
            comparison={comparisonMetrics?.roc_auc}
          />
          
          <DomainAdaptationVisual 
            success_rate={adaptation.success_rate} 
            method={adaptation.method}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-2 text-xs border-[#E0E0E0] text-[#2D3142] hover:bg-[#F5F5F5] hover:text-[#4464AD]"
          >
            {showDetails ? "Hide Details" : "Show Details"}
            {showDetails ? 
              <ArrowUpDown className="ml-1 h-3 w-3" /> : 
              <ArrowRight className="ml-1 h-3 w-3" />
            }
          </Button>
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                className="mt-3 space-y-3 pt-3 border-t border-[#E0E0E0]"
                {...fadeIn}
              >
                <div className="grid grid-cols-2 gap-2 bg-[#F5F5F5] p-2 rounded-md">
                  <div className="text-xs flex justify-between">
                    <span className="text-[#424242]">
                      PR-AUC:
                    </span>
                    <span className="font-medium text-[#2D3142]">
                      {(metrics.pr_auc * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="text-xs flex justify-between">
                    <span className="text-[#424242]">
                      Decision Threshold:
                    </span>
                    <span className="font-medium text-[#2D3142]">
                      {metrics.threshold.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-[#4464AD]/10 rounded-md p-3">
                  <div className="text-sm font-medium text-[#2D3142] mb-1 flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-[#4464AD]" />
                    Technical Summary
                  </div>

                  <div className="text-xs text-[#424242]">
                    {metrics.accuracy >= 0.7 
                      ? `Strong transfer learning performance with ${(metrics.accuracy * 100).toFixed(1)}% accuracy despite domain differences.` 
                      : metrics.accuracy >= 0.6
                      ? `Moderate transfer learning with some generalization challenges, achieving ${(metrics.accuracy * 100).toFixed(1)}% accuracy.`
                      : `Limited cross-dataset generalization with accuracy of ${(metrics.accuracy * 100).toFixed(1)}%, suggesting significant domain shift.`
                    }
                    {metrics.balanced_accuracy < 0.55 && metrics.accuracy > 0.6 && 
                      " Note: Low balanced accuracy suggests possible class imbalance issues."
                    }
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

// Overall metric card
const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, icon, description }) => (
  <Card className="border border-[#E0E0E0] shadow-sm">
    <CardContent className="pt-6">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start mb-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h3 className="font-medium text-sm text-[#2D3142]">
                {title}
                {description && <HelpCircle className="h-3.5 w-3.5 ml-1 text-[#B8B8FF] inline cursor-help" />}
              </h3>
            </div>
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipContent className="max-w-xs bg-white border border-[#E0E0E0] shadow-md p-3">
                    <p className="text-xs text-[#424242]">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-[#4464AD]">
            {icon}
          </div>
        </div>

        <div className="text-3xl font-bold text-[#2D3142]">
          {(value * 100).toFixed(1)}%
        </div>

        <div className="text-xs text-[#424242]">
          {getPerformanceDescription(value, title)}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Dataset info card component
const DatasetInfoCard: React.FC<{ 
  name: string; 
  info: DatasetInfo;
  isSource?: boolean;
}> = ({ name, info, isSource }) => (
  <Card className="border border-[#E0E0E0] shadow-sm bg-white">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg text-[#2D3142]">
        {name}
        {isSource !== undefined && (
          <Badge className={`ml-2 text-xs ${isSource ? "bg-[#4464AD]/20 text-[#2D3142] border-[#4464AD]/30" : "bg-[#4F8A8B]/20 text-[#2D3142] border-[#4F8A8B]/30"}`}>
            {isSource ? "Source" : "Target"}
          </Badge>
        )}
      </CardTitle>
      <CardDescription className="text-[#424242]">
        {info.description || "Dataset information"}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#424242]">
            Subjects:
          </span>
          <span className="text-sm font-medium text-[#2D3142]">
            {info.subjects || info.participants}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#424242]">
            Segments:
          </span>
          <span className="text-sm font-medium text-[#2D3142]">
            {info.total_segments}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#424242]">
            Sampling:
          </span>
          <span className="text-sm font-medium text-[#2D3142]">
            {info.sampling_rate_hz} Hz
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#424242]">
            Window:
          </span>
          <span className="text-sm font-medium text-[#2D3142]">
            {info.segment_size_seconds}s
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Key insight card
const InsightCard: React.FC<{ 
  target: string;
  bestDirection: string;
  gap_reduction: number;
}> = ({ target, bestDirection, gap_reduction }) => {
  const getInsightText = () => {
    if (bestDirection === "wesad_to_kemocon") {
      return `Models trained on lab data (WESAD) transfer better to real-world settings (K-EmoCon) for ${target} recognition than vice versa.`;
    } else {
      return `Models trained on in-the-wild data (K-EmoCon) transfer better to lab settings (WESAD) for ${target} recognition than vice versa.`;
    }
  };
  
  return (
    <Card className="border border-[#E0E0E0] shadow-sm bg-[#4464AD]/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-[#2D3142] flex items-center">
          <Bolt className="h-5 w-5 mr-2 text-[#4464AD]" />
          Key Insight: {target.charAt(0).toUpperCase() + target.slice(1)} Recognition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#424242] mb-3">
          {getInsightText()}
        </p>

        <div className="flex items-center text-sm font-medium text-[#4F8A8B]">
          <Activity className="h-4 w-4 mr-1" />
          Domain gap reduction: {gap_reduction.toFixed(1)}%
        </div>
      </CardContent>
    </Card>
  );
};

// Main component
const OverviewDashboard: React.FC = () => {
  const { data, isLoading, error } = useCrossDatasetOverview();
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState<'arousal' | 'valence'>('arousal');

  if (isLoading) {
    return (
      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 bg-[#E0E0E0]/50" />
          <Skeleton className="h-4 w-1/2 bg-[#E0E0E0]/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full bg-[#E0E0E0]/50" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full bg-[#E0E0E0]/50" />
              <Skeleton className="h-24 w-full bg-[#E0E0E0]/50" />
              <Skeleton className="h-24 w-full bg-[#E0E0E0]/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border-[#F76C5E]/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load cross-dataset overview data. {error?.toString()}</AlertDescription>
      </Alert>
    );
  }

  // Cast data to our type for better TypeScript support
  const overviewData = data as unknown as OverviewData;

  return (
    <div className="space-y-6">
      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl text-[#2D3142]">
                Cross-Dataset Emotion Recognition
              </CardTitle>
              <CardDescription className="text-[#424242]">
                Analyzing physiological emotion recognition performance across laboratory and in-the-wild datasets
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#4464AD]/20 text-[#2D3142] border-[#4464AD]/30 flex items-center">
                <Database className="h-3.5 w-3.5 mr-1 text-[#4464AD]" />
                WESAD: {overviewData.datasets.WESAD.subjects} subjects
              </Badge>
              <Badge className="bg-[#4F8A8B]/20 text-[#2D3142] border-[#4F8A8B]/30 flex items-center">
                <Database className="h-3.5 w-3.5 mr-1 text-[#4F8A8B]" />
                K-EmoCon: {overviewData.datasets["K-EmoCon"].participants} participants
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowComparison(!showComparison)}
                className="text-xs font-medium border-[#4464AD]/20 text-[#4464AD] hover:bg-[#4464AD]/10"
              >
                {showComparison ? (
                  <>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Hide Comparison
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Show Comparison
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {showComparison && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-[#2D3142]" />
                <h3 className="text-lg font-semibold text-[#2D3142]">
                  Dataset Comparison
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <DatasetInfoCard name="WESAD" info={overviewData.datasets.WESAD} />
                <DatasetInfoCard name="K-EmoCon" info={overviewData.datasets["K-EmoCon"]} />
              </div>
            </div>
          )}

          <Tabs 
            defaultValue="arousal" 
            value={activeTab}
            onValueChange={value => setActiveTab(value as 'arousal' | 'valence')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full md:w-80 p-1 bg-[#F5F5F5] border border-[#E0E0E0]">
              <TabsTrigger 
                value="arousal"
                className="data-[state=active]:bg-[#4ADEDE]/20 data-[state=active]:text-[#4464AD] data-[state=active]:font-medium"
              >
                Arousal
              </TabsTrigger>
              <TabsTrigger 
                value="valence"
                className="data-[state=active]:bg-[#7BE495]/20 data-[state=active]:text-[#4F8A8B] data-[state=active]:font-medium"
              >
                Valence
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="arousal" className="pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <PerformanceCard 
                    title={
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-[#4464AD]/20 text-[#4464AD] border-[#4464AD]/30">WESAD</Badge>
                        <ArrowRight className="h-4 w-4 text-[#424242] mx-1" />
                        <Badge className="bg-[#4F8A8B]/20 text-[#4F8A8B] border-[#4F8A8B]/30">K-EmoCon</Badge>
                      </div>
                    }
                    target="arousal"
                    metrics={overviewData.arousal.wesad_to_kemocon}
                    adaptation={{
                      ...overviewData.adaptation.arousal,
                      method: overviewData.arousal.wesad_to_kemocon.adaptation_method || "ensemble"
                    }}
                    bestDirection={overviewData.adaptation.arousal.best_direction === 'wesad_to_kemocon'}
                    comparisonMetrics={showComparison ? overviewData.arousal.kemocon_to_wesad : undefined}
                  />
                  <PerformanceCard 
                    title={
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-[#4F8A8B]/20 text-[#4F8A8B] border-[#4F8A8B]/30">K-EmoCon</Badge>
                        <ArrowRight className="h-4 w-4 text-[#424242] mx-1" />
                        <Badge className="bg-[#4464AD]/20 text-[#4464AD] border-[#4464AD]/30">WESAD</Badge>
                      </div>
                    }
                    target="arousal"
                    metrics={overviewData.arousal.kemocon_to_wesad}
                    adaptation={{
                      ...overviewData.adaptation.arousal,
                      method: overviewData.arousal.kemocon_to_wesad.adaptation_method || "ensemble"
                    }}
                    bestDirection={overviewData.adaptation.arousal.best_direction === 'kemocon_to_wesad'}
                    comparisonMetrics={showComparison ? overviewData.arousal.wesad_to_kemocon : undefined}
                  />
                </div>
                <InsightCard
                  target="arousal"
                  bestDirection={overviewData.adaptation.arousal.best_direction}
                  gap_reduction={overviewData.adaptation.arousal.success_rate}
                />
              </TabsContent>
              <TabsContent value="valence" className="pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <PerformanceCard 
                    title={
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-[#4464AD]/20 text-[#4464AD] border-[#4464AD]/30">WESAD</Badge>
                        <ArrowRight className="h-4 w-4 text-[#424242] mx-1" />
                        <Badge className="bg-[#4F8A8B]/20 text-[#4F8A8B] border-[#4F8A8B]/30">K-EmoCon</Badge>
                      </div>
                    }
                    target="valence"
                    metrics={overviewData.valence.wesad_to_kemocon}
                    adaptation={{
                      ...overviewData.adaptation.valence,
                      method: overviewData.valence.wesad_to_kemocon.adaptation_method || "ensemble"
                    }}
                    bestDirection={overviewData.adaptation.valence.best_direction === 'wesad_to_kemocon'}
                    comparisonMetrics={showComparison ? overviewData.valence.kemocon_to_wesad : undefined}
                  />
                  <PerformanceCard 
                    title={
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-[#4F8A8B]/20 text-[#4F8A8B] border-[#4F8A8B]/30">K-EmoCon</Badge>
                        <ArrowRight className="h-4 w-4 text-[#424242] mx-1" />
                        <Badge className="bg-[#4464AD]/20 text-[#4464AD] border-[#4464AD]/30">WESAD</Badge>
                      </div>
                    }
                    target="valence"
                    metrics={overviewData.valence.kemocon_to_wesad}
                    adaptation={{
                      ...overviewData.adaptation.valence,
                      method: overviewData.valence.kemocon_to_wesad.adaptation_method || "ensemble"
                    }}
                    bestDirection={overviewData.adaptation.valence.best_direction === 'kemocon_to_wesad'}
                    comparisonMetrics={showComparison ? overviewData.valence.wesad_to_kemocon : undefined}
                  />
                </div>
                <InsightCard
                  target="valence"
                  bestDirection={overviewData.adaptation.valence.best_direction}
                  gap_reduction={overviewData.adaptation.valence.success_rate}
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="pt-6 border-t border-[#E0E0E0]">
            <h3 className="text-xl font-semibold text-[#2D3142] mb-4">
              Overall Performance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard 
                title="Average Accuracy" 
                value={overviewData.average_metrics.accuracy} 
                icon={<BarChart2 className="h-6 w-6" />}
                description="Average accuracy across all models and directions for both arousal and valence"
              />
              <MetricCard 
                title="Average F1 Score" 
                value={overviewData.average_metrics.f1_score} 
                icon={<Activity className="h-6 w-6" />}
                description="Average F1 score (balancing precision and recall) across all models and directions"
              />
              <MetricCard 
                title="Average ROC AUC" 
                value={overviewData.average_metrics.roc_auc} 
                icon={<TrendingUp className="h-6 w-6" />}
                description="Average area under the ROC curve, measuring discrimination ability across all models"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#E0E0E0]">
            <div className="bg-[#F5F5F5] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#2D3142] mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-[#4464AD]" />
                Research Insights
              </h3>

              <p className="text-[#424242] mb-4">
                Cross-dataset emotion recognition demonstrates the challenges of transferring physiological emotion models 
                between different contexts. The {overviewData.average_metrics.accuracy >= 0.7 ? "strong" : overviewData.average_metrics.accuracy >= 0.6 ? "moderate" : "limited"} performance 
                suggests that {overviewData.average_metrics.accuracy >= 0.65 ? "physiological markers of emotion have meaningful consistency across settings" : "emotional expressions vary significantly between laboratory and real-world environments"}.
              </p>

              <Button 
                variant="outline" 
                className="bg-white text-[#4464AD] border-[#4464AD]/20 hover:bg-[#4464AD]/10"
                asChild
              >
                <a href="/documentation/cross-dataset" target="_blank">
                  <FileText className="h-4 w-4 mr-2" />
                  More Details
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewDashboard;