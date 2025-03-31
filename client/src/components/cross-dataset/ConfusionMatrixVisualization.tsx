import React, { useState } from 'react';
import { useConfusionMatrices } from '@/hooks/useCrossDatasetData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, HelpCircle, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types for the confusion matrix data
interface ConfusionMatrixData {
  confusion_matrix: number[][];
  normalized_matrix: number[][];
  class_names: string[];
}

interface ConfusionMatricesData {
  target: string;
  wesad_to_kemocon: ConfusionMatrixData;
  kemocon_to_wesad: ConfusionMatrixData;
}

const ConfusionMatrixVisualization = () => {
  const [target, setTarget] = useState<'arousal' | 'valence'>('arousal');
  const [normalized, setNormalized] = useState(true);
  const { data, isLoading, error } = useConfusionMatrices(target);

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm border border-[#E0E0E0]">
        <CardHeader className="pb-4 bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <Skeleton className="h-8 w-64 mb-2 bg-[#E0E0E0]/50" />
          <Skeleton className="h-4 w-full max-w-md bg-[#E0E0E0]/50" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full rounded-lg bg-[#E0E0E0]/50" />
            <Skeleton className="h-80 w-full rounded-lg bg-[#E0E0E0]/50" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border border-[#F76C5E]/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load confusion matrices. {error?.toString()}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full shadow-sm border border-[#E0E0E0] bg-white">
      <CardHeader className="pb-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-[#2D3142]">
              Confusion Matrix Visualization
            </CardTitle>
            <CardDescription className="text-sm text-[#424242] mt-1">
              Visualizing classification outcomes across datasets for {target} detection
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="normalized-mode" 
                checked={normalized}
                onCheckedChange={setNormalized}
              />
              <Label htmlFor="normalized-mode" className="text-sm font-medium text-[#424242]">
                Normalized View
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-[#4F8A8B]" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border border-[#E0E0E0] shadow-md">
                    <p className="max-w-xs text-[#424242]">
                      Normalized view shows percentages of each actual class, while
                      absolute view shows raw counts.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs
          defaultValue="arousal"
          value={target}
          onValueChange={(value) => setTarget(value as 'arousal' | 'valence')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-[200px] mx-auto mb-6 bg-[#F5F5F5] border border-[#E0E0E0]">
            <TabsTrigger 
              value="arousal"
              className="data-[state=active]:bg-[#4ADEDE] data-[state=active]:text-white"
            >
              Arousal
            </TabsTrigger>
            <TabsTrigger 
              value="valence"
              className="data-[state=active]:bg-[#7BE495] data-[state=active]:text-white"
            >
              Valence
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={target}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value={target} className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ConfusionMatrix 
                    data={data.wesad_to_kemocon} 
                    title="WESAD → K-EmoCon"
                    description="Lab dataset to in-the-wild dataset"
                    normalized={normalized}
                    icon={<ArrowLeftRight className="h-4 w-4 ml-2 text-[#4464AD]" />}
                    target={target}
                  />
                  
                  <ConfusionMatrix 
                    data={data.kemocon_to_wesad} 
                    title="K-EmoCon → WESAD"
                    description="In-the-wild dataset to lab dataset"
                    normalized={normalized}
                    icon={<ArrowLeftRight className="h-4 w-4 ml-2 text-[#4F8A8B]" />}
                    target={target}
                    isReverse
                  />
                </div>
                
                <div className="mt-8">
                  <InterpretationGuide target={target} data={data} />
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const ConfusionMatrix = ({ 
  data, 
  title, 
  description, 
  normalized, 
  icon,
  target,
  isReverse = false
}: { 
  data: ConfusionMatrixData; 
  title: string; 
  description: string; 
  normalized: boolean; 
  icon: React.ReactNode;
  target: string;
  isReverse?: boolean;
}) => {
  // Get cell color based on value using the Biometric Spectrum theme
  const getCellColor = (value: number, isNormalized: boolean) => {
    const color = isReverse ? '#4F8A8B' : '#4464AD'; // Teal for reverse, Slate Blue for normal
    
    // For normalized values (0-1)
    if (isNormalized) {
      return `rgba(${hexToRgb(color)}, ${value.toFixed(2)})`;
    } else {
      // For absolute counts, scale based on max value
      const maxValue = Math.max(...data.confusion_matrix.flat());
      const intensity = maxValue > 0 ? value / maxValue : 0;
      return `rgba(${hexToRgb(color)}, ${intensity.toFixed(2)})`;
    }
  };

  // Helper function to convert hex to rgb
  function hexToRgb(hex: string) {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }

  // Get text color based on background intensity
  const getTextColor = (value: number, isNormalized: boolean) => {
    if (isNormalized) {
      return value > 0.5 ? 'text-white' : 'text-[#2D3142]';
    } else {
      const maxValue = Math.max(...data.confusion_matrix.flat());
      const intensity = maxValue > 0 ? value / maxValue : 0;
      return intensity > 0.5 ? 'text-white' : 'text-[#2D3142]';
    }
  };

  // Determine if the matrix shows a problematic pattern
  const hasProblems = () => {
    if (isReverse && target === 'arousal') {
      // Check for the case where K-EmoCon → WESAD predicts everything as Low
      const firstRow = data.normalized_matrix[0];
      return firstRow && firstRow[0] === 1.0 && firstRow[1] === 0.0;
    }
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`h-full shadow-sm 
        ${isReverse 
          ? 'border border-[#4F8A8B]/20' 
          : 'border border-[#4464AD]/20'}`}
      >
        <CardHeader className="pb-3 pt-4 bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <div className="flex items-center">
            <CardTitle className={`text-base font-bold ${isReverse ? 'text-[#4F8A8B]' : 'text-[#4464AD]'}`}>
              {title}
            </CardTitle>
            {icon}
          </div>
          <CardDescription className="text-xs text-[#424242]">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            <div className="relative overflow-hidden rounded-lg border border-[#E0E0E0]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F5F5]">
                    <th className="p-3 text-xs font-medium text-[#424242]"></th>
                    <th 
                      className="p-2 text-center text-xs font-medium text-[#424242]" 
                      colSpan={data.class_names.length}
                    >
                      Predicted
                    </th>
                  </tr>
                  <tr className="bg-[#F5F5F5]/50">
                    <th className="p-2"></th>
                    {data.class_names.map((name, i) => (
                      <th key={i} className="p-2 text-center text-xs font-medium text-[#2D3142]">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.class_names.map((name, rowIdx) => (
                    <tr key={rowIdx}>
                      {rowIdx === 0 && (
                        <th 
                          className="p-2 text-xs font-medium text-[#424242] bg-[#F5F5F5]/50" 
                          rowSpan={data.class_names.length}
                        >
                          <div className="transform -rotate-90 whitespace-nowrap h-16 flex items-center justify-center">
                            Actual
                          </div>
                        </th>
                      )}
                      <th className="p-2 text-center font-medium bg-[#F5F5F5]/30 text-sm text-[#2D3142]">
                        {name}
                      </th>
                      {normalized
                        ? data.normalized_matrix[rowIdx].map((value, colIdx) => (
                            <motion.td 
                              key={colIdx} 
                              className={`p-4 text-center font-medium ${getTextColor(value, true)}`}
                              style={{ backgroundColor: getCellColor(value, true) }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: colIdx * 0.1 }}
                            >
                              {(value * 100).toFixed(1)}%
                            </motion.td>
                          ))
                        : data.confusion_matrix[rowIdx].map((value, colIdx) => (
                            <motion.td 
                              key={colIdx} 
                              className={`p-4 text-center font-medium ${getTextColor(value, false)}`}
                              style={{ backgroundColor: getCellColor(value, false) }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: colIdx * 0.1 }}
                            >
                              {value}
                            </motion.td>
                          ))
                      }
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-xs text-[#424242] flex items-center">
              <span className="inline-block w-3 h-3 rounded-sm mr-2" 
                style={{backgroundColor: isReverse ? '#4F8A8B' : '#4464AD'}}></span>
              <span className="mr-3">High</span>
              <span className="inline-block w-3 h-3 rounded-sm mr-2" 
                style={{backgroundColor: isReverse ? 'rgba(79, 138, 139, 0.5)' : 'rgba(68, 100, 173, 0.5)'}}></span>
              <span className="mr-3">Medium</span>
              <span className="inline-block w-3 h-3 rounded-sm mr-2" 
                style={{backgroundColor: isReverse ? 'rgba(79, 138, 139, 0.1)' : 'rgba(68, 100, 173, 0.1)'}}></span>
              <span>Low</span>
            </div>
            
            {hasProblems() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-2 bg-[#F76C5E]/10 border border-[#F76C5E]/20 rounded-md text-[#F76C5E] text-xs"
              >
                <strong>Note:</strong> This model predicts all instances as the "Low" class, indicating poor cross-dataset generalization.
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const InterpretationGuide = ({ target, data }: { target: string, data: ConfusionMatricesData }) => {
  // Analyze the data to provide meaningful insights
  const getInsights = () => {
    if (target === 'arousal') {
      const w2kMatrix = data.wesad_to_kemocon.normalized_matrix;
      const k2wMatrix = data.kemocon_to_wesad.normalized_matrix;
      
      if (k2wMatrix[0][0] === 1.0 && k2wMatrix[1][0] === 1.0) {
        return {
          key: "poor_generalization",
          message: "The K-EmoCon → WESAD model shows poor generalization, predicting all instances as 'Low' arousal regardless of the true class. This suggests that the in-the-wild dataset features don't adequately transfer to the lab environment."
        };
      } else if (w2kMatrix[0][0] < 0.8 && w2kMatrix[1][1] < 0.3) {
        return {
          key: "weak_transfer",
          message: "The WESAD → K-EmoCon model shows limited success, with below 80% accuracy for 'Low' arousal and poor recognition of 'High' arousal states. This suggests partial but incomplete transferability of arousal features across datasets."
        };
      }
    } else if (target === 'valence') {
      const w2kMatrix = data.wesad_to_kemocon.normalized_matrix;
      const k2wMatrix = data.kemocon_to_wesad.normalized_matrix;
      
      if (w2kMatrix[0][0] > 0.99 && w2kMatrix[1][0] > 0.99) {
        return {
          key: "valence_bias",
          message: "The WESAD → K-EmoCon model shows strong bias toward predicting 'Low' valence, suggesting that valence classification doesn't transfer well from lab to in-the-wild settings."
        };
      } else if (k2wMatrix[0][0] > 0.93 && k2wMatrix[1][0] > 0.9) {
        return {
          key: "imbalanced_learning",
          message: "Both models tend to predict 'Low' valence more frequently, which could indicate an imbalance in the training data or fundamental differences in how valence manifests in physiological signals across contexts."
        };
      }
    }
    
    return {
      key: "general",
      message: "The confusion matrices reveal challenges in cross-dataset emotion recognition. Perfect transfer learning would show high values along the diagonal of each matrix."
    };
  };
  
  const insights = getInsights();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-[#F5F5F5] p-4 rounded-lg border border-[#E0E0E0]"
    >
      <h3 className="text-sm font-semibold mb-2 text-[#2D3142]">Interpretation Guide</h3>
      <p className="text-sm text-[#424242]">{insights.message}</p>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-xs">
          <h4 className="font-medium mb-1 text-[#2D3142]">Reading the Matrix:</h4>
          <ul className="list-disc list-inside space-y-1 text-[#424242]">
            <li>Diagonal elements (top-left to bottom-right) represent correct classifications</li>
            <li>Off-diagonal elements represent misclassifications</li>
            <li>Higher values along diagonal indicate better performance</li>
          </ul>
        </div>
        <div className="text-xs">
          <h4 className="font-medium mb-1 text-[#2D3142]">Cross-Dataset Challenge:</h4>
          <ul className="list-disc list-inside space-y-1 text-[#424242]">
            <li>Domain shift between datasets affects model generalization</li>
            <li>Different recording environments lead to feature distribution changes</li>
            <li>Success varies between arousal and valence dimensions</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfusionMatrixVisualization;