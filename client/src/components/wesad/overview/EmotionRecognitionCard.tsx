// components/dashboard/EmotionRecognitionCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOverview } from "@/hooks/useWesadData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Biometric Spectrum color palette
const COLORS = {
  base: '#4464AD',      // Slate Blue - WESAD framework color
  personal: '#4F8A8B',  // Teal - Cross-dataset framework color
  ensemble: '#B8B8FF',  // Lavender - Calm, balanced secondary
  adaptive: '#7BE495',  // Mint - Best performance
};

// Emotion-specific colors with biometric spectrum theme
const EMOTION_COLORS = {
  Baseline: '#B8B8FF',   // Lavender - neutral, calm state
  Stress: '#F76C5E',     // Coral - high arousal
  Amusement: '#7BE495',  // Mint - positive valence
  Meditation: '#4ADEDE', // Cool Blue - focused, calm state
};

const MODEL_LABELS = {
  base: "Base",
  personal: "Personal",
  ensemble: "Ensemble",
  adaptive: "Adaptive"
};

const EMOTION_ICONS = {
  Baseline: "🧘",
  Stress: "😰",
  Amusement: "😄",
  Meditation: "🧠"
};

export function EmotionRecognitionCard() {
  const { data, isLoading, error } = useOverview();
  const [selectedView, setSelectedView] = useState<string>("comparison");
  
  if (isLoading) {
    return (
      <Card className="overflow-hidden border border-[#E0E0E0] shadow-md">
        <CardHeader className="pb-4 bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <CardTitle className="text-[#2D3142]">Emotion Recognition</CardTitle>
          <CardDescription className="text-[#424242]">Recognition rates by emotional state</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-6">
          <Skeleton className="w-full h-full bg-[#E0E0E0]/50" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data || !data.emotions) {
    return (
      <Card className="border border-[#E0E0E0] shadow-md">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <CardTitle className="text-[#2D3142]">Emotion Recognition</CardTitle>
          <CardDescription className="text-[#424242]">Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-[#F76C5E]">Failed to load emotion recognition data.</p>
        </CardContent>
      </Card>
    );
  }

  // Get all emotion data
  const emotionData = data.emotions;
  
  // Find best model for each emotion
  const bestModels: Record<string, { model: string, accuracy: number }> = {};
  Object.entries(emotionData).forEach(([emotion, data]) => {
    const accuracies = data.accuracy_by_model || {};
    let bestModel = "base";
    let bestAccuracy = 0;
    
    Object.entries(accuracies).forEach(([model, accuracy]) => {
      if ((accuracy as number) > bestAccuracy) {
        bestModel = model;
        bestAccuracy = accuracy as number;
      }
    });
    
    bestModels[emotion] = { model: bestModel, accuracy: bestAccuracy };
  });
  
  // Calculate average accuracy across all emotions for each model
  const modelAverages: Record<string, number> = { base: 0, personal: 0, ensemble: 0, adaptive: 0 };
  let totalEmotions = 0;
  
  Object.values(emotionData).forEach((data) => {
    const accuracies = data.accuracy_by_model || {};
    Object.entries(accuracies).forEach(([model, accuracy]) => {
      modelAverages[model] = (modelAverages[model] || 0) + (accuracy as number);
    });
    totalEmotions++;
  });
  
  // Divide by number of emotions to get average
  Object.keys(modelAverages).forEach(model => {
    modelAverages[model] = modelAverages[model] / totalEmotions;
  });
  
  // Find best overall model
  const bestOverallModel = Object.entries(modelAverages)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Format data for comparison chart
  const comparisonData = Object.entries(emotionData).map(([emotion, data]: [string, any]) => {
    const modelAccuracies = data.accuracy_by_model || {};
    return {
      name: emotion,
      base: modelAccuracies.base || 0,
      personal: modelAccuracies.personal || 0,
      ensemble: modelAccuracies.ensemble || 0,
      adaptive: modelAccuracies.adaptive || 0,
      icon: EMOTION_ICONS[emotion as keyof typeof EMOTION_ICONS],
      emotionColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]
    };
  });

  // Format data for individual model views
  const getModelData = (modelType: string) => {
    return Object.entries(emotionData).map(([emotion, data]: [string, any]) => {
      return {
        name: emotion,
        value: data.accuracy_by_model?.[modelType] || 0,
        icon: EMOTION_ICONS[emotion as keyof typeof EMOTION_ICONS],
        emotionColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]
      };
    });
  };

  const modelDescriptions = {
    base: "Base model trained on all subjects",
    personal: "Individualized model for each subject",
    ensemble: "Weighted combination of base and personal",
    adaptive: "Dynamic selection between models",
    comparison: "Compare all model types"
  };

  // Custom tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const emotionIcon = EMOTION_ICONS[label as keyof typeof EMOTION_ICONS];
      
      return (
        <div className="bg-white p-3 border border-[#E0E0E0] rounded-md shadow-md">
          <p className="text-[#2D3142] font-medium mb-1 flex items-center">
            {emotionIcon} {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} className="text-sm flex justify-between gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></span>
                  <span className="text-[#424242]">{entry.name}:</span>
                </span>
                <span className="font-medium text-[#2D3142]">{Number(entry.value).toFixed(1)}%</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden border border-[#E0E0E0] shadow-md">
      <CardHeader className="pb-3 bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#2D3142]">
              Emotion Recognition
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <InfoCircledIcon className="h-4 w-4 text-[#4F8A8B] cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-white border border-[#E0E0E0] text-[#424242] shadow-md">
                    <p>Recognition rates for different emotional states using physiological signals</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="text-[#424242]">Accuracy by emotional state</CardDescription>
          </div>
          <Badge className="bg-gradient-to-r from-[#4464AD] to-[#4F8A8B] hover:from-[#2D3142] hover:to-[#2D3142] text-white">
            Best: {MODEL_LABELS[bestOverallModel as keyof typeof MODEL_LABELS]} ({modelAverages[bestOverallModel].toFixed(1)}%)
          </Badge>
        </div>
      </CardHeader>
      
      <div className="px-6 pt-4">
        <Tabs 
          value={selectedView} 
          onValueChange={setSelectedView}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 mb-4 bg-[#F5F5F5] border border-[#E0E0E0]">
            <TabsTrigger 
              value="comparison"
              className="data-[state=active]:bg-[#2D3142] data-[state=active]:text-white"
            >
              All Models
            </TabsTrigger>
            <TabsTrigger 
              value="base"
              className="data-[state=active]:bg-[#4464AD] data-[state=active]:text-white"
            >
              Base
            </TabsTrigger>
            <TabsTrigger 
              value="personal"
              className="data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white"
            >
              Personal
            </TabsTrigger>
            <TabsTrigger 
              value="ensemble"
              className="data-[state=active]:bg-[#B8B8FF] data-[state=active]:text-[#2D3142]"
            >
              Ensemble
            </TabsTrigger>
            <TabsTrigger 
              value="adaptive"
              className="data-[state=active]:bg-[#7BE495] data-[state=active]:text-[#2D3142]"
            >
              Adaptive
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <CardContent className="pt-0">
        <div className="text-xs text-[#424242] mb-2">
          {modelDescriptions[selectedView as keyof typeof modelDescriptions]}
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {selectedView === "comparison" ? (
              <BarChart
                data={comparisonData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  tickFormatter={(name) => `${EMOTION_ICONS[name as keyof typeof EMOTION_ICONS]} ${name}`}
                  tick={{ fill: '#424242', fontSize: 12 }}
                  axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[60, 100]} 
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#424242', fontSize: 12 }}
                  axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: 12, color: '#424242', paddingTop: 10 }}
                />
                <Bar dataKey="base" name="Base" fill={COLORS.base} radius={[4, 4, 0, 0]} />
                <Bar dataKey="personal" name="Personal" fill={COLORS.personal} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ensemble" name="Ensemble" fill={COLORS.ensemble} radius={[4, 4, 0, 0]} />
                <Bar dataKey="adaptive" name="Adaptive" fill={COLORS.adaptive} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart
                data={getModelData(selectedView)}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  tickFormatter={(name) => `${EMOTION_ICONS[name as keyof typeof EMOTION_ICONS]} ${name}`}
                  tick={{ fill: '#424242', fontSize: 12 }}
                  axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[60, 100]} 
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#424242', fontSize: 12 }}
                  axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
                <Bar 
                  dataKey="value" 
                  name={MODEL_LABELS[selectedView as keyof typeof MODEL_LABELS]} 
                  fill={COLORS[selectedView as keyof typeof COLORS]}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {getModelData(selectedView).map((entry, index) => {
                    const isBest = bestModels[entry.name].model === selectedView;
                    return (
                      <cell 
                        key={`cell-${index}`} 
                        fill={isBest ? COLORS[selectedView as keyof typeof COLORS] : 
                          `${COLORS[selectedView as keyof typeof COLORS]}99`}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {selectedView !== "comparison" && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {Object.entries(emotionData).map(([emotion, data]: [string, any]) => {
              const accuracy = data.accuracy_by_model?.[selectedView] || 0;
              const isBest = bestModels[emotion].model === selectedView;
              const emotionColor = EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS];
              
              return (
                <div 
                  key={emotion}
                  className={cn(
                    "p-2 rounded-md text-xs flex flex-col items-center border",
                    isBest ? `bg-[${emotionColor}]/10 border-[${emotionColor}]/30` : "border-[#E0E0E0] bg-white"
                  )}
                  style={{
                    backgroundColor: isBest ? `${emotionColor}10` : 'white',
                    borderColor: isBest ? `${emotionColor}30` : '#E0E0E0'
                  }}
                >
                  <div className="flex gap-1 items-center text-[#2D3142]">
                    <span>{EMOTION_ICONS[emotion as keyof typeof EMOTION_ICONS]}</span>
                    <span className="font-medium">{accuracy.toFixed(1)}%</span>
                  </div>
                  {isBest && (
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-[10px] py-0 border-[#7BE495] text-[#2D3142]"
                    >
                      Best
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}