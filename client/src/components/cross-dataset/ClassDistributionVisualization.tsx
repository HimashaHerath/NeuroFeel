import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, PieChart, Info, Activity, ArrowRightLeft, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useClassDistributionVisualization } from '@/hooks/useCrossDatasetData';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Enhanced tooltip component
const InfoTooltip = ({ content }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-[#4F8A8B] cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="bg-white border border-[#E0E0E0] text-[#424242] p-3 max-w-xs shadow-md">
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Animated bar component
const AnimatedBar = ({ label, value, total, color, delay = 0, showLabel = true }) => {
  const percentage = (value / total) * 100;
  
  return (
    <motion.div 
      className="mb-4" 
      initial="hidden" 
      animate="visible" 
      variants={slideIn}
      custom={delay}
    >
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-[#2D3142]">{label}</span>
          <span className="text-sm text-[#424242]">
            {value.toLocaleString()} ({percentage.toFixed(0)}%)
          </span>
        </div>
      )}
      <div className="h-3 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full" 
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

// Animated pie chart component
const AnimatedPieChart = ({ lowValue, highValue, total, colors, label, delay = 0 }) => {
  const lowPercentage = (lowValue / total) * 100;
  const highPercentage = (highValue / total) * 100;
  
  // Calculate angle for the pie slice
  const highAngle = (highValue / total) * 360;
  
  return (
    <motion.div 
      className="flex flex-col items-center mb-4"
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      custom={delay}
    >
      <motion.div 
        className="w-40 h-40 relative mb-4" 
        initial={{ rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 1, delay: delay }}
      >
        <div 
          className="absolute inset-0 rounded-full overflow-hidden shadow-inner"
          style={{ 
            background: `conic-gradient(${colors[1]} 0deg, ${colors[1]} ${highAngle}deg, ${colors[0]} ${highAngle}deg, ${colors[0]} 360deg)`,
            clipPath: `circle(${highPercentage <= 50 ? '100% 100%' : '50% 100%'} at ${highPercentage > 50 ? '100% 100%' : '50% 50%'}), 
              ${highPercentage > 50 ? '50% 100%' : '50% 50%'})`,
            transform: `rotate(${360 - highAngle}deg)`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
          >
            <p className="text-sm font-medium text-[#2D3142]">{label}</p>
            <p className="text-xs text-[#4F8A8B]">
              Ratio: {(lowValue < highValue ? lowValue/highValue : highValue/lowValue).toFixed(2)}
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-2 gap-6 w-full">
        <motion.div 
          className="flex items-center"
          variants={fadeIn}
          custom={delay + 0.3}
        >
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[0] }}></div>
          <span className="text-xs text-[#424242]">Low: {lowPercentage.toFixed(0)}%</span>
        </motion.div>
        <motion.div 
          className="flex items-center"
          variants={fadeIn}
          custom={delay + 0.4}
        >
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[1] }}></div>
          <span className="text-xs text-[#424242]">High: {highPercentage.toFixed(0)}%</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Dataset comparison section
const DatasetComparisonCard = ({ wesadData, kemoconData }) => {
  const wesadTotal = wesadData.total;
  const kemoconTotal = kemoconData.total;
  const ratio = Math.round(wesadTotal / kemoconTotal);
  
  return (
    <motion.div 
      className="mb-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <Card className="border border-[#E0E0E0] overflow-hidden">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
          <CardTitle className="text-[#2D3142] text-lg">
            <ArrowRightLeft className="w-5 h-5 inline-block mr-2 text-[#4464AD]" />
            Dataset Size Comparison
          </CardTitle>
          <CardDescription className="text-[#424242]">
            Sample distribution between laboratory and in-the-wild environments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div 
              className="bg-[#4464AD]/10 rounded-lg p-4 text-center"
              variants={slideIn}
            >
              <p className="text-lg font-semibold text-[#4464AD] mb-1">
                Laboratory Setting
              </p>
              <p className="text-3xl font-bold text-[#2D3142] mb-2">
                {wesadTotal.toLocaleString()}
              </p>
              <p className="text-sm text-[#424242]">WESAD Dataset</p>
            </motion.div>
            <motion.div 
              className="bg-[#4F8A8B]/10 rounded-lg p-4 text-center"
              variants={slideIn}
            >
              <p className="text-lg font-semibold text-[#4F8A8B] mb-1">
                Real-World Setting
              </p>
              <p className="text-3xl font-bold text-[#2D3142] mb-2">
                {kemoconTotal.toLocaleString()}
              </p>
              <p className="text-sm text-[#424242]">K-EmoCon Dataset</p>
            </motion.div>
          </div>

          <motion.div 
            className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]"
            variants={fadeIn}
          >
            <div className="space-y-2">
              <motion.div 
                className="flex items-start"
                variants={slideIn}
              >
                <div className="w-6 h-6 rounded-full bg-[#4464AD] text-white flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-[#424242]">
                  WESAD contains {ratio}x more samples than K-EmoCon ({wesadTotal.toLocaleString()} vs {kemoconTotal.toLocaleString()}), potentially affecting cross-dataset generalization.
                </p>
              </motion.div>
              <motion.div 
                className="flex items-start"
                variants={slideIn}
              >
                <div className="w-6 h-6 rounded-full bg-[#4F8A8B] text-white flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold">i</span>
                </div>
                <p className="text-sm text-[#424242]">
                  This significant difference in dataset size highlights the challenges of collecting physiological data in real-world settings.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main component
const ClassDistributionVisualization = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading, error } = useClassDistributionVisualization();
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="border border-[#E0E0E0] shadow-sm">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 text-[#4F8A8B] animate-spin mr-3" />
          <p className="text-[#424242] text-lg">Loading distribution data...</p>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error || !data || !data.data) {
    return (
      <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border-[#F76C5E]/20">
        <AlertTitle className="font-medium">Error Loading Data</AlertTitle>
        <AlertDescription>
          {error?.toString() || "Failed to load distribution data. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Process data from API
  const arousalData = data.data
    .filter(item => item.target === 'arousal')
    .map(item => ({
      dataset: item.dataset,
      low: item.low_count,
      high: item.high_count,
      ratio: item.ratio,
      total: item.low_count + item.high_count,
      target: item.target
    }));
  
  // Check if we have the required data
  if (arousalData.length < 2) {
    return (
      <Alert className="bg-[#F5F5F5] border-[#E0E0E0] text-[#2D3142]">
        <AlertTitle>Incomplete Data</AlertTitle>
        <AlertDescription>
          Not enough data to compare WESAD and K-EmoCon distributions.
        </AlertDescription>
      </Alert>
    );
  }
  
  const wesadData = arousalData.find(item => item.dataset === 'WESAD') || arousalData[0];
  const kemoconData = arousalData.find(item => item.dataset === 'K-EmoCon') || arousalData[1];
  
  return (
    <Card className="border border-[#E0E0E0] shadow-sm overflow-hidden">
      <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-[#2D3142] flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-[#4464AD]" />
              Class Distribution Analysis
            </CardTitle>
            <CardDescription className="text-[#424242]">
              Analyzing arousal balance across different data collection environments
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-[#4F8A8B]/10 flex items-center justify-center cursor-help">
                  <Info className="h-4 w-4 text-[#4F8A8B]" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-[#E0E0E0] text-[#424242] p-3 max-w-xs shadow-md">
                <p>This visualization compares class distributions between laboratory (WESAD) and real-world (K-EmoCon) datasets, showing how arousal states vary across environments.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none bg-white border-b border-[#E0E0E0] p-0">
            <TabsTrigger 
              value="overview" 
              className="flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-[#4464AD] data-[state=active]:text-[#4464AD] data-[state=active]:bg-[#4464AD]/5"
            >
              <div className="flex items-center justify-center">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="bars"
              className="flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-[#4F8A8B] data-[state=active]:text-[#4F8A8B] data-[state=active]:bg-[#4F8A8B]/5"
            >
              <div className="flex items-center justify-center">
                <BarChart2 className="w-4 h-4 mr-2" />
                Bar Charts
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="pies"
              className="flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-[#7BE495] data-[state=active]:text-[#7BE495] data-[state=active]:bg-[#7BE495]/5"
            >
              <div className="flex items-center justify-center">
                <PieChart className="w-4 h-4 mr-2" />
                Pie Charts
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      
      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div 
            key="overview-tab"
            className="p-6" 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <DatasetComparisonCard wesadData={wesadData} kemoconData={kemoconData} />

            <motion.div 
              className="bg-white rounded-lg border border-[#E0E0E0] p-4 mb-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div 
                className="mb-4 pb-4 border-b border-[#E0E0E0]"
                variants={slideIn}
              >
                <h3 className="text-lg font-medium text-[#2D3142] mb-2 flex items-center">
                  <Info className="w-5 h-5 text-[#4464AD] mr-2" />
                  About class distributions:
                </h3>
                <p className="text-sm text-[#424242]">
                  Class balance is crucial for effective machine learning. The ratio indicates 
                  how balanced the classes are (closer to 1.0 is better). Arousal represents 
                  energy level, with low arousal indicating calmness and high arousal indicating excitement.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div 
                  className="bg-[#4464AD]/10 rounded-lg p-4 relative overflow-hidden"
                  variants={slideIn}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-[#4464AD]">
                        <Activity className="w-4 h-4 inline mr-2" />
                        WESAD Dataset
                        <span className="block text-xs font-normal text-[#424242] mt-1">Laboratory conditions</span>
                      </h4>
                      <Badge className="bg-[#4464AD]/20 text-[#4464AD] border-[#4464AD]/30">
                        Ratio: {wesadData.ratio.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <AnimatedBar 
                      label="Low Arousal" 
                      value={wesadData.low} 
                      total={wesadData.total} 
                      color="#4ADEDE" 
                      delay={0.1}
                    />
                    <AnimatedBar 
                      label="High Arousal" 
                      value={wesadData.high} 
                      total={wesadData.total} 
                      color="#F76C5E" 
                      delay={0.2}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-[#4F8A8B]/10 rounded-lg p-4 relative overflow-hidden"
                  variants={slideIn}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-[#4F8A8B]">
                        <Activity className="w-4 h-4 inline mr-2" />
                        K-EmoCon Dataset
                        <span className="block text-xs font-normal text-[#424242] mt-1">Real-world conditions</span>
                      </h4>
                      <Badge className="bg-[#4F8A8B]/20 text-[#4F8A8B] border-[#4F8A8B]/30">
                        Ratio: {kemoconData.ratio.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <AnimatedBar 
                      label="Low Arousal" 
                      value={kemoconData.low} 
                      total={kemoconData.total} 
                      color="#4ADEDE" 
                      delay={0.3}
                    />
                    <AnimatedBar 
                      label="High Arousal" 
                      value={kemoconData.high} 
                      total={kemoconData.total} 
                      color="#F76C5E" 
                      delay={0.4}
                    />
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg p-4"
                variants={fadeIn}
              >
                <h3 className="text-md font-medium text-[#2D3142] mb-3 flex items-center">
                  <Zap className="w-4 h-4 text-[#7BE495] mr-2" />
                  Key Insights
                </h3>
                <div className="space-y-4">
                  <motion.div 
                    className="flex"
                    variants={slideIn}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#4464AD] text-white flex items-center justify-center shrink-0 mr-3">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-[#424242]">
                      Class imbalance is more severe in K-EmoCon: The real-world dataset 
                      shows a ratio of {kemoconData.ratio.toFixed(2)} compared to WESAD's {wesadData.ratio.toFixed(2)}, 
                      indicating more challenging classification in natural settings.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="flex"
                    variants={slideIn}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#4F8A8B] text-white flex items-center justify-center shrink-0 mr-3">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm text-[#424242]">
                      Low arousal predominates in both datasets: Both laboratory and 
                      real-world settings show more calm/relaxed states than excited states, suggesting a natural bias towards 
                      lower arousal in physiological recordings.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Bar Charts Tab */}
        {activeTab === 'bars' && (
          <motion.div 
            key="bars-tab"
            className="p-6" 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            {/* Distribution Comparison */}
            <motion.div 
              className="mb-8"
              variants={staggerContainer}
            >
              <Card className="border border-[#E0E0E0] shadow-sm overflow-hidden">
                <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
                  <CardTitle className="text-lg text-[#2D3142]">
                    Side-by-Side Class Distribution
                  </CardTitle>
                  <CardDescription className="text-[#424242]">
                    Comparing low vs high arousal across datasets
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6 mb-6">
                    <motion.div 
                      className="space-y-3"
                      variants={slideIn}
                    >
                      <h4 className="text-md font-medium text-[#2D3142] flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#4ADEDE] mr-2"></div>
                        Low Arousal (Calm)
                      </h4>

                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center">
                          <div className="w-20 text-sm text-[#4464AD] font-medium">
                            WESAD
                            <span className="block text-xs font-normal text-[#424242]">{wesadData.low.toLocaleString()} samples</span>
                          </div>
                          <div className="flex-1 ml-3">
                            <AnimatedBar 
                              value={wesadData.low} 
                              total={Math.max(wesadData.low, kemoconData.low) * 1.1} 
                              color="#4464AD" 
                              delay={0.1}
                              showLabel={false}
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-20 text-sm text-[#4F8A8B] font-medium">
                            K-EmoCon
                            <span className="block text-xs font-normal text-[#424242]">{kemoconData.low.toLocaleString()} samples</span>
                          </div>
                          <div className="flex-1 ml-3">
                            <AnimatedBar 
                              value={kemoconData.low} 
                              total={Math.max(wesadData.low, kemoconData.low) * 1.1} 
                              color="#4F8A8B" 
                              delay={0.2}
                              showLabel={false}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-3 pt-6 border-t border-[#E0E0E0]"
                      variants={slideIn}
                    >
                      <h4 className="text-md font-medium text-[#2D3142] flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#F76C5E] mr-2"></div>
                        High Arousal (Excited)
                      </h4>

                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center">
                          <div className="w-20 text-sm text-[#4464AD] font-medium">
                            WESAD
                            <span className="block text-xs font-normal text-[#424242]">{wesadData.high.toLocaleString()} samples</span>
                          </div>
                          <div className="flex-1 ml-3">
                            <AnimatedBar 
                              value={wesadData.high} 
                              total={Math.max(wesadData.high, kemoconData.high) * 1.1} 
                              color="#4464AD" 
                              delay={0.3}
                              showLabel={false}
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-20 text-sm text-[#4F8A8B] font-medium">
                            K-EmoCon
                            <span className="block text-xs font-normal text-[#424242]">{kemoconData.high.toLocaleString()} samples</span>
                          </div>
                          <div className="flex-1 ml-3">
                            <AnimatedBar 
                              value={kemoconData.high} 
                              total={Math.max(wesadData.high, kemoconData.high) * 1.1} 
                              color="#4F8A8B" 
                              delay={0.4}
                              showLabel={false}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="mt-6 bg-[#F5F5F5] rounded-lg p-3 text-sm text-[#424242] border border-[#E0E0E0]"
                    variants={fadeIn}
                  >
                    <div className="flex items-start">
                      <Info className="w-4 h-4 text-[#4F8A8B] mr-2 mt-0.5" />
                      <p>
                        Note: The scale above shows absolute sample counts. WESAD has 
                        approximately {Math.round(wesadData.total/kemoconData.total)}x more samples than K-EmoCon 
                        across both classes.
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Class Balance Ratio */}
            <motion.div
              variants={staggerContainer}
            >
              <Card className="border border-[#E0E0E0] shadow-sm overflow-hidden">
                <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0] pb-3">
                  <CardTitle className="text-lg text-[#2D3142]">
                    Class Balance Ratio Comparison
                  </CardTitle>
                  <CardDescription className="text-[#424242]">
                    Ratio between low and high arousal (closer to 1.0 = better balance)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <motion.div 
                      className="bg-[#4464AD]/10 rounded-lg p-4 relative overflow-hidden"
                      variants={slideIn}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-[#4464AD]">
                          WESAD
                          <span className="text-lg font-bold block">Ratio: {wesadData.ratio.toFixed(2)}</span>
                        </h4>
                        <div className="rounded-lg bg-white border border-[#E0E0E0] p-2 shadow-sm">
                          <div className="text-center text-sm font-medium text-[#2D3142]">
                            Low:High
                            <div className="text-[#4464AD]">{wesadData.low}:{wesadData.high}</div>
                          </div>
                          <div className="text-xs text-center text-[#424242] mt-1">
                            The ratio of minority to majority class
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <AnimatedBar 
                          value={wesadData.ratio * 100} 
                          total={100} 
                          color="#4464AD" 
                          delay={0.1}
                          showLabel={false}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-[#4F8A8B]/10 rounded-lg p-4 relative overflow-hidden"
                      variants={slideIn}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-[#4F8A8B]">
                          K-EmoCon
                          <span className="text-lg font-bold block">Ratio: {kemoconData.ratio.toFixed(2)}</span>
                        </h4>
                        <div className="rounded-lg bg-white border border-[#E0E0E0] p-2 shadow-sm">
                          <div className="text-center text-sm font-medium text-[#2D3142]">
                            Low:High
                            <div className="text-[#4F8A8B]">{kemoconData.low}:{kemoconData.high}</div>
                          </div>
                          <div className="text-xs text-center text-[#424242] mt-1">
                            The ratio of minority to majority class
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <AnimatedBar 
                          value={kemoconData.ratio * 100} 
                          total={100} 
                          color="#4F8A8B" 
                          delay={0.2}
                          showLabel={false}
                        />
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg p-4"
                    variants={fadeIn}
                  >
                    <div className="flex items-start">
                      <Zap className="w-5 h-5 text-[#7BE495] mr-2 mt-0.5 shrink-0" />
                      <div className="space-y-3">
                        <p className="text-sm text-[#424242]">
                          WESAD shows better class balance with a ratio of {wesadData.ratio.toFixed(2)} 
                          compared to K-EmoCon's {kemoconData.ratio.toFixed(2)}. 
                        </p>
                        <p className="text-sm text-[#424242]">
                          This difference suggests that laboratory conditions produce more balanced arousal states than 
                          real-world environments, where lower arousal tends to predominate.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
        
        {/* Pie Charts Tab */}
        {activeTab === 'pies' && (
          <motion.div 
            key="pies-tab"
            className="p-6" 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <motion.div 
                variants={scaleIn}
                className="bg-white rounded-lg p-4 border border-[#E0E0E0] shadow-sm"
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-[#4464AD]">
                    WESAD Distribution
                  </h3>
                  <p className="text-sm text-[#424242]">
                    {wesadData.total.toLocaleString()} samples
                  </p>
                </div>
                <div className="flex justify-center">
                  <AnimatedPieChart 
                    lowValue={wesadData.low}
                    highValue={wesadData.high}
                    total={wesadData.total}
                    colors={['#4ADEDE', '#F76C5E']}
                    label="Arousal"
                    delay={0.1}
                  />
                </div>
              </motion.div>
              
              <motion.div 
                variants={scaleIn}
                className="bg-white rounded-lg p-4 border border-[#E0E0E0] shadow-sm"
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-[#4F8A8B]">
                    K-EmoCon Distribution
                  </h3>
                  <p className="text-sm text-[#424242]">
                    {kemoconData.total.toLocaleString()} samples
                  </p>
                </div>
                <div className="flex justify-center">
                  <AnimatedPieChart 
                    lowValue={kemoconData.low}
                    highValue={kemoconData.high}
                    total={kemoconData.total}
                    colors={['#4ADEDE', '#F76C5E']}
                    label="Arousal"
                    delay={0.2}
                  />
                </div>
              </motion.div>
            </div>

            <motion.div 
              variants={fadeIn}
              className="bg-white rounded-lg p-4 border border-[#E0E0E0] shadow-sm"
            >
              <h3 className="text-lg font-medium text-[#2D3142] mb-4">
                Distribution Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <motion.div 
                  variants={slideIn}
                  className="space-y-2"
                >
                  <h4 className="text-md font-medium text-[#4464AD]">
                    WESAD Distribution
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#4ADEDE]/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-[#424242] mb-1">
                        Low Arousal
                      </p>
                      <p className="text-sm font-medium text-[#2D3142]">
                        {wesadData.low.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#4ADEDE]">
                        ({((wesadData.low/wesadData.total)*100).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="bg-[#F76C5E]/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-[#424242] mb-1">
                        High Arousal
                      </p>
                      <p className="text-sm font-medium text-[#2D3142]">
                        {wesadData.high.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#F76C5E]">
                        ({((wesadData.high/wesadData.total)*100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={slideIn}
                  className="space-y-2"
                >
                  <h4 className="text-md font-medium text-[#4F8A8B]">
                    K-EmoCon Distribution
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#4ADEDE]/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-[#424242] mb-1">
                        Low Arousal
                      </p>
                      <p className="text-sm font-medium text-[#2D3142]">
                        {kemoconData.low.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#4ADEDE]">
                        ({((kemoconData.low/kemoconData.total)*100).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="bg-[#F76C5E]/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-[#424242] mb-1">
                        High Arousal
                      </p>
                      <p className="text-sm font-medium text-[#2D3142]">
                        {kemoconData.high.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#F76C5E]">
                        ({((kemoconData.high/kemoconData.total)*100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                variants={fadeIn}
                className="bg-[#F5F5F5] rounded-lg p-3 text-sm text-[#424242] border border-[#E0E0E0] mt-4"
              >
                <p>
                  <span className="font-medium text-[#2D3142]">Cross-Dataset Implications:</span> The greater class imbalance in K-EmoCon may require 
                  class weighting or oversampling techniques when transferring models trained on WESAD to real-world applications.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </CardContent>
      
      <CardFooter className="bg-[#F5F5F5] border-t border-[#E0E0E0] py-3 px-6 flex justify-between items-center">
        <div className="text-xs text-[#424242]">
          Class balance ratio = minority class count / majority class count (closer to 1.0 = better)
        </div>
        <div className="text-xs text-[#4F8A8B]/80">
          Data updated March 2025
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClassDistributionVisualization;