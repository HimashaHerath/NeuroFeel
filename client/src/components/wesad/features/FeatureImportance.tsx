// components/features/FeatureImportance.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeatureImportance } from "@/hooks/useWesadData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FeatureImportanceProps {
  subjectId?: number;
  topN?: number;
}

export function FeatureImportance({ subjectId, topN = 10 }: FeatureImportanceProps) {
  const { data, isLoading, error } = useFeatureImportance(subjectId, topN);
  
  if (isLoading) {
    return (
      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardHeader className="border-b border-[#E0E0E0] bg-[#F5F5F5]/50">
          <CardTitle className="text-[#2D3142] flex items-center">
            <FileText className="mr-2 h-5 w-5 text-[#4464AD]" />
            Feature Importance
          </CardTitle>
          <CardDescription className="text-[#424242]">
            {subjectId ? `Subject S${subjectId}` : 'Global'} - Top {topN} features
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-6">
          <Skeleton className="w-full h-full bg-[#E0E0E0]/50" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data || !data.length) {
    return (
      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardHeader className="border-b border-[#E0E0E0] bg-[#F5F5F5]/50">
          <CardTitle className="text-[#2D3142] flex items-center">
            <FileText className="mr-2 h-5 w-5 text-[#4464AD]" />
            Feature Importance
          </CardTitle>
          <CardDescription className="text-[#424242]">Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border border-[#F76C5E]/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load feature importance data.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Format feature names for better display
  const chartData = data
    .filter((feature: any) => feature.importance_score !== undefined)
    .map((feature: any) => ({
      name: formatFeatureName(feature.feature_name),
      importance: parseFloat(feature.importance_score),
      signalType: getSignalType(feature.feature_name)
    }))
    .sort((a: any, b: any) => b.importance - a.importance);
  
  // Create data for legend
  const legendData = [...new Set(chartData.map(item => item.signalType))].map(type => ({
    signalType: type,
    color: getSignalColor(type as string)
  }));
  
  return (
    <Card className="border border-[#E0E0E0] shadow-sm">
      <CardHeader className="border-b border-[#E0E0E0] bg-[#F5F5F5]/50">
        <CardTitle className="text-[#2D3142] flex items-center">
          <FileText className="mr-2 h-5 w-5 text-[#4464AD]" />
          Feature Importance
        </CardTitle>
        <CardDescription className="text-[#424242]">
          {subjectId ? `Subject S${subjectId}` : 'Global'} - Top {chartData.length} features
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-wrap gap-4 justify-end">
          {legendData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-[#424242]">{item.signalType}</span>
            </div>
          ))}
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 10, right: 20, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis 
                type="number" 
                domain={[0, 'dataMax']}
                tickFormatter={(value) => value.toFixed(3)}
                stroke="#424242"
                tick={{ fill: '#424242', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 13, fill: '#424242' }} 
                width={100} 
                stroke="#424242"
              />
              <Tooltip 
                formatter={(value) => [`${parseFloat(value).toFixed(4)}`, 'Importance']}
                contentStyle={{ 
                  border: '1px solid #E0E0E0', 
                  borderRadius: '8px', 
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                itemStyle={{ color: '#2D3142' }}
                labelStyle={{ color: '#424242', fontWeight: 500 }}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]} animationDuration={1200}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getSignalColor(entry.signalType)} 
                    stroke={getDarkerColor(getSignalColor(entry.signalType))}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format feature names
function formatFeatureName(name: string): string {
  // Remove 'chest_' prefix and replace underscores with spaces
  return name
    .replace('chest_', '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to extract signal type from feature name
function getSignalType(name: string): string {
  if (name.includes('ecg')) return 'ECG';
  if (name.includes('emg')) return 'EMG';
  if (name.includes('resp')) return 'RESP';
  if (name.includes('eda')) return 'EDA';
  return 'Other';
}

// Helper function to get color based on signal type - Using Biometric Spectrum theme
function getSignalColor(signalType: string): string {
  switch (signalType) {
    case 'ECG': return '#4464AD';  // Slate Blue
    case 'EMG': return '#4F8A8B';  // Teal
    case 'RESP': return '#7BE495'; // Mint
    case 'EDA': return '#4ADEDE';  // Cool Blue
    default: return '#B8B8FF';     // Lavender
  }
}

// Helper function to get a darker version of a color for the stroke
function getDarkerColor(color: string): string {
  // Simple function to darken a hex color
  return color.replace(/^#/, '')
    .match(/.{2}/g)
    ?.map(x => {
      const num = Math.max(0, parseInt(x, 16) - 20);
      return num.toString(16).padStart(2, '0');
    })
    .join('') || color;
}