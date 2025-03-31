"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  BrainCircuit, 
  ArrowLeftRight,
  Database,
  Layers,
  Network,
  UserCheck,
  Activity,
  GitCompare,
  LineChart,
  Zap,
  HeartPulse,
  BarChart2,
  Code,
  Fingerprint
} from "lucide-react";

export default function FrameworksPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <Badge className="mb-4 px-3 py-1 text-sm border-[#B8B8FF] bg-black">
            Technical Architecture
          </Badge>
          <h1 className="text-4xl font-bold text-[#2D3142] mb-4">
            NeuroFeel Technical Frameworks
          </h1>
          <p className="text-xl text-[#424242] max-w-3xl mx-auto">
            Explore the technical architecture and methodologies behind our emotion recognition frameworks
          </p>
        </motion.div>

        <Tabs defaultValue="wesad" className="w-full mb-12">
          <TabsList className="w-full  grid-cols-2 mb-8 rounded-lg bg-[#E0E0E0]">
            <TabsTrigger 
              value="wesad" 
              className="text-base py-4 data-[state=active]:bg-[#4464AD] data-[state=active]:text-white transition-all"
            >
              <div className="flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2" />
                <span>WESAD Personalization</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="cross-dataset" 
              className="text-base py-4 data-[state=active]:bg-[#4F8A8B] data-[state=active]:text-white transition-all"
            >
              <div className="flex items-center">
                <ArrowLeftRight className="h-5 w-5 mr-2" />
                <span>Cross-Dataset Framework</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wesad" className="p-1">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={itemVariants}
            >
              <div className="lg:col-span-2">
                <Card className="shadow-lg h-full border-t-[#4464AD] border-t-4">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#2D3142]">WESAD Personalization Framework Architecture</CardTitle>
                    <CardDescription>Technical implementation of our adaptive model selection system</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
                      <h3 className="font-semibold text-[#4464AD] mb-2 flex items-center">
                        <Layers className="h-5 w-5 mr-2" />
                        Model Architecture
                      </h3>
                      <p className="text-[#424242] mb-3">
                        The framework implements a four-tiered model architecture with the following components:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Base Model</h4>
                          <p className="text-sm text-[#424242]">
                            Neural network trained on data from all subjects except the target subject using leave-one-out validation
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Personal Model</h4>
                          <p className="text-sm text-[#424242]">
                            Transfer learning model initialized with base model weights and fine-tuned with minimal subject data
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Ensemble Model</h4>
                          <p className="text-sm text-[#424242]">
                            Weighted combination of base and personal models with optimal weights learned from validation data
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Adaptive Model</h4>
                          <p className="text-sm text-[#424242]">
                            Dynamic selection between base and personal models based on confidence thresholds
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
                      <h3 className="font-semibold text-[#4464AD] mb-2 flex items-center">
                        <Fingerprint className="h-5 w-5 mr-2" />
                        Technical Innovations
                      </h3>

                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Diversity-aware Calibration</h4>
                          <p className="text-sm text-[#424242]">
                            Uses k-means clustering to select the most representative and diverse calibration examples for each emotion class, maximizing information content with minimal data
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Confidence-based Selection</h4>
                          <p className="text-sm text-[#424242]">
                            Novel algorithm that analyzes prediction confidence from both models to dynamically switch between them during inference
                          </p>
                          <div className="text-xs text-[#4464AD] mt-1">
                            <code>threshold = 0.65</code> for optimal performance based on validation studies
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Subject-specific Feature Importance</h4>
                          <p className="text-sm text-[#424242]">
                            Identifies distinctive physiological patterns for each subject using mutual information criterion
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
                      <h3 className="font-semibold text-[#4464AD] mb-2 flex items-center">
                        <Code className="h-5 w-5 mr-2" />
                        Implementation Details
                      </h3>

                      <div className="space-y-3">
                        <div className="flex">
                          <div className="w-32 min-w-[8rem] font-medium text-[#2D3142]">Base Models</div>
                          <div className="text-sm text-[#424242]">
                            <code>MLPClassifier(hidden_layers=(64, 32), alpha=0.01)</code>, with options for RandomForest and SVM
                          </div>
                        </div>

                        <div className="flex">
                          <div className="w-32 min-w-[8rem] font-medium text-[#2D3142]">Features</div>
                          <div className="text-sm text-[#424242]">
                            Top 20 statistical, temporal, and energy features selected via mutual information
                          </div>
                        </div>

                        <div className="flex">
                          <div className="w-32 min-w-[8rem] font-medium text-[#2D3142]">Segmentation</div>
                          <div className="text-sm text-[#424242]">
                            8400 samples per window with 4200 sample overlap (50%)
                          </div>
                        </div>

                        <div className="flex">
                          <div className="w-32 min-w-[8rem] font-medium text-[#2D3142]">Calibration</div>
                          <div className="text-sm text-[#424242]">
                            5 examples per emotion class, selected via diversity-aware clustering
                          </div>
                        </div>

                        <div className="flex">
                          <div className="w-32 min-w-[8rem] font-medium text-[#2D3142]">Validation</div>
                          <div className="text-sm text-[#424242]">
                            Temporal train/test split (70%/30%) to preserve temporal patterns
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button className="bg-[#4464AD] hover:bg-[#4464AD]/80 w-full" asChild>
                      <Link href="/wesad">
                        <span className="flex items-center justify-center">
                          Explore WESAD Framework Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card className="shadow-lg h-full border-t-[#4464AD] border-t-4">
                  <CardHeader>
                    <CardTitle>Technical Results</CardTitle>
                    <CardDescription>Performance metrics and analysis</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-[#424242] mb-2">Model Performance Comparison</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Base Model</span>
                              <span className="font-medium">86.36%</span>
                            </div>
                            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                              <div className="bg-[#4464AD] h-2 rounded-full" style={{ width: "86.36%" }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Personal Model</span>
                              <span className="font-medium">84.51%</span>
                            </div>
                            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                              <div className="bg-[#4464AD] h-2 rounded-full" style={{ width: "84.51%" }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Ensemble Model</span>
                              <span className="font-medium">87.52%</span>
                            </div>
                            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                              <div className="bg-[#4464AD] h-2 rounded-full" style={{ width: "87.52%" }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Adaptive Model</span>
                              <span className="font-medium text-[#4464AD]">88.16%</span>
                            </div>
                            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                              <div className="bg-[#4464AD] h-2 rounded-full" style={{ width: "88.16%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#E0E0E0]">
                        <h4 className="text-sm font-medium text-[#424242] mb-2">F1-Score Comparison</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Base Model</span>
                              <span className="font-medium">85.75%</span>
                            </div>
                            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                              <div className="bg-[#4464AD] h-2 rounded-full" style={{ width: "85.75%" }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Personal Model</span>
                              <span className="font-medium">84.58%</span>
                            </div>
                            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                              <div className="bg-[#4464AD] h-2 rounded-full" style={{ width: "84.58%" }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Ensemble Model</span>
                              <span className="font-medium">87.05%</span>
                            </div>
                            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                              <div className="bg-[#4464AD] h-2 rounded-full" style={{ width: "87.05%" }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Adaptive Model</span>
                              <span className="font-medium text-[#4464AD]">87.85%</span>
                            </div>
                            <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                              <div className="bg-[#4464AD] h-2 rounded-full" style={{ width: "87.85%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#E0E0E0]">
                        <h4 className="text-sm font-medium text-[#424242] mb-2">Most Important Features</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span>chest_emg_iqr</span>
                            <Badge className="bg-[#4464AD]">0.3365</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>chest_emg_max</span>
                            <Badge className="bg-[#4464AD]">0.3248</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>chest_ecg_min</span>
                            <Badge className="bg-[#4464AD]">0.3206</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>chest_emg_std</span>
                            <Badge className="bg-[#4464AD]">0.3011</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>chest_emg_energy</span>
                            <Badge className="bg-[#4464AD]">0.2931</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="cross-dataset" className="p-1">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={itemVariants}
            >
              <div className="lg:col-span-2">
                <Card className="shadow-lg h-full border-t-[#4F8A8B] border-t-4">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#2D3142]">Cross-Dataset Framework Architecture</CardTitle>
                    <CardDescription>Technical implementation of our domain adaptation system</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
                      <h3 className="font-semibold text-[#4F8A8B] mb-2 flex items-center">
                        <Database className="h-5 w-5 mr-2" />
                        Dataset Integration
                      </h3>
                      <p className="text-[#424242] mb-3">
                        The framework bridges two fundamentally different emotion recognition datasets:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">WESAD Dataset</h4>
                          <div className="text-sm text-[#424242] space-y-2">
                            <div className="flex justify-between">
                              <span>Environment:</span>
                              <span className="font-medium">Laboratory</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Emotion Model:</span>
                              <span className="font-medium">Discrete</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sampling Rate:</span>
                              <span className="font-medium">700 Hz</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Main Sensors:</span>
                              <span className="font-medium">ECG, EMG, EDA</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">K-EmoCon Dataset</h4>
                          <div className="text-sm text-[#424242] space-y-2">
                            <div className="flex justify-between">
                              <span>Environment:</span>
                              <span className="font-medium">In-the-wild</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Emotion Model:</span>
                              <span className="font-medium">Dimensional</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sampling Rate:</span>
                              <span className="font-medium">4 Hz</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Main Sensors:</span>
                              <span className="font-medium">HR, EDA, BVP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
                      <h3 className="font-semibold text-[#4F8A8B] mb-2 flex items-center">
                        <Network className="h-5 w-5 mr-2" />
                        Domain Adaptation Methods
                      </h3>

                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">CORAL (CORrelation ALignment)</h4>
                          <p className="text-sm text-[#424242]">
                            Transforms the source domain features by aligning second-order statistics between domains, effectively matching covariance structures
                          </p>
                          <div className="text-xs text-[#4F8A8B] mt-1">
                            <code>CORAL_REG_PARAM = 0.1</code> for optimal regularization
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Subspace Alignment</h4>
                          <p className="text-sm text-[#424242]">
                            Finds a transformation matrix to align the principal component subspaces between domains, preserving the most important variance directions
                          </p>
                          <div className="text-xs text-[#4F8A8B] mt-1">
                            <code>SUBSPACE_MIN_COMPONENTS = 2</code> with adaptive component selection
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">Ensemble Adaptation</h4>
                          <p className="text-sm text-[#424242]">
                            Novel weighted combination of multiple adaptation techniques that provides more robust domain transfer than individual methods
                          </p>
                          <div className="text-xs text-[#4F8A8B] mt-1">
                            <code>ENSEMBLE_WEIGHTS = [0.4, 0.4, 0.2]</code> for subspace, CORAL, and scaling
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
                      <h3 className="font-semibold text-[#4F8A8B] mb-2 flex items-center">
                        <GitCompare className="h-5 w-5 mr-2" />
                        Bidirectional Evaluation Framework
                      </h3>

                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">WESAD → K-EmoCon</h4>
                          <p className="text-sm text-[#424242]">
                            Models trained on laboratory data (WESAD) and evaluated on real-world data (K-EmoCon)
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-[#F5F5F5] p-2 rounded text-xs">
                              <span className="font-medium text-[#4F8A8B]">Arousal:</span> 63.14% accuracy
                            </div>
                            <div className="bg-[#F5F5F5] p-2 rounded text-xs">
                              <span className="font-medium text-[#4F8A8B]">Valence:</span> 80.27% accuracy
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                          <h4 className="font-medium text-[#2D3142] mb-1">K-EmoCon → WESAD</h4>
                          <p className="text-sm text-[#424242]">
                            Models trained on real-world data (K-EmoCon) and evaluated on laboratory data (WESAD)
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-[#F5F5F5] p-2 rounded text-xs">
                              <span className="font-medium text-[#4F8A8B]">Arousal:</span> 65.57% accuracy
                            </div>
                            <div className="bg-[#F5F5F5] p-2 rounded text-xs">
                              <span className="font-medium text-[#4F8A8B]">Valence:</span> 61.62% accuracy
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button className="bg-[#4F8A8B] hover:bg-[#4F8A8B]/80 w-full" asChild>
                      <Link href="/cross-dataset">
                        <span className="flex items-center justify-center">
                          Explore Cross-Dataset Framework Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card className="shadow-lg h-full border-t-[#4F8A8B] border-t-4">
                  <CardHeader>
                    <CardTitle>Technical Results</CardTitle>
                    <CardDescription>Performance metrics and analysis</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-[#424242] mb-2">Domain Gap Reduction</h4>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0] mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">WESAD → K-EmoCon</span>
                          <Badge className="bg-[#4F8A8B]">40%</Badge>
                        </div>
                        <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                          <div className="bg-[#4F8A8B] h-2 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                        <div className="text-xs text-[#424242] mt-2">
                          <div className="flex justify-between">
                            <span>Before:</span>
                            <span>2,772,967.65</span>
                          </div>
                          <div className="flex justify-between">
                            <span>After:</span>
                            <span>1,663,781.53</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E0E0E0]">
                      <h4 className="text-sm font-medium text-[#424242] mb-2">WESAD → K-EmoCon Performance</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <Badge className="bg-[#4ADEDE]/20 text-[#4ADEDE] border-[#4ADEDE]/50 mr-2">
                                Arousal
                              </Badge>
                            </div>
                            <Badge className="bg-[#4F8A8B]">63.14%</Badge>
                          </div>
                          <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                            <div className="bg-[#4ADEDE] h-2 rounded-full" style={{ width: "63.14%" }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-[#424242] mt-1">
                            <span>F1-score: 62.17%</span>
                            <span>ROC-AUC: 52.08%</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <Badge className="bg-[#7BE495]/20 text-[#7BE495] border-[#7BE495]/50 mr-2">
                                Valence
                              </Badge>
                            </div>
                            <Badge className="bg-[#4F8A8B]">80.27%</Badge>
                          </div>
                          <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                            <div className="bg-[#7BE495] h-2 rounded-full" style={{ width: "80.27%" }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-[#424242] mt-1">
                            <span>F1-score: 71.86%</span>
                            <span>ROC-AUC: 48.50%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E0E0E0]">
                      <h4 className="text-sm font-medium text-[#424242] mb-2">Common Feature Mapping</h4>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-[#E0E0E0]">
                        <div className="space-y-1 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-1 bg-[#4ADEDE]/10 rounded">ECG_max</div>
                            <div className="p-1 bg-[#4F8A8B]/10 rounded">HR_max</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-1 bg-[#4ADEDE]/10 rounded">ECG_min</div>
                            <div className="p-1 bg-[#4F8A8B]/10 rounded">HR_min</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-1 bg-[#4ADEDE]/10 rounded">ECG_energy</div>
                            <div className="p-1 bg-[#4F8A8B]/10 rounded">HR_energy</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-1 bg-[#4ADEDE]/10 rounded">ECG_std</div>
                            <div className="p-1 bg-[#4F8A8B]/10 rounded">HR_std</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-1 bg-[#4ADEDE]/10 rounded">ECG_mean</div>
                            <div className="p-1 bg-[#4F8A8B]/10 rounded">HR_mean</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div 
          className="mt-12 bg-white p-8 rounded-xl shadow-md"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-[#2D3142] mb-6">Technical Comparison</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#E0E0E0]">
                  <th className="py-3 px-4 text-left text-[#2D3142] font-semibold">Characteristic</th>
                  <th className="py-3 px-4 text-left text-[#4464AD] font-semibold">WESAD Framework</th>
                  <th className="py-3 px-4 text-left text-[#4F8A8B] font-semibold">Cross-Dataset Framework</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 font-medium">Primary Challenge</td>
                  <td className="py-3 px-4">Personalization with minimal data</td>
                  <td className="py-3 px-4">Domain gap between datasets</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Core Architecture</td>
                  <td className="py-3 px-4">Four-tiered model selection</td>
                  <td className="py-3 px-4">Ensemble domain adaptation</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Key Algorithm</td>
                  <td className="py-3 px-4">Confidence-based selection</td>
                  <td className="py-3 px-4">Multi-method adaptation</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Target Variables</td>
                  <td className="py-3 px-4">4 emotion classes</td>
                  <td className="py-3 px-4">Arousal & valence dimensions</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Implementation</td>
                  <td className="py-3 px-4">EnhancedPersonalizationFramework</td>
                  <td className="py-3 px-4">CrossDatasetFramework</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Best Performance</td>
                  <td className="py-3 px-4">88.16% accuracy (adaptive)</td>
                  <td className="py-3 px-4">80.27% accuracy (valence)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Feature Selection</td>
                  <td className="py-3 px-4">Top 20 via mutual information</td>
                  <td className="py-3 px-4">9 common mapped features</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Base Classifier</td>
                  <td className="py-3 px-4">Neural Network (MLP)</td>
                  <td className="py-3 px-4">Ensemble (RF, GB, SVM)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          variants={itemVariants}
        >
          <Button 
            className="bg-gradient-to-r from-[#4464AD] to-[#4F8A8B] text-white hover:from-[#2D3142] hover:to-[#2D3142] shadow-md"
            size="lg"
            asChild
          >
            <Link href="/demo">
              <span className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Try Interactive Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}