// import React, { useState, useEffect } from 'react';
// import { getSubjects, getWesadPerformance, getFeatureImportance } from '@/lib/api';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import ConfusionMatrix from '@/components/charts/ConfusionMatrix';
// import FeatureImportance from '@/components/charts/FeatureImportance';
// import AccuracyComparison from '@/components/charts/AccuracyComparison';

// const WesadDemo = () => {
//   const [subjects, setSubjects] = useState<number[]>([]);
//   const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [performance, setPerformance] = useState<any>(null);
//   const [featureData, setFeatureData] = useState<any>(null);
  
//   // Fetch available subjects on component mount
//   useEffect(() => {
//     const fetchSubjects = async () => {
//       const subjectsList = await getSubjects();
//       setSubjects(subjectsList);
//       if (subjectsList.length > 0) {
//         setSelectedSubject(subjectsList[0]);
//       }
//     };
    
//     fetchSubjects();
//   }, []);
  
//   // Fetch subject data when a subject is selected
//   useEffect(() => {
//     const fetchSubjectData = async () => {
//       if (!selectedSubject) return;
      
//       setLoading(true);
      
//       try {
//         // Fetch performance data
//         const perfData = await getWesadPerformance(selectedSubject);
//         setPerformance(perfData);
        
//         // Fetch feature importance data
//         const featData = await getFeatureImportance(selectedSubject);
//         setFeatureData(featData);
//       } catch (error) {
//         console.error('Error fetching subject data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchSubjectData();
//   }, [selectedSubject]);
  
//   // Handle subject selection
//   const handleSubjectChange = (value: string) => {
//     setSelectedSubject(parseInt(value, 10));
//   };
  
//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>WESAD Personalization Demo</CardTitle>
//           <CardDescription>
//             This demo shows how personalized models improve emotion recognition accuracy 
//             within the WESAD dataset.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="mb-6 max-w-xs">
//             <p className="mb-2 text-sm font-medium">Select Subject</p>
//             <Select
//               value={selectedSubject?.toString() || ''}
//               onValueChange={handleSubjectChange}
//               disabled={loading}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a subject" />
//               </SelectTrigger>
//               <SelectContent>
//                 {subjects.map(s => (
//                   <SelectItem key={s} value={s.toString()}>
//                     Subject {s}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>
      
//       {loading ? (
//         <Card>
//           <CardContent className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//           </CardContent>
//         </Card>
//       ) : (
//         <>
//           {performance && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Model Performance Comparison</CardTitle>
//                   <CardDescription>
//                     Comparing different model approaches for Subject {selectedSubject}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <AccuracyComparison
//                     baseAccuracy={performance.base_model_accuracy || 0.80}
//                     personalAccuracy={performance.personal_model_accuracy || 0.85}
//                     ensembleAccuracy={performance.ensemble_model_accuracy || 0.87}
//                     adaptiveAccuracy={performance.adaptive_model_accuracy || 0.88}
//                     subject={selectedSubject}
//                   />
//                 </CardContent>
//               </Card>
              
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Confusion Matrix</CardTitle>
//                   <CardDescription>
//                     Adaptive Model Performance for Subject {selectedSubject}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ConfusionMatrix
//                     data={performance.confusion_matrix || [[45, 5], [8, 42]]}
//                     labels={['Baseline', 'Stress', 'Amusement', 'Meditation']}
//                   />
//                 </CardContent>
//               </Card>
//             </div>
//           )}
          
//           {featureData && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Feature Importance</CardTitle>
//                 <CardDescription>
//                   Most important physiological features for Subject {selectedSubject}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <FeatureImportance data={featureData.feature_importance} />
//               </CardContent>
//             </Card>
//           )}
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Key Insights</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-2">
//                 <li className="flex items-start">
//                   <Badge variant="outline" className="mr-2 mt-1">Insight</Badge>
//                   <span>Personalized models show significant improvement for most subjects</span>
//                 </li>
//                 <li className="flex items-start">
//                   <Badge variant="outline" className="mr-2 mt-1">Insight</Badge>
//                   <span>The adaptive model selection approach provides the best overall performance</span>
//                 </li>
//                 <li className="flex items-start">
//                   <Badge variant="outline" className="mr-2 mt-1">Insight</Badge>
//                   <span>ECG and EMG features are typically most important for emotion recognition</span>
//                 </li>
//                 <li className="flex items-start">
//                   <Badge variant="outline" className="mr-2 mt-1">Insight</Badge>
//                   <span>Feature importance varies significantly between subjects, highlighting individual differences</span>
//                 </li>
//               </ul>
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// };

// export default WesadDemo;