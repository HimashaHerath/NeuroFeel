import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDomainGapVisualization } from '@/hooks/useCrossDatasetData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  ReferenceLine
} from 'recharts';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { createObjectToCsv, downloadCsv } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Biometric Spectrum theme colors
const DOMAIN_COLORS = {
  'WESAD': '#4464AD',     // Slate Blue
  'K-EmoCon': '#4F8A8B',  // Teal
  'Adapted': '#7BE495',   // Mint
};

// Custom tooltip with detailed information
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-md shadow-lg border border-[#E0E0E0] text-sm max-w-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: point.color || '#888' }}></div>
          <p className="font-bold text-[#2D3142]">{point.domain}</p>
        </div>
        <p className="text-xs text-[#424242] mt-1">{point.description || 'Feature point'}</p>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="font-medium text-[#2D3142]">PC1:</div>
          <div className="text-[#424242]">{point.x.toFixed(3)}</div>
          <div className="font-medium text-[#2D3142]">PC2:</div>
          <div className="text-[#424242]">{point.y.toFixed(3)}</div>
        </div>
        {point.topFeatures && Object.keys(point.topFeatures).length > 0 && (
          <div className="mt-3 border-t border-[#E0E0E0] pt-2">
            <div className="font-semibold text-xs text-[#2D3142]">Top Contributing Features:</div>
            <div className="grid grid-cols-2 gap-x-2 mt-1 text-xs">
              {Object.entries(point.topFeatures || {}).slice(0, 3).map(([key, value]: [string, any]) => (
                <React.Fragment key={key}>
                  <div className="truncate text-[#2D3142]">{key.replace('chest_', '')}</div>
                  <div className="text-[#424242]">{value.toFixed(3)}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        {point.matchingPoint && (
          <div className="mt-3 border-t border-[#E0E0E0] pt-2">
            <div className="font-semibold text-xs text-[#2D3142]">Adaptation Shift:</div>
            <div className="grid grid-cols-2 gap-x-2 mt-1 text-xs">
              <div className="text-[#2D3142]">PC1 Shift:</div>
              <div className="text-[#424242]">{(point.x - point.matchingPoint.x).toFixed(3)}</div>
              <div className="text-[#2D3142]">PC2 Shift:</div>
              <div className="text-[#424242]">{(point.y - point.matchingPoint.y).toFixed(3)}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Scatter plot component with multiple visualization options
const DomainScatterPlot = ({ 
  data, 
  pca, 
  title, 
  gapValue,
  viewConfig,
  onPointClick,
  selectedPoint,
  domainColors
}) => {
  const { 
    showWesad, 
    showKemocon, 
    showAdapted, 
    showConnections,
    zoomLevel,
    showCentroids,
    highlightOutliers,
    outlierThreshold
  } = viewConfig;

  // Compute centroids per domain
  const centroids = useMemo(() => {
    const domains = ['WESAD', 'K-EmoCon', 'Adapted'];
    const results = {};
    domains.forEach(domain => {
      const domainPoints = data.filter(p => p.domain === domain);
      if (domainPoints.length) {
        const sumX = domainPoints.reduce((sum, p) => sum + p.x, 0);
        const sumY = domainPoints.reduce((sum, p) => sum + p.y, 0);
        results[domain] = {
          x: sumX / domainPoints.length,
          y: sumY / domainPoints.length,
          domain: `${domain} Centroid`,
          id: `centroid-${domain}`,
          color: domainColors[domain],
          isReference: true
        };
      }
    });
    return results;
  }, [data, domainColors]);

  // Set chart boundaries (with zoom level)
  const boundaries = useMemo(() => {
    if (!data.length) return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    let minX = Math.min(...data.map(p => p.x));
    let maxX = Math.max(...data.map(p => p.x));
    let minY = Math.min(...data.map(p => p.y));
    let maxY = Math.max(...data.map(p => p.y));
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const zoomFactor = 1 / (zoomLevel || 1);
    const paddingX = rangeX * 0.1 * zoomFactor;
    const paddingY = rangeY * 0.1 * zoomFactor;
    return {
      minX: minX - paddingX,
      maxX: maxX + paddingX,
      minY: minY - paddingY,
      maxY: maxY + paddingY
    };
  }, [data, zoomLevel]);

  // Detect outliers based on standard deviation per domain
  const outliers = useMemo(() => {
    if (!highlightOutliers) return [];
    const domainGroups = {};
    data.forEach(point => {
      if (!domainGroups[point.domain]) domainGroups[point.domain] = [];
      domainGroups[point.domain].push(point);
    });
    const outlierPoints = [];
    Object.entries(domainGroups).forEach(([domain, points]: [string, any[]]) => {
      const centroid = centroids[domain];
      if (!centroid) return;
      const distances = points.map(p => Math.sqrt(Math.pow(p.x - centroid.x, 2) + Math.pow(p.y - centroid.y, 2)));
      const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
      const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length;
      const stdDev = Math.sqrt(variance);
      points.forEach((point, idx) => {
        if (distances[idx] > mean + stdDev * outlierThreshold) {
          outlierPoints.push({
            ...point,
            isOutlier: true,
            distanceFromCentroid: distances[idx]
          });
        }
      });
    });
    return outlierPoints;
  }, [data, centroids, highlightOutliers, outlierThreshold]);

  return (
    <Card className="h-full border border-[#E0E0E0] shadow-sm">
      <CardHeader className="py-3 bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base text-[#2D3142]">{title}</CardTitle>
          <Badge variant="outline" className="text-xs border-[#E0E0E0] text-[#424242]">
            Gap: {gapValue.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" opacity={0.4} />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="PC1" 
              domain={[boundaries.minX, boundaries.maxX]}
              tickFormatter={(value) => value.toFixed(1)}
              tick={{ fill: '#424242' }}
              axisLine={{ stroke: '#E0E0E0' }}
            >
              <Label 
                value={`PC1 (${(pca[0] * 100).toFixed(1)}%)`} 
                offset={-10} 
                position="bottom"
                style={{ fill: '#424242', fontSize: 12 }} 
              />
            </XAxis>
            <YAxis 
              type="number" 
              dataKey="y" 
              name="PC2" 
              domain={[boundaries.minY, boundaries.maxY]}
              tickFormatter={(value) => value.toFixed(1)}
              tick={{ fill: '#424242' }}
              axisLine={{ stroke: '#E0E0E0' }}
            >
              <Label 
                value={`PC2 (${(pca[1] * 100).toFixed(1)}%)`} 
                angle={-90} 
                position="left"
                style={{ fill: '#424242', fontSize: 12 }} 
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => <span className="text-[#424242]">{value}</span>}
            />
            {/* Draw centroids */}
            {showCentroids && Object.values(centroids).map(centroid => (
              <React.Fragment key={`ref-${centroid.id}`}>
                <ReferenceLine
                  x={centroid.x}
                  stroke={centroid.color}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={centroid.y}
                  stroke={centroid.color}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              </React.Fragment>
            ))}
            {/* Draw WESAD points */}
            {showWesad && (
              <Scatter 
                name="WESAD" 
                data={data.filter(p => p.domain === 'WESAD')} 
                fill={domainColors.WESAD}
                fillOpacity={0.7}
                shape="circle"
                onClick={onPointClick}
              />
            )}
            {/* Draw K-EmoCon points */}
            {showKemocon && (
              <Scatter 
                name="K-EmoCon" 
                data={data.filter(p => p.domain === 'K-EmoCon')} 
                fill={domainColors['K-EmoCon']}
                fillOpacity={0.7}
                shape="circle"
                onClick={onPointClick}
              />
            )}
            {/* Draw Adapted points */}
            {showAdapted && (
              <Scatter 
                name="Adapted WESAD" 
                data={data.filter(p => p.domain === 'Adapted')} 
                fill={domainColors.Adapted}
                fillOpacity={0.7}
                shape="diamond"
                onClick={onPointClick}
              />
            )}
            {/* Draw centroids as separate scatter */}
            {showCentroids && (
              <Scatter
                name="Centroids"
                data={Object.values(centroids)}
                fill="#000"
                shape={(props) => {
                  const { cx, cy, fill } = props;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={8} fill={fill} fillOpacity={0.2} />
                      <circle cx={cx} cy={cy} r={4} fill={fill} />
                      <circle cx={cx} cy={cy} r={2} fill="#fff" />
                    </g>
                  );
                }}
              />
            )}
            {/* Draw outliers */}
            {highlightOutliers && outliers.length > 0 && (
              <Scatter
                name="Outliers"
                data={outliers}
                fill="#F76C5E"
                fillOpacity={0.1}
                shape={(props) => {
                  const { cx, cy, fill } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={15} 
                      fill={fill} 
                      stroke="#F76C5E"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  );
                }}
              />
            )}
            {/* Highlight selected point */}
            {selectedPoint && (
              <Scatter
                name="Selected Point"
                data={[selectedPoint]}
                fill="none"
                shape={(props) => {
                  const { cx, cy } = props;
                  return (
                    <g>
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={12} 
                        fill="none" 
                        stroke="#2D3142" 
                        strokeWidth={2}
                      />
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={14} 
                        fill="none" 
                        stroke="#2D3142" 
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                    </g>
                  );
                }}
              />
            )}
            {/* Connection lines for paired points in split view */}
            {showConnections && showWesad && showAdapted && (
              data
                .filter(p => p.domain === 'Adapted' && p.matchingPoint)
                .map(adaptedPoint => {
                  const originalPoint = adaptedPoint.matchingPoint;
                  return (
                    <Scatter
                      key={`connection-${adaptedPoint.id}`}
                      name="Adaptation Path"
                      data={[
                        { x: originalPoint.x, y: originalPoint.y },
                        { x: adaptedPoint.x, y: adaptedPoint.y }
                      ]}
                      fill="none"
                      hide={true} // hide individual connection from legend
                      shape={(props) => {
                        const { points } = props;
                        if (!points || points.length < 2) return null;
                        const [p1, p2] = points;
                        return (
                          <line
                            x1={p1.cx}
                            y1={p1.cy}
                            x2={p2.cx}
                            y2={p2.cy}
                            stroke="#B8B8FF"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                            strokeOpacity={0.7}
                          />
                        );
                      }}
                    />
                  );
                })
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const DomainGapVisualization = () => {
  const [target, setTarget] = useState<'arousal' | 'valence'>('arousal');
  const [viewMode, setViewMode] = useState<'split' | 'combined'>('split');
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [filterSettings, setFilterSettings] = useState({
    showWesad: true,
    showKemocon: true,
    showAdapted: true,
    showConnections: true,
    showCentroids: false,
    highlightOutliers: false,
    outlierThreshold: 2,
    zoomLevel: 1.0,
  });

  const { data, isLoading, error } = useDomainGapVisualization(target);

  // Reset selected point when target changes
  useEffect(() => {
    setSelectedPoint(null);
  }, [target]);

  // Handle point click for selection
  const handlePointClick = useCallback((point) => {
    setSelectedPoint(prev => prev?.id === point.id ? null : point);
    if (point.domain === 'Adapted' && point.originalPoint) {
      // Already has matching info
    } else if (point.domain === 'WESAD' && enhancedDataPoints.afterAdaptation) {
      const adaptedMatch = enhancedDataPoints.afterAdaptation.find(
        p => p.domain === 'Adapted' && p.originalPoint?.id === point.id
      );
      if (adaptedMatch) {
        setSelectedPoint({
          ...point,
          matchingPoint: adaptedMatch
        });
      }
    }
  }, []);

  // Update filter settings
  const handleFilterChange = (key, value) => {
    setFilterSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Enhance raw data points for visualization
  const enhancedDataPoints = useMemo(() => {
    if (!data) return { beforeAdaptation: [], afterAdaptation: [], combined: [] };

    const wesadPoints = data.data_points.wesad.map((point, idx) => ({
      x: point[0],
      y: point[1],
      domain: 'WESAD',
      id: `wesad-${idx}`,
      color: DOMAIN_COLORS.WESAD,
      topFeatures: data.feature_contributions?.[idx] || {},
      description: `Original WESAD feature point #${idx + 1}`
    }));

    const kemoconPoints = data.data_points.kemocon.map((point, idx) => ({
      x: point[0],
      y: point[1],
      domain: 'K-EmoCon',
      id: `kemocon-${idx}`,
      color: DOMAIN_COLORS['K-EmoCon'],
      topFeatures: data.feature_contributions?.[idx + wesadPoints.length] || {},
      description: `K-EmoCon feature point #${idx + 1}`
    }));

    const adaptedPoints = data.data_points.adapted.map((point, idx) => {
      const originalPoint = wesadPoints[idx];
      return {
        x: point[0],
        y: point[1],
        domain: 'Adapted',
        id: `adapted-${idx}`,
        color: DOMAIN_COLORS.Adapted,
        topFeatures: data.feature_contributions?.[idx] || {},
        description: `Adapted WESAD feature point #${idx + 1}`,
        originalPoint: originalPoint,
        matchingPoint: originalPoint
      };
    });

    const wesadPointsWithMatching = wesadPoints.map((point, idx) => ({
      ...point,
      matchingPoint: adaptedPoints[idx]
    }));

    return {
      beforeAdaptation: [...wesadPointsWithMatching, ...kemoconPoints],
      afterAdaptation: [...adaptedPoints, ...kemoconPoints],
      combined: [...wesadPointsWithMatching, ...kemoconPoints, ...adaptedPoints]
    };
  }, [data]);

  // Handle data export
  const handleExportData = () => {
    if (!data) return;
    const exportData = {
      target,
      gap_before: data.gap_measures.before,
      gap_after: data.gap_measures.after,
      reduction_pct: data.gap_measures.reduction_pct,
      wesad_points: data.data_points.wesad,
      kemocon_points: data.data_points.kemocon,
      adapted_points: data.data_points.adapted
    };
    const csv = createObjectToCsv(exportData);
    downloadCsv(csv, `domain_adaptation_${target}_data.csv`);
  };

  if (isLoading) {
    return (
      <Card className="w-full border border-[#E0E0E0] shadow-sm">
        <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <Skeleton className="h-8 w-64 mb-2 bg-[#E0E0E0]/50" />
          <Skeleton className="h-4 w-full max-w-md bg-[#E0E0E0]/50" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-12 w-12 animate-spin text-[#4464AD]" />
              <div className="mt-4 text-sm text-[#424242]">
                Loading visualization data...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive" className="bg-[#F76C5E]/10 text-[#F76C5E] border border-[#F76C5E]/30">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load domain gap visualization. {error?.toString()}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full border border-[#E0E0E0] shadow-sm">
      <CardHeader className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-[#2D3142]">Domain Gap Visualization</CardTitle>
            <CardDescription className="flex items-center text-[#424242]">
              PCA visualization of feature distributions before and after domain adaptation
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-1 p-0 h-5 w-5 text-[#4F8A8B]">
                    <Info className="h-4 w-4" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 border border-[#E0E0E0] bg-white shadow-md">
                  <h4 className="font-semibold mb-2 text-[#2D3142]">About Domain Adaptation</h4>
                  <p className="text-sm text-[#424242]">
                    Domain adaptation reduces the statistical difference between datasets,
                    enabling knowledge transfer from one to another. The visualization shows
                    how feature distributions are aligned to improve cross-dataset generalization.
                  </p>
                  <p className="text-sm mt-2 text-[#424242]">
                    Lower domain gap values indicate better alignment between datasets.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={data.gap_measures.reduction_pct > 20 ? "default" : "secondary"} 
              className={`flex items-center px-3 py-1 ${
                data.gap_measures.reduction_pct > 20 
                  ? "bg-[#7BE495]/20 text-[#2D3142] border-[#7BE495]/30" 
                  : "bg-[#E0E0E0] text-[#424242]"
              }`}
            >
              Gap Reduction: {data.gap_measures.reduction_pct.toFixed(1)}%
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExportData} className="border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] hover:text-[#2D3142]">
              Export Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs
          defaultValue="arousal"
          value={target}
          onValueChange={(value) => setTarget(value as 'arousal' | 'valence')}
          className="w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <TabsList className="grid grid-cols-2 w-[200px] bg-[#F5F5F5] border border-[#E0E0E0]">
                <TabsTrigger 
                  value="arousal"
                  className="data-[state=active]:bg-[#4ADEDE]/20 data-[state=active]:text-[#4464AD] transition-all"
                >
                  Arousal
                </TabsTrigger>
                <TabsTrigger 
                  value="valence"
                  className="data-[state=active]:bg-[#7BE495]/20 data-[state=active]:text-[#4F8A8B] transition-all"
                >
                  Valence
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="flex gap-2 justify-end md:justify-center">
              <Button 
                variant={viewMode === 'split' ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode('split')}
                className={viewMode === 'split' 
                  ? "bg-[#4464AD] hover:bg-[#2D3142] text-white" 
                  : "border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] hover:text-[#2D3142]"}
              >
                Split View
              </Button>
              <Button 
                variant={viewMode === 'combined' ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode('combined')}
                className={viewMode === 'combined' 
                  ? "bg-[#4F8A8B] hover:bg-[#2D3142] text-white" 
                  : "border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] hover:text-[#2D3142]"}
              >
                Combined View
              </Button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFilterSettings({
                    showWesad: true,
                    showKemocon: true,
                    showAdapted: true,
                    showConnections: true,
                    showCentroids: false,
                    highlightOutliers: false,
                    outlierThreshold: 2,
                    zoomLevel: 1.0
                  });
                  setSelectedPoint(null);
                }}
                className="border-[#E0E0E0] text-[#424242] hover:bg-[#F5F5F5] hover:text-[#2D3142]"
              >
                Reset View
              </Button>
              <Select
                value={filterSettings.zoomLevel.toString()}
                onValueChange={(value) => handleFilterChange('zoomLevel', parseFloat(value))}
              >
                <SelectTrigger className="w-24 h-8 border-[#E0E0E0] text-[#424242]">
                  <SelectValue placeholder="Zoom" />
                </SelectTrigger>
                <SelectContent className="border-[#E0E0E0]">
                  <SelectItem value="0.5">50%</SelectItem>
                  <SelectItem value="0.75">75%</SelectItem>
                  <SelectItem value="1.0">100%</SelectItem>
                  <SelectItem value="1.5">150%</SelectItem>
                  <SelectItem value="2.0">200%</SelectItem>
                  <SelectItem value="3.0">300%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Visualization settings */}
          <div className="mb-6 border border-[#E0E0E0] rounded-md p-4 bg-[#F5F5F5]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-wesad"
                  checked={filterSettings.showWesad}
                  onCheckedChange={(checked) => handleFilterChange('showWesad', checked)}
                  className="data-[state=checked]:bg-[#4464AD]"
                />
                <label htmlFor="show-wesad" className="text-sm flex items-center text-[#424242]">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: DOMAIN_COLORS.WESAD }}></div>
                  Show WESAD
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-kemocon"
                  checked={filterSettings.showKemocon}
                  onCheckedChange={(checked) => handleFilterChange('showKemocon', checked)}
                  className="data-[state=checked]:bg-[#4F8A8B]"
                />
                <label htmlFor="show-kemocon" className="text-sm flex items-center text-[#424242]">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: DOMAIN_COLORS['K-EmoCon'] }}></div>
                  Show K-EmoCon
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-adapted"
                  checked={filterSettings.showAdapted}
                  onCheckedChange={(checked) => handleFilterChange('showAdapted', checked)}
                  className="data-[state=checked]:bg-[#7BE495]"
                />
                <label htmlFor="show-adapted" className="text-sm flex items-center text-[#424242]">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: DOMAIN_COLORS.Adapted }}></div>
                  Show Adapted
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-connections"
                  checked={filterSettings.showConnections}
                  onCheckedChange={(checked) => handleFilterChange('showConnections', checked)}
                  className="data-[state=checked]:bg-[#B8B8FF]"
                />
                <label htmlFor="show-connections" className="text-sm text-[#424242]">
                  Show Connections
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-centroids"
                  checked={filterSettings.showCentroids}
                  onCheckedChange={(checked) => handleFilterChange('showCentroids', checked)}
                />
                <label htmlFor="show-centroids" className="text-sm text-[#424242]">
                  Show Centroids
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="highlight-outliers"
                  checked={filterSettings.highlightOutliers}
                  onCheckedChange={(checked) => handleFilterChange('highlightOutliers', checked)}
                  className="data-[state=checked]:bg-[#F76C5E]"
                />
                <label htmlFor="highlight-outliers" className="text-sm text-[#424242]">
                  Highlight Outliers
                </label>
              </div>
              {filterSettings.highlightOutliers && (
                <div className="col-span-2 flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <label htmlFor="outlier-threshold" className="text-sm text-[#424242]">
                      Outlier Threshold: {filterSettings.outlierThreshold.toFixed(1)}σ
                    </label>
                  </div>
                  <Slider
                    id="outlier-threshold"
                    value={[filterSettings.outlierThreshold]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => handleFilterChange('outlierThreshold', value[0])}
                    className="[&>[role=slider]]:bg-[#4F8A8B]"
                  />
                </div>
              )}
            </div>
          </div>
          
          <TabsContent value={target} className="h-[500px]">
            {viewMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <DomainScatterPlot 
                  data={enhancedDataPoints.beforeAdaptation}
                  pca={data.pca_explained_variance}
                  title="Before Adaptation"
                  gapValue={data.gap_measures.before}
                  viewConfig={{
                    ...filterSettings,
                    showAdapted: false
                  }}
                  onPointClick={handlePointClick}
                  selectedPoint={selectedPoint}
                  domainColors={DOMAIN_COLORS}
                />
                <DomainScatterPlot 
                  data={enhancedDataPoints.afterAdaptation}
                  pca={data.pca_explained_variance}
                  title="After Adaptation"
                  gapValue={data.gap_measures.after}
                  viewConfig={{
                    ...filterSettings,
                    showWesad: false
                  }}
                  onPointClick={handlePointClick}
                  selectedPoint={selectedPoint}
                  domainColors={DOMAIN_COLORS}
                />
              </div>
            ) : (
              <Card className="h-full border border-[#E0E0E0] shadow-sm">
                <CardHeader className="py-3 bg-[#F5F5F5] border-b border-[#E0E0E0]">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base text-[#2D3142]">Combined View</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs border-[#E0E0E0] text-[#424242]">
                        Before: {data.gap_measures.before.toFixed(2)}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-[#E0E0E0] text-[#424242]">
                        After: {data.gap_measures.after.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" opacity={0.4} />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="PC1" 
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={(value) => value.toFixed(1)}
                        tick={{ fill: '#424242' }}
                        axisLine={{ stroke: '#E0E0E0' }}
                      >
                        <Label 
                          value={`PC1 (${(data.pca_explained_variance[0] * 100).toFixed(1)}%)`} 
                          offset={-10} 
                          position="bottom"
                          style={{ fill: '#424242', fontSize: 12 }} 
                        />
                      </XAxis>
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="PC2" 
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={(value) => value.toFixed(1)}
                        tick={{ fill: '#424242' }}
                        axisLine={{ stroke: '#E0E0E0' }}
                      >
                        <Label 
                          value={`PC2 (${(data.pca_explained_variance[1] * 100).toFixed(1)}%)`} 
                          angle={-90} 
                          position="left"
                          style={{ fill: '#424242', fontSize: 12 }} 
                        />
                      </YAxis>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        formatter={(value) => <span className="text-[#424242]">{value}</span>}
                      />
                      {filterSettings.showWesad && (
                        <Scatter 
                          name="WESAD" 
                          data={enhancedDataPoints.combined.filter(p => p.domain === 'WESAD')} 
                          fill={DOMAIN_COLORS.WESAD}
                          fillOpacity={0.7}
                          shape="circle"
                          onClick={handlePointClick}
                        />
                      )}
                      {filterSettings.showKemocon && (
                        <Scatter 
                          name="K-EmoCon" 
                          data={enhancedDataPoints.combined.filter(p => p.domain === 'K-EmoCon')} 
                          fill={DOMAIN_COLORS['K-EmoCon']}
                          fillOpacity={0.7}
                          shape="circle"
                          onClick={handlePointClick}
                        />
                      )}
                      {filterSettings.showAdapted && (
                        <Scatter 
                          name="Adapted WESAD" 
                          data={enhancedDataPoints.combined.filter(p => p.domain === 'Adapted')} 
                          fill={DOMAIN_COLORS.Adapted}
                          fillOpacity={0.7}
                          shape="diamond"
                          onClick={handlePointClick}
                        />
                      )}
                      {/* Combined connection lines as a single Scatter */}
                      {filterSettings.showConnections && filterSettings.showWesad && filterSettings.showAdapted && (
                        <Scatter
                          name="Adaptation Path"
                          data={(() => {
                            // For each Adapted point with a matchingPoint, push both points into the array.
                            const pairs = [];
                            enhancedDataPoints.combined.forEach(p => {
                              if (p.domain === 'Adapted' && p.matchingPoint) {
                                pairs.push({ x: p.matchingPoint.x, y: p.matchingPoint.y });
                                pairs.push({ x: p.x, y: p.y });
                              }
                            });
                            return pairs;
                          })()}
                          fill="none"
                          shape={({ points }) => {
                            if (!points || points.length < 2) return null;
                            const lines = [];
                            for (let i = 0; i < points.length; i += 2) {
                              const p1 = points[i];
                              const p2 = points[i + 1];
                              lines.push(
                                <line
                                  key={`line-${i}`}
                                  x1={p1.cx}
                                  y1={p1.cy}
                                  x2={p2.cx}
                                  y2={p2.cy}
                                  stroke="#B8B8FF"
                                  strokeWidth={1}
                                  strokeDasharray="2 2"
                                  strokeOpacity={0.7}
                                />
                              );
                            }
                            return <g>{lines}</g>;
                          }}
                        />
                      )}
                      {/* Selected point */}
                      {selectedPoint && (
                        <Scatter
                          name="Selected Point"
                          data={[selectedPoint]}
                          fill="none"
                          shape={(props) => {
                            const { cx, cy } = props;
                            return (
                              <g>
                                <circle 
                                  cx={cx} 
                                  cy={cy} 
                                  r={12} 
                                  fill="none" 
                                  stroke="#2D3142" 
                                  strokeWidth={2}
                                />
                                <circle 
                                  cx={cx} 
                                  cy={cy} 
                                  r={14} 
                                  fill="none" 
                                  stroke="#2D3142" 
                                  strokeWidth={1}
                                  strokeDasharray="2 2"
                                />
                              </g>
                            );
                          }}
                        />
                      )}
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-sm border-t border-[#E0E0E0] pt-4">
                    <h4 className="font-medium text-[#2D3142]">Adaptation Impact</h4>
                    <p className="text-[#424242]">
                      The domain adaptation process has reduced the gap between 
                      WESAD and K-EmoCon datasets by {data.gap_measures.reduction_pct.toFixed(1)}%,
                      improving cross-dataset generalization for {target} prediction.
                    </p>
                    {selectedPoint && (
                      <div className="mt-2 p-2 bg-[#F5F5F5] rounded-md border border-[#E0E0E0]">
                        <h5 className="font-medium text-[#2D3142]">Selected Point Details</h5>
                        <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                          <div className="font-medium text-[#2D3142]">Domain:</div>
                          <div className="text-[#424242]">{selectedPoint.domain}</div>
                          <div className="font-medium text-[#2D3142]">PC1:</div>
                          <div className="text-[#424242]">{selectedPoint.x.toFixed(3)}</div>
                          <div className="font-medium text-[#2D3142]">PC2:</div>
                          <div className="text-[#424242]">{selectedPoint.y.toFixed(3)}</div>
                          {selectedPoint.matchingPoint && (
                            <>
                              <div className="font-medium col-span-2 mt-1 text-[#2D3142]">Adaptation Shift:</div>
                              <div className="text-[#2D3142]">PC1 Shift:</div>
                              <div className="text-[#424242]">{(selectedPoint.matchingPoint.x - selectedPoint.x).toFixed(3)}</div>
                              <div className="text-[#2D3142]">PC2 Shift:</div>
                              <div className="text-[#424242]">{(selectedPoint.matchingPoint.y - selectedPoint.y).toFixed(3)}</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DomainGapVisualization;