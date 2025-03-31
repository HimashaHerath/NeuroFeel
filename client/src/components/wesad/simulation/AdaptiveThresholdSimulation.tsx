// components/simulation/AdaptiveThresholdSimulation.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  ComposedChart,
  Bar,
} from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectSelector } from "@/components/wesad/subjects/SubjectSelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { simulateAdaptiveThreshold } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export function AdaptiveThresholdSimulation() {
  const [threshold, setThreshold] = useState(0.65);
  const [subjectId, setSubjectId] = useState<number | undefined>();
  const [viewType, setViewType] = useState<
    "performance" | "usage" | "combined"
  >("combined");
  const [autoRun, setAutoRun] = useState(false);

  const {
    mutate,
    data: simData,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: () => simulateAdaptiveThreshold(threshold, subjectId),
    onError: (err) => {
      toast.error("Simulation failed", {
        description:
          (err as any)?.message ||
          "Failed to run simulation. Please try again.",
      });
    },
    onSuccess: () => {
      toast.success("Simulation complete", {
        description: "Adaptive threshold simulation completed successfully.",
      });
    },
  });

  // Auto-run simulation when subject or threshold changes (if autoRun is enabled)
  useEffect(() => {
    if (autoRun && subjectId) {
      mutate();
    }
  }, [threshold, subjectId, autoRun, mutate]);

  const handleSimulate = () => {
    if (!subjectId) {
      toast.error("Subject required", {
        description: "Please select a subject first.",
      });
      return;
    }
    mutate();
  };

  const getOptimalThreshold = () => {
    if (!simData?.sweep_results?.accuracy_values) return 0.65;

    const { thresholds, accuracy_values } = simData.sweep_results;
    const maxAccuracyIndex = accuracy_values.indexOf(
      Math.max(...accuracy_values)
    );
    return thresholds[maxAccuracyIndex];
  };

  const optimalThreshold = simData ? getOptimalThreshold() : 0.65;

  return (
    <Card className="overflow-hidden border border-[#E0E0E0] shadow-sm">
      <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#2D3142]">Adaptive Model Threshold Optimization</CardTitle>
            <CardDescription className="text-[#424242]">
              Fine-tune when to use base vs. personal models based on confidence
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
                <label className="text-sm font-medium text-[#2D3142]">
                  Confidence Threshold: {threshold.toFixed(2)}
                </label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-[#4F8A8B] cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm bg-white border border-[#E0E0E0] text-[#424242]">
                      <p>
                        The adaptive model uses the base model when its
                        confidence is ≥ threshold × personal model confidence.
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#424242]/70">Auto-run</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRun}
                    onChange={() => setAutoRun(!autoRun)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#E0E0E0] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4464AD]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E0E0E0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4464AD]"></div>
                </label>
              </div>
            </div>
            <Slider
              value={[threshold]}
              min={0.5}
              max={1}
              step={0.01}
              onValueChange={(value) => setThreshold(value[0])}
              className="py-4"
            />

            {simData && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#424242]/70">
                    Low Threshold (More Personal)
                  </span>
                  <span className="text-[#424242]/70">
                    High Threshold (More Base)
                  </span>
                </div>
                <Progress value={(threshold - 0.5) * 200} className="h-2 bg-[#E0E0E0]" />
                <div className="flex justify-between text-xs text-[#424242]/70 mt-1">
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={handleSimulate}
              disabled={isPending || !subjectId}
              className="w-40 bg-[#4464AD] hover:bg-[#2D3142]"
            >
              {isPending ? "Simulating..." : "Run Simulation"}
            </Button>

            {simData && (
              <Tabs
                value={viewType}
                onValueChange={(v) => setViewType(v as any)}
              >
                <TabsList className="bg-[#F5F5F5] border border-[#E0E0E0]">
                  <TabsTrigger 
                    value="combined"
                    className="data-[state=active]:bg-[#4464AD] data-[state=active]:text-white"
                  >
                    Combined
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performance"
                    className="data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white"
                  >
                    Performance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="usage"
                    className="data-[state=active]:bg-[#7BE495] data-[state=active]:text-white"
                  >
                    Model Usage
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {isError && (
            <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border-[#F76C5E]/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {(error as any)?.message ||
                  "Failed to run simulation. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {isPending ? (
            <div className="space-y-4">
              <div className="text-center text-sm text-[#424242]/70">
                Running adaptive threshold simulation with threshold{" "}
                {threshold.toFixed(2)}...
              </div>
              <Skeleton className="w-full h-[300px] bg-[#E0E0E0]/50" />
            </div>
          ) : simData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-[#E0E0E0]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#2D3142]">
                      Estimated Accuracy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#2D3142]">
                      {simData.estimated_accuracy.toFixed(1)}%
                    </div>
                    <div className="flex items-center mt-1">
                      <Badge
                        className={`${
                          simData.estimated_accuracy > 85
                            ? "bg-[#7BE495]/20 text-[#2D3142] border-[#7BE495]/30"
                            : "bg-[#B8B8FF]/20 text-[#2D3142] border-[#B8B8FF]/30"
                        }`}
                      >
                        {simData.estimated_accuracy > 85 ? "High" : "Standard"}{" "}
                        Performance
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-[#E0E0E0]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#2D3142]">Model Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="h-2 w-full bg-[#E0E0E0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4464AD]"
                            style={{
                              width: `${simData.base_model_usage_pct}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between text-xs px-1">
                        <span className="bg-white px-1 text-[#4F8A8B]">
                          {simData.personal_model_usage_pct.toFixed(0)}%
                        </span>
                        <span className="bg-white px-1 text-[#4464AD]">
                          {simData.base_model_usage_pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-[#424242]/70 mt-2">
                      <span>Personal Model</span>
                      <span>Base Model</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-[#E0E0E0]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#2D3142]">
                      Optimal Threshold
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#2D3142]">
                      {optimalThreshold.toFixed(2)}
                    </div>
                    <p className="text-xs text-[#424242]/70 mt-1">
                      {Math.abs(threshold - optimalThreshold) < 0.05
                        ? "Current threshold is optimal"
                        : `${
                            threshold < optimalThreshold
                              ? "Increase"
                              : "Decrease"
                          } threshold for better performance`}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="h-[300px]">
                {viewType === "performance" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={simData.sweep_results.thresholds.map(
                        (t: number, i: number) => ({
                          threshold: t,
                          accuracy: simData.sweep_results.accuracy_values[i],
                        })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="threshold"
                        domain={[0.5, 1]}
                        label={{
                          value: "Confidence Threshold",
                          position: "insideBottom",
                          offset: -5,
                          fill: "#424242"
                        }}
                        stroke="#424242"
                      />
                      <YAxis
                        yAxisId="left"
                        domain={[
                          (dataMin: number) =>
                            Math.floor(
                              Math.min(
                                ...simData.sweep_results.accuracy_values
                              ) - 2
                            ),
                          (dataMax: number) =>
                            Math.ceil(
                              Math.max(
                                ...simData.sweep_results.accuracy_values
                              ) + 2
                            ),
                        ]}
                        label={{
                          value: "Accuracy (%)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#424242"
                        }}
                        stroke="#424242"
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toFixed(1)}%`,
                          "Accuracy",
                        ]}
                        contentStyle={{ 
                          backgroundColor: "white", 
                          border: "1px solid #E0E0E0",
                          borderRadius: "6px",
                          color: "#2D3142"
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: "#424242" }}
                      />
                      <ReferenceLine
                        x={threshold}
                        stroke="#F76C5E"
                        label={{ value: "Current", fill: "#F76C5E" }}
                        yAxisId="left"
                      />
                      <ReferenceLine
                        x={optimalThreshold}
                        stroke="#7BE495"
                        label={{ value: "Optimal", fill: "#7BE495" }}
                        yAxisId="left"
                      />
                      <Line
                        yAxisId="left"
                        name="Model Accuracy"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#4F8A8B"
                        strokeWidth={2}
                        dot={{ stroke: "#4F8A8B", strokeWidth: 2, r: 4 }}
                        activeDot={{ stroke: "#4F8A8B", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {viewType === "usage" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={simData.sweep_results.thresholds.map(
                        (t: number, i: number) => ({
                          threshold: t,
                          baseUsage: simData.sweep_results.base_usage_pct[i],
                          personalUsage:
                            simData.sweep_results.personal_usage_pct[i],
                        })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="threshold"
                        domain={[0.5, 1]}
                        label={{
                          value: "Confidence Threshold",
                          position: "insideBottom",
                          offset: -5,
                          fill: "#424242"
                        }}
                        stroke="#424242"
                      />
                      <YAxis
                        yAxisId="left"
                        domain={[0, 100]}
                        label={{
                          value: "Model Usage (%)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#424242"
                        }}
                        stroke="#424242"
                      />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(1)}%`, "Usage"]}
                        contentStyle={{ 
                          backgroundColor: "white", 
                          border: "1px solid #E0E0E0",
                          borderRadius: "6px",
                          color: "#2D3142"
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: "#424242" }}
                      />
                      <ReferenceLine
                        x={threshold}
                        stroke="#F76C5E"
                        label={{ value: "Current", fill: "#F76C5E" }}
                        yAxisId="left"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="baseUsage"
                        name="Base Model Usage"
                        stroke="#4464AD"
                        strokeWidth={2}
                        dot={{ stroke: "#4464AD", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="personalUsage"
                        name="Personal Model Usage"
                        stroke="#4F8A8B"
                        strokeWidth={2}
                        dot={{ stroke: "#4F8A8B", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {viewType === "combined" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={simData.sweep_results.thresholds.map(
                        (t: number, i: number) => ({
                          threshold: t,
                          accuracy: simData.sweep_results.accuracy_values[i],
                          base: simData.sweep_results.base_usage_pct[i],
                          personal: simData.sweep_results.personal_usage_pct[i],
                        })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="threshold"
                        domain={[0.5, 1]}
                        label={{
                          value: "Confidence Threshold",
                          position: "insideBottom",
                          offset: -5,
                          fill: "#424242"
                        }}
                        stroke="#424242"
                      />
                      <YAxis
                        yAxisId="left"
                        label={{
                          value: "Accuracy (%)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#424242"
                        }}
                        domain={[
                          (dataMin: number) =>
                            Math.floor(
                              Math.min(
                                ...simData.sweep_results.accuracy_values
                              ) - 2
                            ),
                          (dataMax: number) =>
                            Math.ceil(
                              Math.max(
                                ...simData.sweep_results.accuracy_values
                              ) + 2
                            ),
                        ]}
                        stroke="#424242"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{
                          value: "Model Usage (%)",
                          angle: 90,
                          position: "insideRight",
                          fill: "#424242"
                        }}
                        stroke="#424242"
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "accuracy")
                            return [`${value.toFixed(1)}%`, "Accuracy"];
                          if (name === "base")
                            return [`${value.toFixed(1)}%`, "Base Model"];
                          if (name === "personal")
                            return [`${value.toFixed(1)}%`, "Personal Model"];
                          return [value, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: "white", 
                          border: "1px solid #E0E0E0",
                          borderRadius: "6px",
                          color: "#2D3142"
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: "#424242" }}
                      />
                      <ReferenceLine
                        x={threshold}
                        stroke="#F76C5E"
                        label={{ value: "Current", fill: "#F76C5E" }}
                        yAxisId="left"
                      />
                      <Line
                        yAxisId="left"
                        name="Accuracy"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#7BE495"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="base"
                        name="Base Model"
                        stackId="a"
                        fill="#4464AD"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="personal"
                        name="Personal Model"
                        stackId="a"
                        fill="#4F8A8B"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="text-sm space-y-1 border-t border-[#E0E0E0] pt-4">
                <p className="font-medium text-[#2D3142]">How Adaptive Selection Works:</p>
                <p className="text-[#424242]/80">
                  The adaptive model dynamically selects between base and
                  personal models for each prediction:
                </p>
                <ol className="list-decimal list-inside text-xs text-[#424242]/80 space-y-1 ml-2">
                  <li>
                    Calculate confidence scores for both models (max
                    probability)
                  </li>
                  <li>
                    Use base model when: base_confidence ≥ threshold ×
                    personal_confidence
                  </li>
                  <li>
                    Otherwise use personal model (when personal model is
                    significantly more confident)
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 border border-[#E0E0E0] rounded-lg bg-[#F5F5F5]">
              <p className="text-[#424242]">Select a subject and run the simulation to see results</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}