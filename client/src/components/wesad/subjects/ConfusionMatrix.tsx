// components/subjects/ConfusionMatrix.tsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjectData } from "@/hooks/useWesadData";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle2, BarChart2 } from "lucide-react";

interface ConfusionMatrixProps {
  subjectId: number;
  modelType: string;
}

export function ConfusionMatrix({ subjectId, modelType }: ConfusionMatrixProps) {
  const { data, isLoading, error } = useSubjectData(subjectId);
  
  const classNames = ['Baseline', 'Stress', 'Amusement', 'Meditation'];
  
  // Model-specific colors from Biometric Spectrum palette
  const getModelColor = () => {
    switch(modelType) {
      case 'base': return '#4464AD'; // Slate Blue
      case 'personal': return '#4F8A8B'; // Teal
      case 'ensemble': return '#B8B8FF'; // Lavender
      case 'adaptive': return '#7BE495'; // Mint
      default: return '#2D3142'; // Deep Indigo
    }
  };
  
  if (isLoading) {
    return (
      <Card className="h-full border border-[#E0E0E0] shadow-sm">
        <CardHeader className="pb-2 bg-[#F5F5F5]/50 border-b border-[#E0E0E0]">
          <CardTitle className="text-[#2D3142] flex items-center gap-2">
            <BarChart2 className="h-4 w-4" style={{ color: getModelColor() }} />
            {modelType.charAt(0).toUpperCase() + modelType.slice(1)} Model
            <Badge variant="outline" className="ml-2 bg-[#F5F5F5] text-[#424242] border-[#E0E0E0]">
              Loading
            </Badge>
          </CardTitle>
          <CardDescription className="text-[#424242]">Subject S{subjectId}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="w-full h-64 bg-[#E0E0E0]/50" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data || !data.models[modelType]) {
    return (
      <Card className="h-full border border-[#E0E0E0] shadow-sm">
        <CardHeader className="pb-2 bg-[#F5F5F5]/50 border-b border-[#E0E0E0]">
          <CardTitle className="text-[#2D3142] flex items-center gap-2">
            <BarChart2 className="h-4 w-4" style={{ color: getModelColor() }} />
            {modelType.charAt(0).toUpperCase() + modelType.slice(1)} Model
            <Badge variant="destructive" className="ml-2 bg-[#F76C5E]/10 text-[#F76C5E] border-[#F76C5E]/20">
              Error
            </Badge>
          </CardTitle>
          <CardDescription className="text-[#424242]">Subject S{subjectId}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#E0E0E0] rounded-md">
            <div className="flex flex-col items-center text-center gap-2">
              <AlertCircle className="h-8 w-8 text-[#F76C5E]" />
              <p className="text-sm text-[#424242]">Failed to load confusion matrix data.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const matrix = data.models[modelType].confusion_matrix;
  const accuracy = data.models[modelType].accuracy;
  const f1Score = data.models[modelType].f1_score;
  
  // Calculate totals
  const rowTotals = matrix.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = matrix[0].map((_, colIndex) => 
    matrix.reduce((sum, row) => sum + row[colIndex], 0)
  );
  const totalSamples = rowTotals.reduce((a, b) => a + b, 0);
  
  // Calculate correct/incorrect counts
  const correctCount = matrix.reduce((sum, row, i) => sum + row[i], 0);
  const incorrectCount = totalSamples - correctCount;
  
  // Model specific color for badges
  const modelColor = getModelColor();
  
  return (
    <Card className="h-full border border-[#E0E0E0] shadow-sm">
      <CardHeader className="pb-2 bg-[#F5F5F5]/50 border-b border-[#E0E0E0]">
        <CardTitle className="text-[#2D3142] flex items-center">
          <BarChart2 className="h-4 w-4 mr-2" style={{ color: modelColor }} />
          {modelType.charAt(0).toUpperCase() + modelType.slice(1)} Model
          <div className="ml-auto flex gap-2">
            <Badge 
              variant="outline" 
              className="bg-white border-[#E0E0E0]"
              style={{ color: modelColor }}
            >
              {(accuracy * 100).toFixed(1)}% Acc
            </Badge>
            <Badge 
              variant="outline" 
              className="bg-white border-[#E0E0E0]"
              style={{ color: modelColor }}
            >
              {(f1Score * 100).toFixed(1)}% F1
            </Badge>
          </div>
        </CardTitle>
        <CardDescription className="text-[#424242]">Subject S{subjectId}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <TooltipProvider>
          <div className="flex flex-col items-center">
            <div className="w-full overflow-x-auto">
              <div className="inline-grid grid-cols-[auto_repeat(4,minmax(60px,1fr))] gap-1 mb-2">
                {/* Header row with predicted labels */}
                <div className="font-medium text-right pr-2 text-xs text-[#424242]">True ↓ \ Pred →</div>
                {classNames.map((name) => (
                  <div key={name} className="font-medium text-center p-1 text-xs border-b border-[#E0E0E0] text-[#2D3142]">
                    {name}
                  </div>
                ))}
                
                {/* Matrix rows */}
                {matrix.map((row, i) => (
                  <React.Fragment key={`row-${i}`}>
                    <div className="font-medium text-right pr-2 text-xs border-r border-[#E0E0E0] flex items-center justify-end text-[#2D3142]">
                      {classNames[i]}
                    </div>
                    {row.map((value, j) => {
                      const percentage = rowTotals[i] ? (value / rowTotals[i] * 100) : 0;
                      const isDiagonal = i === j;
                      
                      // Create a color scale using Biometric Spectrum theme
                      let bgColor = 'bg-[#F5F5F5]'; // Default
                      let textColor = 'text-[#424242]'; // Default
                      let borderColor = 'border border-[#E0E0E0]/50';
                      
                      if (isDiagonal) {
                        // Success scale for correct predictions using Mint
                        if (percentage > 90) {
                          bgColor = 'bg-[#7BE495]/30';
                          textColor = 'text-[#2D3142]';
                          borderColor = 'border border-[#7BE495]/40';
                        } else if (percentage > 75) {
                          bgColor = 'bg-[#7BE495]/20';
                          textColor = 'text-[#2D3142]';
                          borderColor = 'border border-[#7BE495]/30';
                        } else if (percentage > 50) {
                          bgColor = 'bg-[#7BE495]/10';
                          textColor = 'text-[#2D3142]';
                          borderColor = 'border border-[#7BE495]/20';
                        }
                      } else if (value > 0) {
                        // Error scale for misclassifications using Coral
                        if (percentage > 40) {
                          bgColor = 'bg-[#F76C5E]/30';
                          textColor = 'text-[#2D3142]';
                          borderColor = 'border border-[#F76C5E]/40';
                        } else if (percentage > 20) {
                          bgColor = 'bg-[#F76C5E]/20';
                          textColor = 'text-[#2D3142]';
                          borderColor = 'border border-[#F76C5E]/30';
                        } else if (percentage > 0) {
                          bgColor = 'bg-[#F76C5E]/10';
                          textColor = 'text-[#2D3142]';
                          borderColor = 'border border-[#F76C5E]/20';
                        }
                      }
                      
                      return (
                        <Tooltip key={`${i}-${j}`}>
                          <TooltipTrigger asChild>
                            <div className={`flex items-center justify-center p-2 ${bgColor} ${textColor} ${borderColor} rounded-sm`}>
                              <div className="text-center">
                                <div className="font-semibold">{value}</div>
                                {value > 0 && (
                                  <div className="text-xs opacity-80">{percentage.toFixed(1)}%</div>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            className="bg-white border border-[#E0E0E0] shadow-md"
                          >
                            <p className="text-[#2D3142]">
                              <span className="font-semibold">{value}</span> samples of {classNames[i]} were 
                              predicted as {classNames[j]}
                              {isDiagonal ? 
                                <span className="text-[#7BE495] font-medium"> (correct)</span> : 
                                <span className="text-[#F76C5E] font-medium"> (incorrect)</span>
                              }
                            </p>
                            <p className="text-xs text-[#424242]">
                              {percentage.toFixed(1)}% of all {classNames[i]} samples
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </React.Fragment>
                ))}
                
                {/* Summary row */}
                <div className="font-medium text-right pr-2 text-xs border-t border-[#E0E0E0] pt-1 mt-1 text-[#424242]">
                  Precision →
                </div>
                {colTotals.map((total, j) => {
                  const precision = total > 0 ? (matrix[j][j] / total) * 100 : 0;
                  return (
                    <div key={`precision-${j}`} className="text-center border-t border-[#E0E0E0] pt-1 mt-1 text-xs font-medium text-[#2D3142]">
                      {precision.toFixed(1)}%
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Summary stats */}
            <div className="flex justify-between w-full mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#7BE495]/30 rounded-full border border-[#7BE495]/50"></div>
                <span className="text-[#424242]">Correct: <span className="font-medium text-[#2D3142]">{correctCount} ({(correctCount/totalSamples*100).toFixed(1)}%)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#F76C5E]/30 rounded-full border border-[#F76C5E]/50"></div>
                <span className="text-[#424242]">Incorrect: <span className="font-medium text-[#2D3142]">{incorrectCount} ({(incorrectCount/totalSamples*100).toFixed(1)}%)</span></span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}