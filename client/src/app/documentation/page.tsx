"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Download,
  Terminal,
  Code,
  Package,
  Database,
  GitBranch,
  FileCode,
  BookOpen,
  ExternalLink,
  Zap,
  Share2,
  Brain,
} from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-[#4464AD]/10 p-2 rounded-md">
            <FileText className="h-6 w-6 text-[#4464AD]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2D3142]">
            NeuroFeel Documentation
          </h1>
        </div>
        <p className="text-[#424242] mt-2">
          Cross-Dataset Emotion Recognition Framework Documentation
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-[#F5F5F5] border border-[#E0E0E0]">
          <TabsTrigger
            value="getting-started"
            className="data-[state=active]:bg-[#4464AD] data-[state=active]:text-white"
          >
            Getting Started
          </TabsTrigger>
          <TabsTrigger
            value="api-reference"
            className="data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white"
          >
            API Reference
          </TabsTrigger>
          <TabsTrigger
            value="examples"
            className="data-[state=active]:bg-[#7BE495] data-[state=active]:text-[#2D3142]"
          >
            Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <Card className="border border-[#E0E0E0] shadow-sm">
            <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <CardTitle className="text-[#2D3142] flex items-center">
                <Terminal className="h-5 w-5 mr-2 text-[#4464AD]" />
                Installation
              </CardTitle>
              <CardDescription className="text-[#424242]">
                Setting up the Cross-Dataset framework
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-[#F5F5F5] p-4 rounded-md border border-[#E0E0E0]">
                <code className="text-sm text-[#2D3142]">
                  git clone https://github.com/your-username/neurofeel.git
                  <br />
                  cd neurofeel
                  <br />
                  pip install -r requirements.txt
                </code>
              </div>
              <p className="text-sm text-[#424242]">
                This will install all required dependencies including NumPy,
                Pandas, Scikit-learn, and PyTorch.
              </p>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2 text-[#2D3142]">
                  Environment Variables
                </h3>
                <p className="text-sm text-[#424242] mb-2">
                  Set the following environment variables to point to your
                  datasets:
                </p>
                <div className="bg-[#F5F5F5] p-4 rounded-md border border-[#E0E0E0]">
                  <code className="text-sm text-[#2D3142]">
                    export WESAD_PATH=/path/to/wesad/dataset
                    <br />
                    export KEMOCON_PATH=/path/to/kemocon/dataset
                    <br />
                    export RESULTS_DIR=/path/to/output/directory
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#E0E0E0] shadow-sm">
            <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <CardTitle className="text-[#2D3142] flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-[#4464AD]" />
                Framework Overview
              </CardTitle>
              <CardDescription className="text-[#424242]">
                Key components and structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-[#424242]">
                The Cross-Dataset Emotion Recognition Framework consists of two
                main components:
              </p>

              <div className="space-y-4 mt-4">
                <div className="flex">
                  <div className="mr-4 mt-1">
                    <div className="bg-[#4464AD]/10 p-2 rounded-md">
                      <Brain className="h-4 w-4 text-[#4464AD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-[#2D3142]">
                      WESAD Framework
                    </h3>
                    <p className="text-sm text-[#424242]">
                      Personalized emotion recognition for WESAD dataset with
                      adaptive model selection.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4 mt-1">
                    <div className="bg-[#4F8A8B]/10 p-2 rounded-md">
                      <Share2 className="h-4 w-4 text-[#4F8A8B]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-[#2D3142]">
                      Cross-Dataset Framework
                    </h3>
                    <p className="text-sm text-[#424242]">
                      Bidirectional model transfer between WESAD and K-EmoCon
                      with domain adaptation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2 text-[#2D3142]">
                  Directory Structure
                </h3>
                <div className="bg-[#F5F5F5] p-4 rounded-md border border-[#E0E0E0]">
                  <pre className="text-sm overflow-auto text-[#2D3142]">
                    {`neurofeel/
├── wesad_framework/      # WESAD personalization framework
├── cross_dataset/        # Cross-dataset framework
│   ├── data/             # Data loaders
│   ├── features/         # Feature extraction
│   ├── domain_adaptation/# Domain adaptation methods
│   ├── models/           # Model training
│   ├── evaluation/       # Evaluation utilities
│   ├── visualization/    # Visualization tools
│   ├── config.py         # Configuration
│   ├── framework.py      # Main framework class
│   └── main.py           # Command-line interface
├── api/                  # API implementations
│   ├── wesad_api.py      # WESAD framework API
│   └── cross_dataset_api.py # Cross-dataset API
└── requirements.txt      # Dependencies`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-reference" className="space-y-6">
          <Card className="border border-[#E0E0E0] shadow-sm">
            <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <CardTitle className="text-[#2D3142] flex items-center">
                <Code className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                Cross-Dataset API
              </CardTitle>
              <CardDescription className="text-[#424242]">
                API endpoints for the cross-dataset framework
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="text-left py-2 font-medium text-[#2D3142]">
                        Endpoint
                      </th>
                      <th className="text-left py-2 font-medium text-[#2D3142]">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          /overview
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Get overview of performance for all models
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          /performance
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Get performance metrics for cross-dataset models
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          /adaptation
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Get domain adaptation performance metrics
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          /features/mapping
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Get feature mapping between WESAD and K-EmoCon
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          /dataset/distribution
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Get class distribution for both datasets
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          /predict
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Make predictions from signal data (POST)
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          /evaluation/{"{target}"}/{"{direction}"}
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Get detailed evaluation results
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          /report/{"{report_type}"}
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Generate downloadable reports
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#E0E0E0] shadow-sm">
            <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <CardTitle className="text-[#2D3142] flex items-center">
                <Terminal className="h-5 w-5 mr-2 text-[#4F8A8B]" />
                Command Line Interface
              </CardTitle>
              <CardDescription className="text-[#424242]">
                Running the framework from command line
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-lg font-medium mb-2 text-[#2D3142]">
                Basic Usage
              </h3>
              <div className="bg-[#F5F5F5] p-4 rounded-md border border-[#E0E0E0]">
                <code className="text-sm text-[#2D3142]">
                  python -m cross_dataset.main
                </code>
              </div>

              <h3 className="text-lg font-medium mb-2 mt-4 text-[#2D3142]">
                Common Options
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="text-left py-2 font-medium text-[#2D3142]">
                        Parameter
                      </th>
                      <th className="text-left py-2 font-medium text-[#2D3142]">
                        Description
                      </th>
                      <th className="text-left py-2 font-medium text-[#2D3142]">
                        Example
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          --adaptation-method
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Domain adaptation method
                      </td>
                      <td className="py-2">
                        <code className="text-[#4464AD]">ensemble</code>,{" "}
                        <code className="text-[#4464AD]">coral</code>,{" "}
                        <code className="text-[#4464AD]">subspace</code>,{" "}
                        <code className="text-[#4464AD]">none</code>
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          --target
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">Target to predict</td>
                      <td className="py-2">
                        <code className="text-[#4464AD]">arousal</code>,{" "}
                        <code className="text-[#4464AD]">valence</code>,{" "}
                        <code className="text-[#4464AD]">both</code>
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          --save-mode
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        Control what gets saved
                      </td>
                      <td className="py-2">
                        <code className="text-[#4464AD]">minimal</code>,{" "}
                        <code className="text-[#4464AD]">standard</code>,{" "}
                        <code className="text-[#4464AD]">full</code>,{" "}
                        <code className="text-[#4464AD]">none</code>
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          --wesad-subjects
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        WESAD subjects to process
                      </td>
                      <td className="py-2">
                        <code className="text-[#4464AD]">
                          --wesad-subjects 2 3 4 5
                        </code>
                      </td>
                    </tr>
                    <tr className="border-b border-[#E0E0E0]">
                      <td className="py-2 pr-4">
                        <code className="bg-[#F5F5F5] px-1 py-0.5 rounded border border-[#E0E0E0] text-[#4F8A8B]">
                          --kemocon-participants
                        </code>
                      </td>
                      <td className="py-2 text-[#424242]">
                        K-EmoCon participants to process
                      </td>
                      <td className="py-2">
                        <code className="text-[#4464AD]">
                          --kemocon-participants 1 4 5 8
                        </code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card className="border border-[#E0E0E0] shadow-sm">
            <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <CardTitle className="text-[#2D3142] flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-[#7BE495]" />
                Cross-Dataset Training
              </CardTitle>
              <CardDescription className="text-[#424242]">
                Training models across datasets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-lg font-medium mb-2 text-[#2D3142]">
                Basic Training
              </h3>
              <div className="bg-[#F5F5F5] p-4 rounded-md border border-[#E0E0E0]">
                <code className="text-sm text-[#2D3142]">
                  python -m cross_dataset.main --adaptation-method ensemble
                  --target both
                </code>
              </div>
              <p className="text-sm text-[#424242]">
                This will train models for both arousal and valence using the
                ensemble adaptation method.
              </p>

              <h3 className="text-lg font-medium mb-2 mt-4 text-[#2D3142]">
                Python API Example
              </h3>
              <div className="bg-[#F5F5F5] p-4 rounded-md border border-[#E0E0E0]">
                <pre className="text-sm overflow-auto text-[#2D3142]">
                  {`# Import the framework
from cross_dataset.framework import CrossDatasetFramework

# Initialize the framework
framework = CrossDatasetFramework(
    wesad_path="/path/to/wesad",
    kemocon_path="/path/to/kemocon"
)

# Load datasets
framework.load_wesad_data()
framework.load_kemocon_data()

# Train cross-dataset models
results = framework.train_all_models(adaptation_method="ensemble")

# Access results
arousal_results = results["arousal"]
valence_results = results["valence"]`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#E0E0E0] shadow-sm">
            <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <CardTitle className="text-[#2D3142] flex items-center">
                <Zap className="h-5 w-5 mr-2 text-[#7BE495]" />
                Using the API
              </CardTitle>
              <CardDescription className="text-[#424242]">
                Examples of API usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-lg font-medium mb-2 text-[#2D3142]">
                Getting Performance Metrics
              </h3>
              <div className="bg-[#F5F5F5] p-4 rounded-md border border-[#E0E0E0]">
                <pre className="text-sm overflow-auto text-[#2D3142]">
                  {`import requests

# Get performance for valence models
response = requests.get("http://localhost:8087/performance?target=valence")
data = response.json()

# Print accuracy for WESAD to K-EmoCon
for model in data:
    if model["direction"] == "wesad_to_kemocon":
        print(f"Accuracy: {model['accuracy']}")
        print(f"F1 Score: {model['f1_score']}")
        print(f"ROC-AUC: {model['roc_auc']}")`}
                </pre>
              </div>

              <h3 className="text-lg font-medium mb-2 mt-4 text-[#2D3142]">
                Making Predictions
              </h3>
              <div className="bg-[#F5F5F5] p-4 rounded-md border border-[#E0E0E0]">
                <pre className="text-sm overflow-auto text-[#2D3142]">
                  {`import requests
import numpy as np

# Sample ECG signal (700 Hz, 12 seconds)
ecg_signal = np.sin(2 * np.pi * 1.2 * np.linspace(0, 12, 8400))

# Create prediction request
payload = {
    "signals": {
        "ecg": ecg_signal.tolist()
    },
    "dataset": "WESAD",
    "target": "arousal"
}

# Send prediction request
response = requests.post("http://localhost:8087/predict", json=payload)
result = response.json()

print(f"Predicted arousal: {result['predictions']['arousal']['class']}")
print(f"Confidence: {result['predictions']['arousal']['confidence']}")`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold flex items-center text-[#2D3142]">
          <FileCode className="h-5 w-5 mr-2 text-[#4464AD]" />
          Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="justify-start border-[#E0E0E0] text-[#2D3142] hover:bg-[#4464AD]/10 hover:text-[#4464AD] hover:border-[#4464AD]/30"
            asChild
          >
            <Link href="#">
              <Package className="mr-2 h-4 w-4" />
              GitHub Repository
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="justify-start border-[#E0E0E0] text-[#2D3142] hover:bg-[#4F8A8B]/10 hover:text-[#4F8A8B] hover:border-[#4F8A8B]/30"
            asChild
          >
            <Link href="#">
              <Download className="mr-2 h-4 w-4" />
              Download Documentation PDF
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="justify-start border-[#E0E0E0] text-[#2D3142] hover:bg-[#4464AD]/10 hover:text-[#4464AD] hover:border-[#4464AD]/30"
            asChild
          >
            <Link href="/wesad">
              <Brain className="mr-2 h-4 w-4" />
              WESAD Framework Demo
            </Link>
          </Button>
          <Button
            variant="outline"
            className="justify-start border-[#E0E0E0] text-[#2D3142] hover:bg-[#7BE495]/10 hover:text-[#4F8A8B] hover:border-[#7BE495]/30"
            asChild
          >
            <Link href="/cross-dataset">
              <Share2 className="mr-2 h-4 w-4" />
              Cross-Dataset Framework Demo
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
