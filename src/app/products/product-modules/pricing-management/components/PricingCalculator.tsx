'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  TrendingUp,
  Target,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  History
} from 'lucide-react';
import { usePricing } from '../hooks/usePricing';
import { savedCalculationsService } from '../services/savedCalculationsService';
import { SaveCalculationRequest, CalculationInputData, CalculationResults, SavedPricingCalculation } from '../types';

interface PricingCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculationSaved?: () => void;
  onSaveAndShowHistory?: () => void;
}

interface CalculationResult {
  sellingPrice: number;
  profitMargin: number;
  markup: number;
  profit: number;
  isValidMargin: boolean;
  recommendations: string[];
  warnings: string[];
  totalCostWithOverhead: number;
}

interface CompetitorAnalysis {
  position: 'premium' | 'competitive' | 'value';
  adjustment: number;
  recommendedPrice: number;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  isOpen,
  onClose,
  onCalculationSaved,
  onSaveAndShowHistory
}) => {
  const { calculateOptimalPrice, calculateProfitMargin, calculateMarkup } = usePricing();
  
  // Single Product Calculator State
  const [costPrice, setCostPrice] = useState<string>('');
  const [targetMargin, setTargetMargin] = useState<string>('');
  const [competitorPrice, setCompetitorPrice] = useState<string>('');
  const [marketPosition, setMarketPosition] = useState<'premium' | 'competitive' | 'value'>('competitive');
  
  // Bulk Calculator State
  const [bulkUpdateType, setBulkUpdateType] = useState<'margin' | 'markup' | 'cost_plus'>('margin');
  const [bulkValue, setBulkValue] = useState<string>('');
  const [overheadPercentage, setOverheadPercentage] = useState<string>('15');
  
  // Results
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);
  
  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<SavedPricingCalculation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Load saved calculations
  useEffect(() => {
    if (showHistory) {
      loadSavedCalculations();
    }
  }, [showHistory]);

  // Load saved calculations
  const loadSavedCalculations = async () => {
    try {
      setHistoryLoading(true);
      const calculations = await savedCalculationsService.getSavedCalculations();
      setSavedCalculations(calculations);
    } catch (error) {
      console.error('Error loading saved calculations:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Enhanced input validation
  const validateInputs = (cost: number, margin: number) => {
    const errors: string[] = [];
    
    if (isNaN(cost) || cost <= 0) {
      errors.push('Cost price must be a positive number');
    }
    if (isNaN(margin) || margin < 0) {
      errors.push('Margin must be a positive number');
    }
    if (margin >= 100) {
      errors.push('Margin cannot be 100% or higher');
    }
    if (cost > 10000) {
      errors.push('Cost price seems unusually high - please verify');
    }
    
    return errors;
  };

  // Calculate pricing based on cost and margin with enhanced accuracy
  const calculatePricing = () => {
    const cost = parseFloat(costPrice);
    const margin = parseFloat(targetMargin);
    const overhead = parseFloat(overheadPercentage) || 0;
    
    const validationErrors = validateInputs(cost, margin);
    if (validationErrors.length > 0) {
      setResult(null);
      return;
    }

    // More accurate calculation: Price = Cost / (1 - Margin/100)
    const sellingPrice = cost / (1 - margin / 100);
    const actualMargin = ((sellingPrice - cost) / sellingPrice) * 100;
    const markup = ((sellingPrice - cost) / cost) * 100;
    const profit = sellingPrice - cost;
    const totalCostWithOverhead = cost * (1 + overhead / 100);
    
    const recommendations: string[] = [];
    const warnings: string[] = [];
    
    // Enhanced recommendations based on industry standards
    if (margin < 15) {
      warnings.push('Margin below 15% - may not cover business expenses');
      recommendations.push('Consider increasing to at least 20% for sustainability');
    } else if (margin < 25) {
      recommendations.push('Fair margin - monitor costs carefully');
    } else if (margin > 60) {
      warnings.push('Very high margin - may reduce competitiveness');
      recommendations.push('Consider market research to validate pricing');
    }
    
    if (sellingPrice < totalCostWithOverhead) {
      warnings.push('Price below total cost including overhead - you will lose money');
      recommendations.push(`Minimum price should be $${totalCostWithOverhead.toFixed(2)}`);
    }
    
    if (profit < 5) {
      warnings.push('Very low profit per unit');
    }
    
    const calculationResult: CalculationResult = {
      sellingPrice: Math.round(sellingPrice * 100) / 100, // Round to 2 decimal places
      profitMargin: Math.round(actualMargin * 10) / 10, // Round to 1 decimal place
      markup: Math.round(markup * 10) / 10,
      profit: Math.round(profit * 100) / 100,
      isValidMargin: margin >= 15 && margin <= 70 && sellingPrice >= totalCostWithOverhead,
      recommendations,
      warnings,
      totalCostWithOverhead
    };
    
    setResult(calculationResult);
  };

  // Analyze competitor pricing
  const analyzeCompetitorPricing = () => {
    const cost = parseFloat(costPrice);
    const competitor = parseFloat(competitorPrice);
    
    if (isNaN(cost) || isNaN(competitor) || cost <= 0 || competitor <= 0) {
      setCompetitorAnalysis(null);
      return;
    }

    let adjustment = 0;
    switch (marketPosition) {
      case 'premium':
        adjustment = 0.10; // 10% above competitor
        break;
      case 'competitive':
        adjustment = -0.02; // 2% below competitor
        break;
      case 'value':
        adjustment = -0.08; // 8% below competitor
        break;
    }

    const recommendedPrice = competitor * (1 + adjustment);
    
    setCompetitorAnalysis({
      position: marketPosition,
      adjustment: adjustment * 100,
      recommendedPrice
    });
  };

  // Bulk pricing calculator
  const calculateBulkPricing = () => {
    const value = parseFloat(bulkValue);
    const overhead = parseFloat(overheadPercentage);
    const cost = parseFloat(costPrice);
    
    if (isNaN(value) || isNaN(cost) || cost <= 0) return null;

    let sellingPrice = 0;
    
    switch (bulkUpdateType) {
      case 'margin':
        sellingPrice = calculateOptimalPrice(cost, value);
        break;
      case 'markup':
        sellingPrice = cost * (1 + value / 100);
        break;
      case 'cost_plus':
        const totalCost = cost * (1 + overhead / 100);
        sellingPrice = totalCost * (1 + value / 100);
        break;
    }

    return {
      sellingPrice,
      margin: calculateProfitMargin(cost, sellingPrice),
      markup: calculateMarkup(cost, sellingPrice),
      profit: sellingPrice - cost
    };
  };

  // Break-even analysis
  const calculateBreakEven = () => {
    const cost = parseFloat(costPrice);
    const overhead = parseFloat(overheadPercentage);
    
    if (isNaN(cost) || isNaN(overhead) || cost <= 0) return null;

    const totalCost = cost * (1 + overhead / 100);
    const breakEvenPrice = totalCost;
    const recommendedPrice = totalCost * 1.25; // 25% margin minimum
    
    return {
      breakEvenPrice,
      recommendedPrice,
      minimumMargin: 25
    };
  };

  useEffect(() => {
    if (costPrice && targetMargin) {
      calculatePricing();
    }
  }, [costPrice, targetMargin]);

  useEffect(() => {
    if (costPrice && competitorPrice) {
      analyzeCompetitorPricing();
    }
  }, [costPrice, competitorPrice, marketPosition]);

  const bulkResult = calculateBulkPricing();
  const breakEvenResult = calculateBreakEven();

  const getMarginColor = (margin: number) => {
    if (margin < 15) return 'text-red-600';
    if (margin < 25) return 'text-orange-600';
    if (margin > 60) return 'text-purple-600';
    return 'text-green-600';
  };

  const getMarginStatus = (margin: number) => {
    if (margin < 15) return { text: 'Low', variant: 'destructive' as const };
    if (margin < 25) return { text: 'Fair', variant: 'secondary' as const };
    if (margin > 60) return { text: 'High', variant: 'outline' as const };
    return { text: 'Good', variant: 'default' as const };
  };

  const handleSaveCalculation = async () => {
    const activeTab = document.querySelector('[data-state="active"]')?.getAttribute('value') || 'single';
    
    let calculationType: 'single_product' | 'competitor_analysis' | 'bulk_pricing' | 'break_even';
    let inputData: CalculationInputData;
    let results: CalculationResults;
    
    const currentDate = new Date().toISOString();
    
    // Determine calculation type and prepare data based on active tab
    switch (activeTab) {
      case 'competitor':
        calculationType = 'competitor_analysis';
        inputData = {
          cost_price: parseFloat(costPrice) || 0,
          competitor_price: parseFloat(competitorPrice) || 0,
          market_position: marketPosition,
          calculation_date: currentDate
        };
        results = {
          selling_price: competitorAnalysis?.recommendedPrice || 0,
          profit_margin: competitorAnalysis ? calculateProfitMargin(parseFloat(costPrice), competitorAnalysis.recommendedPrice) : 0,
          markup_percentage: competitorAnalysis ? calculateMarkup(parseFloat(costPrice), competitorAnalysis.recommendedPrice) : 0,
          profit_amount: competitorAnalysis ? (competitorAnalysis.recommendedPrice - parseFloat(costPrice)) : 0,
          competitor_adjustment: competitorAnalysis?.adjustment || 0,
          warnings: [],
          recommendations: [`Positioned as ${marketPosition} relative to competitor`],
          is_valid_margin: true
        };
        break;
        
      case 'bulk':
        calculationType = 'bulk_pricing';
        inputData = {
          cost_price: parseFloat(costPrice) || 0,
          bulk_update_type: bulkUpdateType,
          bulk_value: parseFloat(bulkValue) || 0,
          overhead_percentage: parseFloat(overheadPercentage) || 0,
          calculation_date: currentDate
        };
        results = {
          selling_price: bulkResult?.sellingPrice || 0,
          profit_margin: bulkResult?.margin || 0,
          markup_percentage: bulkResult?.markup || 0,
          profit_amount: bulkResult?.profit || 0,
          total_cost_with_overhead: parseFloat(costPrice) * (1 + parseFloat(overheadPercentage) / 100),
          warnings: [],
          recommendations: [`Bulk pricing using ${bulkUpdateType} method`],
          is_valid_margin: (bulkResult?.margin || 0) >= 15
        };
        break;
        
      case 'breakeven':
        calculationType = 'break_even';
        inputData = {
          cost_price: parseFloat(costPrice) || 0,
          overhead_percentage: parseFloat(overheadPercentage) || 0,
          calculation_date: currentDate
        };
        results = {
          selling_price: breakEvenResult?.recommendedPrice || 0,
          profit_margin: breakEvenResult?.minimumMargin || 0,
          markup_percentage: 0,
          profit_amount: breakEvenResult ? (breakEvenResult.recommendedPrice - breakEvenResult.breakEvenPrice) : 0,
          break_even_price: breakEvenResult?.breakEvenPrice || 0,
          recommended_price: breakEvenResult?.recommendedPrice || 0,
          total_cost_with_overhead: breakEvenResult?.breakEvenPrice || 0,
          warnings: ['This is the minimum price to break even'],
          recommendations: ['Consider adding margin for sustainability'],
          is_valid_margin: true
        };
        break;
        
      default: // single product
        calculationType = 'single_product';
        inputData = {
          cost_price: parseFloat(costPrice) || 0,
          target_margin: parseFloat(targetMargin) || 0,
          overhead_percentage: parseFloat(overheadPercentage) || 0,
          calculation_date: currentDate
        };
        results = {
          selling_price: result?.sellingPrice || 0,
          profit_margin: result?.profitMargin || 0,
          markup_percentage: result?.markup || 0,
          profit_amount: result?.profit || 0,
          total_cost_with_overhead: result?.totalCostWithOverhead || 0,
          warnings: result?.warnings || [],
          recommendations: result?.recommendations || [],
          is_valid_margin: result?.isValidMargin || false
        };
        break;
    }
    
    const saveRequest: SaveCalculationRequest = {
      name: `Pricing Calculation - ${new Date().toLocaleDateString()}`,
      description: `${calculationType.replace('_', ' ')} calculation`,
      calculation_type: calculationType,
      input_data: inputData,
      results: results
    };
    
    try {
      await savedCalculationsService.saveCalculation(saveRequest);
      // Close the modal first
      onClose();
      
      // Show success message
      alert('Calculation saved successfully! Check Full History to view.');
      
      // Call callbacks to refresh and switch to Full History
      if (onCalculationSaved) {
        onCalculationSaved();
      }
      if (onSaveAndShowHistory) {
        onSaveAndShowHistory();
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Failed to save calculation. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pricing Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate optimal prices based on costs, margins, and market positioning
          </DialogDescription>
  <Button
    className="flex items-center gap-2"
    onClick={() => setShowHistory(!showHistory)}
  >
    <History className="h-4 w-4" />
    {showHistory ? 'Hide History' : 'Show History'}
  </Button> 
</DialogHeader>

        <Tabs defaultValue="single" className="flex-1 overflow-hidden">
          <TabsList className="w-full h-auto p-2 bg-gray-900 rounded-lg">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 w-full">
              <TabsTrigger 
                value="single" 
                className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-white hover:bg-gray-800 rounded-md min-h-[40px]"
              >
                <Target className="h-3 w-3" />
                <span className="hidden md:inline text-xs">Single Product</span>
                <span className="md:hidden text-xs">Single</span>
              </TabsTrigger>
              <TabsTrigger 
                value="competitor" 
                className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-white hover:bg-gray-800 rounded-md min-h-[40px]"
              >
                <TrendingUp className="h-3 w-3" />
                <span className="hidden md:inline text-xs">Competitor</span>
                <span className="md:hidden text-xs">Comp</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bulk" 
                className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-white hover:bg-gray-800 rounded-md min-h-[40px]"
              >
                <Calculator className="h-3 w-3" />
                <span className="hidden md:inline text-xs">Bulk Calc</span>
                <span className="md:hidden text-xs">Bulk</span>
              </TabsTrigger>
              <TabsTrigger 
                value="breakeven" 
                className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-white hover:bg-gray-800 rounded-md min-h-[40px]"
              >
                <DollarSign className="h-3 w-3" />
                <span className="text-xs">Break-Even</span>
              </TabsTrigger>
            </div>
          </TabsList>

          <div className="mt-4 overflow-y-auto flex-1">
            {/* Single Product Calculator */}
            <TabsContent value="single" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Price Calculator
                    </CardTitle>
                    <CardDescription>
                      Calculate selling price based on cost and target margin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cost Price ($)</Label>
                        <Input
                          type="number"
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Margin (%)</Label>
                        <Input
                          type="number"
                          value={targetMargin}
                          onChange={(e) => setTargetMargin(e.target.value)}
                          placeholder="30"
                          step="1"
                          min="0"
                          max="99"
                        />
                      </div>
                    </div>

                    {result && (
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Results
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Selling Price</div>
                            <div className="text-2xl font-bold text-green-600">
                              ${result.sellingPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Profit per Unit</div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${result.profit.toFixed(2)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Profit Margin</div>
                            <div className={`text-lg font-semibold ${getMarginColor(result.profitMargin)}`}>
                              {result.profitMargin.toFixed(1)}%
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Markup</div>
                            <div className="text-lg font-semibold">
                              {result.markup.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge {...getMarginStatus(result.profitMargin)}>
                            {getMarginStatus(result.profitMargin).text} Margin
                          </Badge>
                          {result.isValidMargin ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>

                        {result.recommendations.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Recommendations:
                            </div>
                            {result.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Margin Calculator</CardTitle>
                    <CardDescription>
                      Common margin scenarios for reference
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[15, 20, 25, 30, 40, 50].map((margin) => {
                        const cost = parseFloat(costPrice) || 100;
                        const price = calculateOptimalPrice(cost, margin);
                        const profit = price - cost;
                        
                        return (
                          <div key={margin} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{margin}%</Badge>
                              <span className="text-sm">margin</span>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm">${price.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                +${profit.toFixed(2)} profit
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Competitor Analysis */}
            <TabsContent value="competitor" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Competitor Analysis
                    </CardTitle>
                    <CardDescription>
                      Position vs competitors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Your Cost ($)</Label>
                        <Input
                          type="number"
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Competitor ($)</Label>
                        <Input
                          type="number"
                          value={competitorPrice}
                          onChange={(e) => setCompetitorPrice(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={marketPosition} onValueChange={(value: any) => setMarketPosition(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium">Premium (+10%)</SelectItem>
                          <SelectItem value="competitive">Competitive (-2%)</SelectItem>
                          <SelectItem value="value">Value (-8%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {competitorAnalysis && (
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">Analysis Results</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Rec. Price</div>
                            <div className="text-2xl font-bold text-green-600">
                              ${competitorAnalysis.recommendedPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Adjustment</div>
                            <div className={`text-lg font-semibold ${competitorAnalysis.adjustment >= 0 ? 'text-green-600' : 'text-blue-600'}`}>
                              {competitorAnalysis.adjustment >= 0 ? '+' : ''}{competitorAnalysis.adjustment.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {parseFloat(costPrice) > 0 && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium mb-2">Your Analysis:</div>
                            <div className="text-sm">
                              Margin: <span className="font-mono">
                                {calculateProfitMargin(parseFloat(costPrice), competitorAnalysis.recommendedPrice).toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-sm">
                              Profit: <span className="font-mono">
                                ${(competitorAnalysis.recommendedPrice - parseFloat(costPrice)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Positioning Guide</CardTitle>
                    <CardDescription>
                      Choose the right strategy for your market
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-purple-600 mb-2">Premium</div>
                        <div className="text-sm text-muted-foreground">
                          Higher price. Best for unique, high-quality products.
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-blue-600 mb-2">Competitive</div>
                        <div className="text-sm text-muted-foreground">
                          Slightly below competitors. Good for gaining market share.
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-green-600 mb-2">Value</div>
                        <div className="text-sm text-muted-foreground">
                          Significantly below competitors. Best for high-volume markets.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Bulk Calculator */}
            <TabsContent value="bulk" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Bulk Pricing Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate prices for different pricing strategies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cost ($)</Label>
                      <Input
                        type="number"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select value={bulkUpdateType} onValueChange={(value: any) => setBulkUpdateType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="margin">Margin</SelectItem>
                          <SelectItem value="markup">Markup</SelectItem>
                          <SelectItem value="cost_plus">Cost-Plus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {bulkUpdateType === 'margin' ? 'Margin (%)' : bulkUpdateType === 'markup' ? 'Markup (%)' : 'Profit (%)'}
                      </Label>
                      <Input
                        type="number"
                        value={bulkValue}
                        onChange={(e) => setBulkValue(e.target.value)}
                        placeholder="30"
                        step="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Overhead (%)</Label>
                      <Input
                        type="number"
                        value={overheadPercentage}
                        onChange={(e) => setOverheadPercentage(e.target.value)}
                        placeholder="15"
                        step="1"
                      />
                    </div>
                  </div>

                  {bulkResult && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Selling Price</div>
                        <div className="text-xl font-bold text-green-600">
                          ${bulkResult.sellingPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Profit Margin</div>
                        <div className={`text-xl font-bold ${getMarginColor(bulkResult.margin)}`}>
                          {bulkResult.margin.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Markup</div>
                        <div className="text-xl font-bold">
                          {bulkResult.markup.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Profit</div>
                        <div className="text-xl font-bold text-blue-600">
                          ${bulkResult.profit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Break-Even Analysis */}
            <TabsContent value="breakeven" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Break-Even Analysis
                  </CardTitle>
                  <CardDescription>
                    Calculate minimum pricing requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Direct Cost ($)</Label>
                      <Input
                        type="number"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Overhead (%)</Label>
                      <Input
                        type="number"
                        value={overheadPercentage}
                        onChange={(e) => setOverheadPercentage(e.target.value)}
                        placeholder="15"
                        step="1"
                      />
                    </div>
                  </div>

                  {breakEvenResult && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Break-Even Analysis</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                              <span className="text-sm font-medium">Break-Even Price</span>
                              <span className="font-mono text-red-600">
                                ${breakEvenResult.breakEvenPrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-sm font-medium">Recommended Price</span>
                              <span className="font-mono text-green-600">
                                ${breakEvenResult.recommendedPrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-medium">Minimum Margin</span>
                              <span className="font-mono text-blue-600">
                                {breakEvenResult.minimumMargin}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">Cost Breakdown</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Direct Cost:</span>
                              <span className="font-mono">${parseFloat(costPrice || '0').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Overhead ({overheadPercentage}%):</span>
                              <span className="font-mono">
                                ${(parseFloat(costPrice || '0') * parseFloat(overheadPercentage) / 100).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-medium border-t pt-2">
                              <span>Total Cost:</span>
                              <span className="font-mono">${breakEvenResult.breakEvenPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* History Section */}
        {showHistory && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <History className="h-5 w-5" />
              Saved Calculations
            </h3>
            {historyLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading saved calculations...</p>
              </div>
            ) : savedCalculations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <History className="mx-auto h-8 w-8 mb-2" />
                <p>No saved calculations yet</p>
                <p className="text-sm">Save a calculation to see it here</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {savedCalculations.slice(0, 5).map((calculation) => (
                  <div key={calculation.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{calculation.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(calculation.created_at).toLocaleDateString()} • 
                          {calculation.calculation_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          ${calculation.results.selling_price?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {calculation.results.profit_margin?.toFixed(1) || '0.0'}% margin
                        </div>
                      </div>
                    </div>
                    {calculation.description && (
                      <p className="text-xs text-muted-foreground mt-1">{calculation.description}</p>
                    )}
                  </div>
                ))}
                {savedCalculations.length > 5 && (
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground">
                      Showing 5 of {savedCalculations.length} calculations
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all"
          >
            Close
          </Button>
          <Button 
            className="bg-black text-white hover:bg-gray-800 transition-all"
            onClick={handleSaveCalculation}
          >
            Save Results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
