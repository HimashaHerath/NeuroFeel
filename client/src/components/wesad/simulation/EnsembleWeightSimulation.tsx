// components/simulation/EnsembleWeightSimulation.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectSelector } from "@/components/wesad/subjects/SubjectSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { simulateEnsembleWeight } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";

export function EnsembleWeightSimulation() {
  const [baseWeight, setBaseWeight] = useState(0.6);
  const [subjectId, setSubjectId] = useState<number | undefined>();
  const [autoRun, setAutoRun] = useState(false);
  const [viewType, setViewType] = useState<"chart" | "metrics">("chart");
  
  const { mutate, data: simData, isPending, isError, error } = useMutation({
    mutationFn: () => simulateEnsembleWeight(baseWeight, subjectId),
    onError: (err) => {
      toast.error("Simulation failed", {
        description: (err as any)?.message || "Failed to run simulation. Please try again.",
      });
    },
    onSuccess: () => {
      toast.success("Simulation complete", {
        description: "Weight simulation completed successfully."
      });
    }
  });
  
  // Auto-run simulation when subject or weight changes (if autoRun is enabled)
  useEffect(() => {
    if (autoRun && subjectId) {
      mutate();
    }
  }, [baseWeight, subjectId, autoRun, mutate]);
  
  const handleSimulate = () => {
    if (!subjectId) {
      toast.error("Subject required", {
        description: "Please select a subject first."
      });
      return;
    }
    mutate();
  };
  
  const getBestWeight = () => {
    if (!simData?.sweep_results?.accuracy_values) return 0.5;
    
    const { weights, accuracy_values } = simData.sweep_results;
    const maxAccuracyIndex = accuracy_values.indexOf(Math.max(...accuracy_values));
    return weights[maxAccuracyIndex];
  };
  
  const bestWeight = simData ? getBestWeight() : 0.5;
  
  return (
    <Card className="border border-[#E0E0E0] shadow-sm overflow-hidden">
      <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#2D3142]">Ensemble Weight Optimization</CardTitle>
            <CardDescription className="text-[#424242]">
              Find the optimal balance between base and personal models
            </CardDescription>
          </div>
          <SubjectSelector 
            onSelect={(id) => setSubjectId(id)} 
            defaultValue={subjectId}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[#2D3142]">Base Model Weight: {baseWeight.toFixed(2)}</label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-[#4F8A8B] cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm border-[#E0E0E0] bg-white p-3">
                      <p className="text-[#424242]">Higher values increase base model influence, lower values increase personal model influence.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#424242]">Auto-run</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={autoRun} onChange={() => setAutoRun(!autoRun)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#E0E0E0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4464AD]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E0E0E0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4464AD]"></div>
                </label>
              </div>
            </div>
            <Slider
              value={[baseWeight]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => setBaseWeight(value[0])}
              className="py-4"
            />
            
            {simData && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#424242]">Current Weight: {baseWeight.toFixed(2)}</span>
                  <span className="font-medium text-[#4464AD]">Best Weight: {bestWeight.toFixed(2)}</span>
                </div>
                <Progress 
                  value={baseWeight * 100} 
                  className="h-2 bg-[#E0E0E0]"
                />
                <div className="flex justify-between text-xs text-[#424242] mt-1">
                  <span>Personal Model (0.0)</span>
                  <span>Base Model (1.0)</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Button 
              onClick={handleSimulate} 
              disabled={isPending || !subjectId} 
              className="w-40 bg-[#4464AD] hover:bg-[#2D3142] text-white"
            >
              {isPending ? "Simulating..." : "Run Simulation"}
            </Button>
            
            {simData && (
              <div className="flex justify-end">
                <Tabs value={viewType} onValueChange={(v) => setViewType(v as "chart" | "metrics")}>
                  <TabsList className="bg-[#F5F5F5] border border-[#E0E0E0]">
                    <TabsTrigger 
                      value="chart"
                      className="data-[state=active]:bg-[#4464AD] data-[state=active]:text-white" 
                    >
                      Chart
                    </TabsTrigger>
                    <TabsTrigger 
                      value="metrics"
                      className="data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white"
                    >
                      Metrics
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
          </div>
          
          {isError && (
            <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border-[#F76C5E]/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(error as any)?.message || "Failed to run simulation. Please try again."}
              </AlertDescription>
            </Alert>
          )}
          
          {isPending ? (
            <div className="space-y-4">
              <div className="text-center text-sm text-[#424242]">
                Running simulation with weight {baseWeight.toFixed(2)}...
              </div>
              <Skeleton className="w-full h-[400px] bg-[#E0E0E0]/50" />
            </div>
          ) : simData ? (
            <div className="space-y-6">
              {viewType === "metrics" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border border-[#E0E0E0]">
                    <CardHeader className="pb-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
                      <CardTitle className="text-base text-[#2D3142]">Estimated Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#4464AD]">{simData.estimated_accuracy.toFixed(1)}%</div>
                      <p className="text-xs text-[#424242] mt-1">
                        {simData.estimated_accuracy > 90 ? "Excellent" : 
                          simData.estimated_accuracy > 80 ? "Good" : 
                          simData.estimated_accuracy > 70 ? "Average" : "Poor"} performance
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-[#E0E0E0]">
                    <CardHeader className="pb-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
                      <CardTitle className="text-base text-[#2D3142]">Model Contribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="h-2 w-full bg-[#E0E0E0] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#4F8A8B]" 
                              style={{ width: `${simData.base_contribution}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-between text-xs px-1">
                          <span className="bg-white px-1 text-[#4464AD]">{(100 - simData.base_contribution).toFixed(0)}%</span>
                          <span className="bg-white px-1 text-[#4F8A8B]">{simData.base_contribution.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-[#424242] mt-2">
                        <span>Personal Model</span>
                        <span>Base Model</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border border-[#E0E0E0]">
                    <CardHeader className="pb-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
                      <CardTitle className="text-base text-[#2D3142]">Optimal Weight</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#7BE495]">{bestWeight.toFixed(2)}</div>
                      <p className="text-xs text-[#424242] mt-1">
                        {Math.abs(baseWeight - bestWeight) < 0.05 ? 
                          "Current weight is optimal" : 
                          `${baseWeight < bestWeight ? "Increase" : "Decrease"} weight for better performance`}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={simData.sweep_results.weights.map((w: number, i: number) => ({
                        weight: w,
                        accuracy: simData.sweep_results.accuracy_values[i]
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis 
                        dataKey="weight" 
                        domain={[0, 1]}
                        tickFormatter={(value) => value.toFixed(1)}
                        label={{ value: 'Base Model Weight', position: 'insideBottom', offset: -5, fill: "#424242" }}
                        tick={{ fill: "#424242" }}
                        stroke="#E0E0E0"
                      />
                      <YAxis 
                        domain={[0, 100]}
                        label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: "#424242" }}
                        tick={{ fill: "#424242" }}
                        stroke="#E0E0E0"
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Accuracy']}
                        labelFormatter={(value) => `Weight: ${Number(value).toFixed(2)}`}
                        contentStyle={{ 
                          border: '1px solid #E0E0E0', 
                          borderRadius: '6px', 
                          backgroundColor: '#fff',
                          color: "#2D3142"
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <ReferenceLine 
                        x={baseWeight} 
                        stroke="#F76C5E" 
                        strokeWidth={2}
                        label={{ 
                          value: "Current", 
                          position: "top",
                          fill: "#F76C5E",
                          fontSize: 12
                        }} 
                      />
                      <ReferenceLine 
                        x={bestWeight} 
                        stroke="#7BE495" 
                        strokeWidth={2}
                        label={{ 
                          value: "Optimal", 
                          position: "top",
                          fill: "#7BE495",
                          fontSize: 12
                        }} 
                      />
                      <Line 
                        name="Model Accuracy"
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#4464AD" 
                        strokeWidth={2}
                        dot={{ stroke: '#4464AD', strokeWidth: 2, r: 4, fill: "#4464AD" }}
                        activeDot={{ stroke: '#4464AD', strokeWidth: 2, r: 6, fill: "#B8B8FF" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              <div className="text-sm space-y-1 border-t border-[#E0E0E0] pt-4 mt-4">
                <p className="font-medium text-[#2D3142]">How Ensemble Models Work:</p>
                <p className="text-[#424242]">
                  The ensemble model combines predictions from both models using a weighted average of probabilities:
                </p>
                <p className="font-mono text-xs bg-[#F5F5F5] inline-block p-2 rounded border border-[#E0E0E0]">
                  final_prediction = (base_weight × base_prediction) + ((1 - base_weight) × personal_prediction)
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed rounded-lg border-[#E0E0E0]">
              <p className="text-[#424242]">Select a subject and run the simulation to see results</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}