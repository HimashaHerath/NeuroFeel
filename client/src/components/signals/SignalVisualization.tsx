// components/signals/SignalVisualization.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignalVisualization } from "@/hooks/useWesadData";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SignalVisualizationProps {
  subjectId: number;
  emotion?: string;
}

export function SignalVisualization({ subjectId, emotion }: SignalVisualizationProps) {
  const { data, isLoading, error } = useSignalVisualization(subjectId, emotion);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Physiological Signal Features</CardTitle>
          <CardDescription>Subject S{subjectId} {emotion ? `- ${emotion}` : ''}</CardDescription>
        </CardHeader>
        <CardContent className="h-[500px]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Physiological Signal Features</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Failed to load signal data</AlertTitle>
            <AlertDescription>
              {error?.message || "An unknown error occurred while loading signal data."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Handle our actual data structure
  const hasFeatures = data.features && 
    (data.features.ecg || data.features.emg || data.features.resp);

  if (!hasFeatures) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Physiological Signal Features</CardTitle>
          <CardDescription>Subject S{subjectId} {emotion ? `- ${emotion}` : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>No features available</AlertTitle>
            <AlertDescription>
              No physiological signal features were found for this subject and emotion.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Physiological Signal Features</CardTitle>
            <CardDescription>
              Subject S{subjectId} {emotion ? `- ${emotion}` : ''}
            </CardDescription>
          </div>
          <Badge variant={data.emotion === "Stress" ? "destructive" : 
                          data.emotion === "Amusement" ? "default" : 
                          data.emotion === "Meditation" ? "outline" : 
                          "secondary"}>
            {data.emotion || "Unknown"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!data.raw_signals_available && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4 mr-2" />
            <AlertDescription>
              Raw signal waveforms are not available. Displaying extracted features only.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="ecg">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="ecg">ECG</TabsTrigger>
            <TabsTrigger value="emg">EMG</TabsTrigger>
            <TabsTrigger value="resp">Respiration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ecg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.features?.ecg && Object.entries(data.features.ecg).map(([key, value]) => (
                <FeatureCard
                  key={key}
                  name={key.replace('chest_ecg_', '')}
                  value={value as number}
                  signalType="ECG"
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="emg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.features?.emg && Object.entries(data.features.emg).map(([key, value]) => (
                <FeatureCard
                  key={key}
                  name={key.replace('chest_emg_', '')}
                  value={value as number}
                  signalType="EMG"
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="resp">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.features?.resp && Object.entries(data.features.resp).map(([key, value]) => (
                <FeatureCard
                  key={key}
                  name={key.replace('chest_resp_', '')}
                  value={value as number}
                  signalType="Respiration"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-sm text-gray-500">
          <h4 className="font-semibold mb-1">Feature Descriptions:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">mean</span>: Average value of the signal</li>
            <li><span className="font-medium">std</span>: Standard deviation (variability)</li>
            <li><span className="font-medium">min/max</span>: Minimum and maximum values</li>
            <li><span className="font-medium">range</span>: Difference between max and min</li>
            <li><span className="font-medium">iqr</span>: Interquartile range (robust measure of dispersion)</li>
            <li><span className="font-medium">energy</span>: Sum of squared values (signal intensity)</li>
            <li><span className="font-medium">mean_diff</span>: Mean of absolute differences between adjacent points</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  name: string;
  value: number;
  signalType: "ECG" | "EMG" | "Respiration";
}

function FeatureCard({ name, value, signalType }: FeatureCardProps) {
  // Get color based on signal type
  const getColor = (type: string) => {
    switch (type) {
      case "ECG": return "bg-blue-50 border-blue-200";
      case "EMG": return "bg-green-50 border-green-200";
      case "Respiration": return "bg-amber-50 border-amber-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };
  
  // Format the feature name
  const formatName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };
  
  return (
    <div className={`border rounded-md p-4 ${getColor(signalType)}`}>
      <div className="text-sm font-medium text-gray-500">{formatName(name)}</div>
      <div className="text-2xl font-semibold mt-1">{value.toFixed(4)}</div>
    </div>
  );
}