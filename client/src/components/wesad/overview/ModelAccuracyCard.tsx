"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOverview } from "@/hooks/useWesadData";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Cell, LabelList
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Info, ArrowUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

// Biometric Spectrum color palette
const MODEL_COLORS = {
  Base: "#4464AD",     // Slate Blue
  Personal: "#4F8A8B", // Teal
  Ensemble: "#B8B8FF", // Lavender
  Adaptive: "#7BE495"  // Mint
};

export function ModelAccuracyCard() {
  const [chartData, setChartData] = useState([]);
  const [bestModel, setBestModel] = useState(null);
  const { data, isLoading, error } = useOverview();
  
  useEffect(() => {
    if (data && data.models && Array.isArray(data.models)) {
      // Transform data for chart
      const processedData = data.models.map(model => ({
        name: model.name.charAt(0).toUpperCase() + model.name.slice(1),
        accuracy: parseFloat((model.accuracy * 100).toFixed(1)),
        f1_score: parseFloat((model.f1_score * 100).toFixed(1)),
      }));
      
      // Sort by predefined order
      processedData.sort((a, b) => {
        const order = ["Base", "Personal", "Ensemble", "Adaptive"];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
      
      setChartData(processedData);
      
      // Find best model by accuracy
      const bestModelData = [...processedData].sort((a, b) => b.accuracy - a.accuracy)[0];
      setBestModel(bestModelData);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card className="shadow-md h-full border border-[#E0E0E0]">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
          <CardTitle className="text-[#2D3142]">Model Accuracy</CardTitle>
          <CardDescription className="text-[#424242]">Comparison of model performances</CardDescription>
        </CardHeader>
        <CardContent className="h-80 p-6">
          <Skeleton className="w-full h-full bg-[#E0E0E0]/50" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data || !data.models || !Array.isArray(data.models)) {
    return (
      <Card className="shadow-md h-full border border-[#E0E0E0]">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
          <CardTitle className="text-[#2D3142]">Model Accuracy</CardTitle>
          <CardDescription className="text-[#424242]">Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border-[#F76C5E]/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load model accuracy data.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const value = payload[0].value;
      const name = payload[0].name;
      const modelColor = MODEL_COLORS[label];
      
      return (
        <div className="bg-white p-4 border border-[#E0E0E0] rounded-md shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: modelColor }}></div>
            <p className="font-semibold text-sm text-[#2D3142]">{label} Model</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm flex justify-between">
              <span className="text-[#424242]">{name}:</span>
              <span className="font-medium text-[#2D3142]">{value.toFixed(1)}%</span>
            </p>
            {label === bestModel?.name && (
              <p className="text-xs text-[#7BE495] flex items-center gap-1 mt-1">
                <ArrowUp className="h-3 w-3" />
                Best performing model
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom y-axis label
  const renderYAxisLabel = (props) => {
    const { x, y, width, height } = props.viewBox;
    return (
      <text x={x - 40} y={y + height / 2} textAnchor="middle" transform={`rotate(-90, ${x - 40}, ${y + height / 2})`}>
        <tspan className="text-xs font-medium fill-[#424242]">Score (%)</tspan>
      </text>
    );
  };
  
  return (
    <Card className="shadow-md h-full border border-[#E0E0E0]">
      <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-[#2D3142]">Model Accuracy</CardTitle>
            <CardDescription className="text-[#424242]">Comparison of model performances</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {bestModel && (
              <Badge className="bg-[#7BE495]/20 text-[#2D3142] hover:bg-[#7BE495]/30 border-[#7BE495]/30">
                Best: {bestModel.name} ({bestModel.accuracy.toFixed(1)}%)
              </Badge>
            )}
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-5 w-5 text-[#4F8A8B] cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4 border border-[#E0E0E0] bg-white shadow-md">
                <div className="text-sm space-y-3 text-[#424242]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODEL_COLORS.Base }}></div>
                    <p><strong>Base Model:</strong> Trained on all subjects</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODEL_COLORS.Personal }}></div>
                    <p><strong>Personal Model:</strong> Fine-tuned for individual subjects</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODEL_COLORS.Ensemble }}></div>
                    <p><strong>Ensemble Model:</strong> Weighted combination of base and personal</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODEL_COLORS.Adaptive }}></div>
                    <p><strong>Adaptive Model:</strong> Dynamic selection based on confidence</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="accuracy">
          <TabsList className="mb-6 grid grid-cols-2 w-60 bg-[#F5F5F5] border border-[#E0E0E0]">
            <TabsTrigger 
              value="accuracy" 
              className="data-[state=active]:bg-[#4464AD] data-[state=active]:text-white"
            >
              Accuracy
            </TabsTrigger>
            <TabsTrigger 
              value="f1_score"
              className="data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white" 
            >
              F1 Score
            </TabsTrigger>
          </TabsList>
          
          {/* Accuracy Tab */}
          <TabsContent value="accuracy">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  barCategoryGap={30}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#424242', fontSize: 12 }}
                    axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[80, 100]} 
                    ticks={[80, 85, 90, 95, 100]}
                    tick={{ fill: '#424242', fontSize: 12 }}
                    axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                    label={renderYAxisLabel}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: 12, color: '#424242', paddingTop: 20 }}
                  />
                  <Bar 
                    dataKey="accuracy" 
                    name="Accuracy" 
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={MODEL_COLORS[entry.name]} 
                        fillOpacity={0.9}
                        stroke={MODEL_COLORS[entry.name]}
                        strokeWidth={1}
                      />
                    ))}
                    <LabelList dataKey="accuracy" position="top" formatter={(value) => `${value}%`} style={{ fontSize: 11, fill: '#424242' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* F1 Score Tab */}
          <TabsContent value="f1_score">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  barCategoryGap={30}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#424242', fontSize: 12 }}
                    axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[80, 100]} 
                    ticks={[80, 85, 90, 95, 100]}
                    tick={{ fill: '#424242', fontSize: 12 }}
                    axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                    label={renderYAxisLabel}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: 12, color: '#424242', paddingTop: 20 }}
                  />
                  <Bar 
                    dataKey="f1_score" 
                    name="F1 Score" 
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={MODEL_COLORS[entry.name]} 
                        fillOpacity={0.9}
                        stroke={MODEL_COLORS[entry.name]}
                        strokeWidth={1}
                      />
                    ))}
                    <LabelList dataKey="f1_score" position="top" formatter={(value) => `${value}%`} style={{ fontSize: 11, fill: '#424242' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}