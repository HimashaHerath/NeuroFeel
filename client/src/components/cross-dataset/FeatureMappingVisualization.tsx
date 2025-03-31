import React, { useState, useMemo } from 'react';
import { useFeatureImportanceVisualization } from '@/hooks/useCrossDatasetData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Heart, ArrowRightLeft, BarChart3, PieChart, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';

// Helpers and constants
const FEATURE_DESCRIPTIONS = {
  'mean': 'Average value of the signal',
  'std': 'Standard deviation (variability)',
  'min': 'Minimum value in the signal window',
  'max': 'Maximum value in the signal window',
  'range': 'Range between min and max values',
  'energy': 'Energy content of the signal',
  'skewness': 'Asymmetry of the distribution',
  'kurtosis': 'Peakedness of the distribution',
  'slope': 'Rate of change of the signal'
};

// Biometric Spectrum Theme Color Palette
const BIOMETRIC_COLORS = {
  primary: '#2D3142', // Deep Indigo
  secondary: '#4F8A8B', // Teal
  accent: '#4464AD', // Slate Blue
  success: '#7BE495', // Mint
  neutral: '#B8B8FF', // Lavender
  background: '#F5F5F5', // Off-White
  border: '#E0E0E0', // Light Gray
  text: '#424242', // Charcoal
  featureColors: [
    '#4464AD', // Slate Blue
    '#4F8A8B', // Teal
    '#7BE495', // Mint
    '#B8B8FF', // Lavender
    '#4ADEDE', // Cool Blue
    '#6E44FF', // Deep Purple
    '#5D8AA8', // Medium Blue
    '#617073', // Slate Gray
    '#36454F', // Charcoal Blue
  ]
};

// Feature explanation component
const FeatureExplanation = ({ featureName }) => {
  const baseName = featureName.split('_').pop();
  const description = FEATURE_DESCRIPTIONS[baseName] || 'No description available';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 inline-block ml-1 text-[#4F8A8B]" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white border border-[#E0E0E0] shadow-md">
          <p className="text-[#424242]">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Feature card component
const FeatureCard = ({ feature, index }) => {
  const featureType = feature.wesad_feature.split('_')[0];
  const featureName = feature.wesad_feature.split('_')[1];
  const importancePercentage = (feature.importance_score * 100).toFixed(1);
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border border-[#E0E0E0]">
      <div 
        className="h-2" 
        style={{ 
          backgroundColor: BIOMETRIC_COLORS.featureColors[index % BIOMETRIC_COLORS.featureColors.length],
          width: `${Math.max(importancePercentage, 5)}%`
        }}
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="font-semibold border-[#E0E0E0] text-[#2D3142]">
            {featureType}/{featureName}
          </Badge>
          <span className="text-base font-bold text-[#2D3142]">{importancePercentage}%</span>
        </div>
        <div className="flex text-sm text-[#424242]">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-[#4464AD]" />
            <span>WESAD: {feature.wesad_feature}</span>
          </div>
          <ArrowRightLeft className="h-3 w-3 mx-2 text-[#4F8A8B]" />
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-[#4F8A8B]" />
            <span>K-EmoCon: {feature.kemocon_feature}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main component
const FeatureMappingVisualization = () => {
  const [target, setTarget] = useState<'arousal' | 'valence'>('arousal');
  const [viewType, setViewType] = useState<'bars' | 'radar' | 'cards' | 'comparison'>('bars');
  const { data, isLoading, error } = useFeatureImportanceVisualization(target);
  
  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (!data?.features) return [];
    
    return data.features.map(feature => {
      const name = feature.wesad_feature.split('_')[1];
      return {
        name,
        importance: feature.importance_score,
        fullScore: 1, // For reference
        wesad: feature.wesad_feature,
        kemocon: feature.kemocon_feature
      };
    });
  }, [data?.features]);
  
  // Prepare comparison data (mapped by feature type)
  const comparisonData = useMemo(() => {
    if (!data?.features) return [];
    
    return data.features.map(feature => {
      const name = feature.wesad_feature.split('_')[1];
      return {
        name,
        importance: feature.importance_score * 100,
        wesad: feature.wesad_feature,
        kemocon: feature.kemocon_feature
      };
    });
  }, [data?.features]);

  if (isLoading) {
    return (
      <Card className="w-full border border-[#E0E0E0] shadow-sm">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2 bg-[#E0E0E0]/50" />
          <Skeleton className="h-4 w-full max-w-md bg-[#E0E0E0]/50" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full bg-[#E0E0E0]/50" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border-[#F76C5E]/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load feature mapping visualization. {error?.toString()}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full border border-[#E0E0E0] shadow-sm">
      <CardHeader className="pb-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl flex items-center text-[#2D3142]">
              <Heart className="mr-2 h-5 w-5 text-[#4464AD]" />
              Physiological Feature Mapping
            </CardTitle>
            <CardDescription className="text-[#424242]">
              Comparing ECG/HR features between WESAD and K-EmoCon datasets
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Tabs
              value={target}
              onValueChange={(value) => setTarget(value as 'arousal' | 'valence')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-[200px] bg-[#F5F5F5] border border-[#E0E0E0]">
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
            </Tabs>
            <Select
              value={viewType}
              onValueChange={(value) => setViewType(value as any)}
            >
              <SelectTrigger className="w-[160px] border-[#E0E0E0]">
                <SelectValue placeholder="View Type" />
              </SelectTrigger>
              <SelectContent className="border-[#E0E0E0]">
                <SelectItem value="bars">Bar Chart</SelectItem>
                <SelectItem value="radar">Radar Chart</SelectItem>
                <SelectItem value="cards">Feature Cards</SelectItem>
                <SelectItem value="comparison">Comparison</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Information card about dataset mapping */}
        <Card className="bg-[#F5F5F5] mb-6 border border-[#E0E0E0]">
          <CardContent className="p-4 text-sm">
            <p className="flex items-center text-[#424242]">
              <Info className="h-4 w-4 mr-2 text-[#4F8A8B]" />
              The charts below show how features map between <strong>WESAD</strong> (lab-based) and <strong>K-EmoCon</strong> (in-the-wild) datasets for {target === 'arousal' ? 'arousal' : 'valence'} recognition.
            </p>
          </CardContent>
        </Card>
        
        {/* Feature visualization based on selected view type */}
        {viewType === 'bars' && (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.features.map(f => ({
                  name: f.wesad_feature.split('_')[1],
                  importance: f.importance_score * 100,
                  wesad: f.wesad_feature,
                  kemocon: f.kemocon_feature
                }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis 
                  type="number" 
                  domain={[0, 20]} // Max 20% for better visibility
                  tickFormatter={(value) => `${value}%`}
                  stroke="#424242"
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={120}
                  stroke="#424242"
                />
                <RechartsTooltip 
                  formatter={(value: any) => [`${value.toFixed(2)}%`, 'Importance']}
                  labelFormatter={(label: any, payload: any) => {
                    if (payload && payload.length) {
                      return (
                        `WESAD: ${payload[0].payload.wesad}\nK-EmoCon: ${payload[0].payload.kemocon}`
                      );
                    }
                    return label;
                  }}
                  contentStyle={{ 
                    backgroundColor: "white",
                    border: `1px solid #E0E0E0`,
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#424242"
                  }}
                />
                <Legend />
                <Bar dataKey="importance" name="Feature Importance">
                  {data.features.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BIOMETRIC_COLORS.featureColors[index % BIOMETRIC_COLORS.featureColors.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {viewType === 'radar' && (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={150} data={radarData}>
                <PolarGrid stroke="#E0E0E0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#424242" }} />
                <PolarRadiusAxis 
                  domain={[0, 0.2]} 
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                  stroke="#424242"
                />
                <Radar
                  name="Feature Importance"
                  dataKey="importance"
                  stroke={BIOMETRIC_COLORS.accent}
                  fill={BIOMETRIC_COLORS.accent}
                  fillOpacity={0.5}
                />
                <RechartsTooltip 
                  formatter={(value: any) => [`${(value * 100).toFixed(2)}%`, 'Importance']}
                  labelFormatter={(label: any, payload: any) => {
                    if (payload && payload.length) {
                      return (
                        `WESAD: ${payload[0].payload.wesad}\nK-EmoCon: ${payload[0].payload.kemocon}`
                      );
                    }
                    return label;
                  }}
                  contentStyle={{ 
                    backgroundColor: "white",
                    border: `1px solid #E0E0E0`,
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#424242"
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {viewType === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        )}
        
        {viewType === 'comparison' && (
          <>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    interval={0}
                    stroke="#424242"
                  />
                  <YAxis 
                    domain={[0, 20]} 
                    label={{ value: 'Importance (%)', angle: -90, position: 'insideLeft', fill: "#424242" }}
                    tickFormatter={(value) => `${value}%`}
                    stroke="#424242"
                  />
                  <RechartsTooltip 
                    formatter={(value) => [`${value.toFixed(2)}%`, 'Importance']} 
                    contentStyle={{ 
                      backgroundColor: "white",
                      border: `1px solid #E0E0E0`,
                      borderRadius: "4px",
                      fontSize: "12px",
                      color: "#424242"
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    dataKey="importance" 
                    name={`${target.charAt(0).toUpperCase() + target.slice(1)} Importance`}
                    stroke={target === 'arousal' ? BIOMETRIC_COLORS.accent : BIOMETRIC_COLORS.success} 
                    strokeWidth={2} 
                    dot={{ 
                      fill: target === 'arousal' ? BIOMETRIC_COLORS.accent : BIOMETRIC_COLORS.success, 
                      r: 6 
                    }}
                    activeDot={{ 
                      r: 8, 
                      fill: target === 'arousal' ? BIOMETRIC_COLORS.primary : BIOMETRIC_COLORS.secondary 
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <Table>
                <TableCaption>ECG/HR Feature Mapping for {target}</TableCaption>
                <TableHeader>
                  <TableRow className="border-[#E0E0E0]">
                    <TableHead className="text-[#2D3142]">Feature</TableHead>
                    <TableHead className="text-[#2D3142]">WESAD</TableHead>
                    <TableHead className="text-[#2D3142]">K-EmoCon</TableHead>
                    <TableHead className="text-right text-[#2D3142]">Importance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.features.map((feature, index) => (
                    <TableRow key={index} className="border-[#E0E0E0]">
                      <TableCell className="font-medium flex items-center text-[#2D3142]">
                        {feature.wesad_feature.split('_')[1]}
                        <FeatureExplanation featureName={feature.wesad_feature} />
                      </TableCell>
                      <TableCell className="text-[#424242]">{feature.wesad_feature}</TableCell>
                      <TableCell className="text-[#424242]">{feature.kemocon_feature}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium text-[#2D3142]">{(feature.importance_score * 100).toFixed(2)}%</span>
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              backgroundColor: BIOMETRIC_COLORS.featureColors[index % BIOMETRIC_COLORS.featureColors.length],
                              width: `${Math.min(feature.importance_score * 100 * 5, 100)}px`
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-4 border-t border-[#E0E0E0] p-4 text-sm text-[#424242]">
        <div className="flex-1">
          <p className="font-semibold text-[#2D3142]">Common Important Features:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.common_important_features.map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-[#F5F5F5] border-[#E0E0E0] text-[#2D3142]"
              >
                {feature.feature} ({(feature.importance * 100).toFixed(1)}%)
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs text-[#4464AD] hover:bg-[#4464AD]/10"
            onClick={() => window.open('/research-notes/feature-mapping.pdf', '_blank')}
          >
            View Research Notes
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FeatureMappingVisualization;