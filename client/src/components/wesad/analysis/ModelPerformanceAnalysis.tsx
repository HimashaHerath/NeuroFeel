// components/analysis/ModelPerformanceAnalysis.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOverview } from "@/hooks/useWesadData";
import { Skeleton } from "@/components/ui/skeleton";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { HelpCircle, Activity, BarChart2, Brain, HeartPulse } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Biometric Spectrum color palette
const MODEL_COLORS = {
  base: "#4464AD",      // Slate Blue
  personal: "#4F8A8B",  // Teal
  ensemble: "#B8B8FF",  // Lavender
  adaptive: "#7BE495"   // Mint
};

const EMOTION_COLORS = {
  Baseline: "#4ADEDE",  // Cool Blue
  Stress: "#F76C5E",    // Coral
  Amusement: "#7BE495", // Mint
  Meditation: "#B8B8FF" // Lavender
};

export function ModelPerformanceAnalysis() {
  const { data, isLoading, error } = useOverview();
  const [highlightedSubject, setHighlightedSubject] = useState<number | null>(null);
  
  if (isLoading) {
    return (
      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <CardTitle className="text-[#2D3142]">Model Performance Analysis</CardTitle>
          <CardDescription className="text-[#424242]">When does each model perform best?</CardDescription>
        </CardHeader>
        <CardContent className="h-96 p-6">
          <Skeleton className="w-full h-full bg-[#E0E0E0]/50" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data || !data.subjects) {
    return (
      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <CardTitle className="text-[#2D3142]">Model Performance Analysis</CardTitle>
          <CardDescription className="text-[#424242]">Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-[#F76C5E]">Failed to load model performance data.</p>
        </CardContent>
      </Card>
    );
  }

  // Process data to find when each model is best
  const subjectAnalysis = data.subjects.map(subject => {
    const accuracies = subject.accuracies;
    const models = Object.keys(accuracies);
    const bestModel = models.reduce((a, b) => accuracies[a] > accuracies[b] ? a : b);
    
    // Calculate improvement over base model
    const improvement = {
      personal: (accuracies.personal || 0) - (accuracies.base || 0),
      ensemble: (accuracies.ensemble || 0) - (accuracies.base || 0),
      adaptive: (accuracies.adaptive || 0) - (accuracies.base || 0),
    };
    
    return {
      subject_id: subject.subject_id,
      best_model: bestModel,
      base_accuracy: accuracies.base || 0,
      personal_accuracy: accuracies.personal || 0,
      ensemble_accuracy: accuracies.ensemble || 0,
      adaptive_accuracy: accuracies.adaptive || 0,
      improvement
    };
  });
  
  // Create improved scatter plot data
  const scatterData = subjectAnalysis.map(subject => ({
    subject: `S${subject.subject_id}`,
    subject_id: subject.subject_id,
    baseAcc: subject.base_accuracy * 100,
    personalAcc: subject.personal_accuracy * 100,
    ensembleAcc: subject.ensemble_accuracy * 100,
    adaptiveAcc: subject.adaptive_accuracy * 100,
    bestModel: subject.best_model,
    improvement: {
      ensemble: (subject.improvement.ensemble * 100).toFixed(1),
      adaptive: (subject.improvement.adaptive * 100).toFixed(1)
    }
  }));
  
  // Count how many subjects each model performs best on
  const bestModelCounts = {};
  subjectAnalysis.forEach(subject => {
    const model = subject.best_model;
    bestModelCounts[model] = (bestModelCounts[model] || 0) + 1;
  });
  
  // Model count data for bar chart
  const modelCountData = Object.entries(bestModelCounts).map(([model, count]) => ({
    name: model.charAt(0).toUpperCase() + model.slice(1),
    value: count,
    color: MODEL_COLORS[model]
  }));
  
  // Count wins by emotion type
  const emotionWinners = {};
  // Initialize emotionDataArray
  const emotionDataArray = [];
  
  if (data.emotions) {
    Object.entries(data.emotions).forEach(([emotion, emotionData]) => {
      if (emotionData.accuracy_by_model) {
        const accuracies = emotionData.accuracy_by_model;
        const models = Object.keys(accuracies);
        const bestModel = models.reduce((a, b) => accuracies[a] > accuracies[b] ? a : b);
        emotionWinners[emotion] = bestModel;
        
        // Add to emotion data array for visualization
        emotionDataArray.push({
          name: emotion,
          base: accuracies.base || 0,
          personal: accuracies.personal || 0,
          ensemble: accuracies.ensemble || 0,
          adaptive: accuracies.adaptive || 0,
          bestModel: bestModel
        });
      }
    });
  }

  return (
    <Card className="border border-[#E0E0E0] shadow-sm">
      <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-[#2D3142]">Model Performance Analysis</CardTitle>
            <CardDescription className="text-[#424242]">Understanding when each model type performs best</CardDescription>
          </div>
          <div className="flex gap-2">
            {Object.entries(MODEL_COLORS).map(([model, color]) => (
              <div key={model} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-xs text-[#424242]">{model.charAt(0).toUpperCase() + model.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="mb-4 grid grid-cols-3 w-full max-w-md bg-[#F5F5F5] border border-[#E0E0E0]">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#4464AD] data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="subjects"
              className="data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white"
            >
              Subject Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="emotions"
              className="data-[state=active]:bg-[#7BE495] data-[state=active]:text-white"
            >
              Emotion Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#2D3142] flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-[#4464AD]" />
                    Best Performing Models
                  </h3>
                  <Popover>
                    <PopoverTrigger>
                      <HelpCircle className="w-4 h-4 text-[#B8B8FF]" />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 border border-[#E0E0E0] bg-white shadow-sm">
                      <p className="text-sm text-[#424242]">Shows how many subjects had each model type as their best performer.</p>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={modelCountData} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E0E0E0" />
                      <XAxis type="number" domain={[0, 'dataMax']} stroke="#424242" />
                      <YAxis dataKey="name" type="category" width={80} stroke="#424242" />
                      <Tooltip 
                        formatter={(value) => [value, "Subjects"]}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #E0E0E0',
                          borderRadius: '4px'
                        }}
                      />
                      <Bar dataKey="value" nameKey="name">
                        {modelCountData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border border-[#E0E0E0] p-4 rounded-lg bg-[#F5F5F5]">
                  <h3 className="text-lg font-medium mb-2 text-[#2D3142]">Key Insights</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-[#424242]">
                    <li><span className="font-medium text-[#4464AD]">Ensemble model</span> performs best when both base and personal models are strong</li>
                    <li><span className="font-medium text-[#7BE495]">Adaptive model</span> excels at handling difficult samples where one model has higher confidence</li>
                    <li><span className="font-medium text-[#4F8A8B]">Personal model</span> works best with sufficient calibration data and personalization</li>
                    <li><span className="font-medium text-[#4464AD]">Base model</span> is most reliable when subject-specific data is limited or noisy</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#2D3142] flex items-center">
                    <HeartPulse className="mr-2 h-5 w-5 text-[#4F8A8B]" />
                    Best Model by Emotion
                  </h3>
                  <Popover>
                    <PopoverTrigger>
                      <HelpCircle className="w-4 h-4 text-[#B8B8FF]" />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 border border-[#E0E0E0] bg-white shadow-sm">
                      <p className="text-sm text-[#424242]">Shows which model performed best for each emotion across all subjects.</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(emotionWinners).map(([emotion, model]) => (
                    <div 
                      key={emotion} 
                      className="border border-[#E0E0E0] rounded-lg p-4 flex items-center gap-3 transition-all hover:shadow-md"
                      style={{ borderLeftColor: EMOTION_COLORS[emotion], borderLeftWidth: 4 }}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: `${EMOTION_COLORS[emotion]}20` }}>
                        <div className="w-8 h-8 rounded-full" 
                            style={{ backgroundColor: EMOTION_COLORS[emotion] }}></div>
                      </div>
                      <div>
                        <div className="text-lg font-medium text-[#2D3142]">{emotion}</div>
                        <Badge className="text-white" style={{ backgroundColor: MODEL_COLORS[model.toString()] }}>
                          {model.toString().charAt(0).toUpperCase() + model.toString().slice(1)} Model
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={emotionDataArray} 
                      margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis dataKey="name" stroke="#424242" />
                      <YAxis 
                        domain={[60, 100]} 
                        label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#424242' }}
                        stroke="#424242"
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(1)}%`]} 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #E0E0E0',
                          borderRadius: '4px'
                        }}
                      />
                      <Bar dataKey="base" fill={MODEL_COLORS.base} name="Base" />
                      <Bar dataKey="personal" fill={MODEL_COLORS.personal} name="Personal" />
                      <Bar dataKey="ensemble" fill={MODEL_COLORS.ensemble} name="Ensemble" />
                      <Bar dataKey="adaptive" fill={MODEL_COLORS.adaptive} name="Adaptive" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="subjects">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#2D3142] flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-[#4F8A8B]" />
                  Model Performance by Subject
                </h3>
                <Popover>
                  <PopoverTrigger>
                    <HelpCircle className="w-4 h-4 text-[#B8B8FF]" />
                  </PopoverTrigger>
                  <PopoverContent className="w-80 border border-[#E0E0E0] bg-white shadow-sm">
                    <p className="text-sm text-[#424242]">This chart shows base vs. personal model accuracy for each subject. 
                    Colors indicate which model performs best overall for each subject.</p>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 60, bottom: 60, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis 
                      type="number" 
                      dataKey="baseAcc" 
                      name="Base Model Accuracy" 
                      unit="%" 
                      domain={[75, 100]}
                      label={{ value: 'Base Model Accuracy (%)', position: 'bottom', offset: 15, fill: '#424242' }}
                      stroke="#424242"
                    />
                    <YAxis 
                      type="number" 
                      dataKey="personalAcc" 
                      name="Personal Model Accuracy" 
                      unit="%" 
                      domain={[65, 100]}
                      label={{ value: 'Personal Model Accuracy (%)', angle: -90, position: 'left', offset: 15, fill: '#424242' }}
                      stroke="#424242"
                    />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`]}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 border border-[#E0E0E0] shadow-md rounded-lg">
                              <p className="font-medium text-base border-b pb-1 mb-1 text-[#2D3142]">{data.subject}</p>
                              <p className="text-sm text-[#424242]"><span className="font-medium text-[#4464AD]">Base:</span> {data.baseAcc.toFixed(1)}%</p>
                              <p className="text-sm text-[#424242]"><span className="font-medium text-[#4F8A8B]">Personal:</span> {data.personalAcc.toFixed(1)}%</p>
                              <p className="text-sm text-[#424242]"><span className="font-medium text-[#B8B8FF]">Ensemble:</span> {data.ensembleAcc.toFixed(1)}%</p>
                              <p className="text-sm text-[#424242]"><span className="font-medium text-[#7BE495]">Adaptive:</span> {data.adaptiveAcc.toFixed(1)}%</p>
                              <p className="text-sm font-medium mt-1 text-[#2D3142]">Best: {data.bestModel.charAt(0).toUpperCase() + data.bestModel.slice(1)}</p>
                              <div className="text-xs mt-2 text-[#424242]">
                                Improvement over base model: 
                                <div>Ensemble: {data.improvement.ensemble}%</div>
                                <div>Adaptive: {data.improvement.adaptive}%</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top"
                      align="right"
                      layout="vertical"
                      wrapperStyle={{ paddingLeft: "10px" }}
                      payload={[
                        { value: 'Base', type: 'circle', color: MODEL_COLORS.base },
                        { value: 'Personal', type: 'circle', color: MODEL_COLORS.personal },
                        { value: 'Ensemble', type: 'circle', color: MODEL_COLORS.ensemble },
                        { value: 'Adaptive', type: 'circle', color: MODEL_COLORS.adaptive }
                      ]}
                    />
                    
                    {/* All scatter points with appropriate color by best model */}
                    <Scatter 
                      data={scatterData} 
                      fill={MODEL_COLORS.base}
                      shape={(props) => {
                        const { cx, cy, fill } = props;
                        const item = props.payload;
                        const isSelected = highlightedSubject === item.subject_id;
                        const modelColor = MODEL_COLORS[item.bestModel];
                        
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={isSelected ? 8 : 6} 
                            fill={modelColor}
                            stroke={isSelected ? "#2D3142" : "none"}
                            strokeWidth={isSelected ? 2 : 0}
                            style={{ cursor: 'pointer' }}
                          />
                        );
                      }}
                      onMouseEnter={(data) => setHighlightedSubject(data.subject_id)}
                      onMouseLeave={() => setHighlightedSubject(null)}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-[#2D3142] flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-[#4464AD]" />
                    Subject Model Accuracies
                  </h3>
                  <Badge variant="outline" className="text-[#424242] border-[#E0E0E0]">Click any row to highlight in chart</Badge>
                </div>
                <div className="rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-[#F5F5F5] sticky top-0">
                        <TableRow>
                          <TableHead className="w-[80px] font-semibold text-[#2D3142]">Subject</TableHead>
                          <TableHead className="font-semibold text-[#2D3142]">Base</TableHead>
                          <TableHead className="font-semibold text-[#2D3142]">Personal</TableHead>
                          <TableHead className="font-semibold text-[#2D3142]">Ensemble</TableHead>
                          <TableHead className="font-semibold text-[#2D3142]">Adaptive</TableHead>
                          <TableHead className="w-[100px] font-semibold text-[#2D3142]">Best Model</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjectAnalysis.map(subject => (
                          <TableRow 
                            key={subject.subject_id}
                            className={`cursor-pointer transition-colors ${
                              highlightedSubject === subject.subject_id ? 'bg-[#F5F5F5]' : ''
                            } hover:bg-[#F5F5F5]`}
                            onClick={() => setHighlightedSubject(
                              highlightedSubject === subject.subject_id ? null : subject.subject_id
                            )}
                          >
                            <TableCell className="font-medium text-[#2D3142]">S{subject.subject_id}</TableCell>
                            <TableCell className="text-[#424242]">{(subject.base_accuracy * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-[#424242]">{(subject.personal_accuracy * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-[#424242]">{(subject.ensemble_accuracy * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-[#424242]">{(subject.adaptive_accuracy * 100).toFixed(1)}%</TableCell>
                            <TableCell>
                              <Badge className="text-white" 
                                    style={{ backgroundColor: MODEL_COLORS[subject.best_model] }}>
                                {subject.best_model.charAt(0).toUpperCase() + subject.best_model.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="emotions">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-[#2D3142] flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-[#7BE495]" />
                      Emotion Recognition Performance
                    </h3>
                    <Popover>
                      <PopoverTrigger>
                        <HelpCircle className="w-4 h-4 text-[#B8B8FF]" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80 border border-[#E0E0E0] bg-white shadow-sm">
                        <p className="text-sm text-[#424242]">This chart shows accuracy of each model type for different emotions.</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={emotionDataArray} 
                        margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis 
                          dataKey="name" 
                          label={{ value: 'Emotion', position: 'bottom', offset: 0, fill: '#424242' }}
                          stroke="#424242"
                        />
                        <YAxis 
                          domain={[60, 100]} 
                          label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#424242' }} 
                          stroke="#424242"
                        />
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(1)}%`]}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-4 border border-[#E0E0E0] shadow-md rounded-lg">
                                  <p className="font-medium text-base border-b pb-1 mb-1 text-[#2D3142]">{label}</p>
                                  {payload.map((entry, index) => (
                                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                                      <span className="font-medium">{entry.name}:</span> {entry.value.toFixed(1)}%
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 20 }} />
                        <Bar dataKey="base" fill={MODEL_COLORS.base} name="Base" />
                        <Bar dataKey="personal" fill={MODEL_COLORS.personal} name="Personal" />
                        <Bar dataKey="ensemble" fill={MODEL_COLORS.ensemble} name="Ensemble" />
                        <Bar dataKey="adaptive" fill={MODEL_COLORS.adaptive} name="Adaptive" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-[#2D3142] flex items-center">
                      <HeartPulse className="mr-2 h-5 w-5 text-[#4F8A8B]" />
                      Emotion Recognition Patterns
                    </h3>
                    <Popover>
                      <PopoverTrigger>
                        <HelpCircle className="w-4 h-4 text-[#B8B8FF]" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80 border border-[#E0E0E0] bg-white shadow-sm">
                        <p className="text-sm text-[#424242]">Analysis of which model types perform best for particular emotions.</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(emotionWinners).map(([emotion, model]) => {
                      const emotionInfo = emotionDataArray.find(e => e.name === emotion);
                      if (!emotionInfo) return null;
                      
                      // Calculate the best score and difference from second best
                      const scores = [
                        { model: 'base', value: emotionInfo.base },
                        { model: 'personal', value: emotionInfo.personal },
                        { model: 'ensemble', value: emotionInfo.ensemble },
                        { model: 'adaptive', value: emotionInfo.adaptive }
                      ].sort((a, b) => b.value - a.value);
                      
                      const bestScore = scores[0].value;
                      const secondBestScore = scores[1].value;
                      const advantage = bestScore - secondBestScore;
                      
                      return (
                        <div 
                          key={emotion} 
                          className="border border-[#E0E0E0] rounded-lg p-4 transition-all hover:shadow-md"
                          style={{ borderLeftColor: EMOTION_COLORS[emotion], borderLeftWidth: 4 }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-medium text-[#2D3142]">{emotion}</h4>
                              <Badge className="mt-1 text-white" style={{ backgroundColor: MODEL_COLORS[model.toString()] }}>
                                {model.toString().charAt(0).toUpperCase() + model.toString().slice(1)} Model
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#2D3142]">{bestScore.toFixed(1)}%</div>
                              <div className="text-xs text-[#424242]">
                                {advantage > 0 ? `+${advantage.toFixed(1)}% over ${scores[1].model}` : 'Tied'}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-[#424242]">
                            <p>
                              {model === 'base' && 'The base model performs best for this emotion, suggesting consistent physiological patterns across subjects.'}
                              {model === 'personal' && 'The personal model excels here, indicating strong individual differences in how this emotion manifests.'}
                              {model === 'ensemble' && 'The ensemble approach works best, suggesting benefits from combining both general and personal patterns.'}
                              {model === 'adaptive' && 'The adaptive model is optimal, indicating that confidence-based selection is effective for this emotion.'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#F5F5F5]">
                    <TableRow>
                      <TableHead className="font-semibold text-[#2D3142]">Emotion</TableHead>
                      <TableHead className="font-semibold text-[#2D3142]">Base</TableHead>
                      <TableHead className="font-semibold text-[#2D3142]">Personal</TableHead>
                      <TableHead className="font-semibold text-[#2D3142]">Ensemble</TableHead>
                      <TableHead className="font-semibold text-[#2D3142]">Adaptive</TableHead>
                      <TableHead className="font-semibold text-[#2D3142]">Best Model</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.emotions).map(([emotion, emotionData]) => {
                      const accuracies = emotionData.accuracy_by_model || {};
                      const bestModel = Object.keys(accuracies).reduce(
                        (a, b) => accuracies[a] > accuracies[b] ? a : b, 
                        'base'
                      );
                      
                      return (
                        <TableRow key={emotion}>
                          <TableCell className="font-medium text-[#2D3142]">{emotion}</TableCell>
                          <TableCell className="text-[#424242]">{accuracies.base?.toFixed(1) || '-'}%</TableCell>
                          <TableCell className="text-[#424242]">{accuracies.personal?.toFixed(1) || '-'}%</TableCell>
                          <TableCell className="text-[#424242]">{accuracies.ensemble?.toFixed(1) || '-'}%</TableCell>
                          <TableCell className="text-[#424242]">{accuracies.adaptive?.toFixed(1) || '-'}%</TableCell>
                          <TableCell>
                            <Badge className="text-white" 
                                  style={{ backgroundColor: MODEL_COLORS[bestModel] }}>
                              {bestModel.charAt(0).toUpperCase() + bestModel.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}