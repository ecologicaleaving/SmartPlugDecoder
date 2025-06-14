export interface EnergyConsumption {
  deviceId: string;
  timestamp: Date;
  energyUsed: number; // in kWh
  cost: number; // in currency units
  period: TimePeriod;
}

export interface PowerData {
  timestamp: Date;
  power: number; // in watts
  voltage: number; // in volts
  current: number; // in amperes
  frequency: number; // in hertz
  powerFactor: number;
}

export interface EnergyAnalytics {
  deviceId: string;
  period: TimePeriod;
  totalEnergy: number; // in kWh
  totalCost: number; // in currency units
  averagePower: number; // in watts
  peakPower: number; // in watts
  peakPowerTime: Date;
  efficiency: number; // percentage
  carbonFootprint: number; // in kg CO2
  costSavings: number; // compared to previous period
  dailyBreakdown: DailyEnergyData[];
}

export interface DailyEnergyData {
  date: Date;
  totalEnergy: number; // in kWh
  totalCost: number;
  averagePower: number;
  peakPower: number;
  hoursActive: number;
  costPerHour: number;
}

export interface EnergyForecast {
  deviceId: string;
  forecastPeriod: TimePeriod;
  predictedConsumption: number; // in kWh
  predictedCost: number;
  confidence: number; // percentage
  factors: ForecastFactor[];
  recommendations: EnergyRecommendation[];
}

export interface ForecastFactor {
  factor: string;
  impact: number; // percentage impact on forecast
  description: string;
}

export interface EnergyRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  potentialSavings: number; // in currency units
  estimatedSavingsPercent: number;
  implementationDifficulty: DifficultyLevel;
  deviceIds: string[];
}

export interface UtilityRate {
  id: string;
  name: string;
  currency: string;
  structure: RateStructure;
  baseRate: number; // per kWh
  peakRate?: number; // per kWh during peak hours
  offPeakRate?: number; // per kWh during off-peak hours
  peakHours: TimeRange[];
  seasonalRates?: SeasonalRate[];
  demandCharge?: number; // per kW of peak demand
  connectionFee?: number; // monthly fixed fee
  taxes: TaxRate[];
}

export interface TimeRange {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  days: string[]; // ['monday', 'tuesday', etc.]
}

export interface SeasonalRate {
  name: string;
  startDate: string; // MM-DD format
  endDate: string; // MM-DD format
  baseRate: number;
  peakRate?: number;
  offPeakRate?: number;
}

export interface TaxRate {
  name: string;
  rate: number; // percentage
  type: TaxType;
}

export interface CostAnalysis {
  period: TimePeriod;
  totalCost: number;
  energyCost: number;
  demandCost: number;
  taxes: number;
  fees: number;
  breakdown: CostBreakdown[];
  comparison: CostComparison;
  trends: CostTrend[];
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  description: string;
}

export interface CostComparison {
  previousPeriod: number;
  percentageChange: number;
  savingsOpportunity: number;
  benchmarkComparison: number; // compared to similar households
}

export interface CostTrend {
  date: Date;
  cost: number;
  movingAverage: number;
}

export enum TimePeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum RateStructure {
  FLAT = 'flat',
  TIME_OF_USE = 'time_of_use',
  TIERED = 'tiered',
  DEMAND = 'demand',
  REAL_TIME = 'real_time',
}

export enum TaxType {
  SALES = 'sales',
  UTILITY = 'utility',
  ENVIRONMENTAL = 'environmental',
  FEDERAL = 'federal',
  STATE = 'state',
  LOCAL = 'local',
}

export enum RecommendationType {
  SCHEDULE_OPTIMIZATION = 'schedule_optimization',
  DEVICE_REPLACEMENT = 'device_replacement',
  USAGE_REDUCTION = 'usage_reduction',
  RATE_PLAN_CHANGE = 'rate_plan_change',
  AUTOMATION = 'automation',
  MAINTENANCE = 'maintenance',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  DIFFICULT = 'difficult',
  EXPERT = 'expert',
}

// Real-time data structures
export interface RealTimeEnergyData {
  timestamp: Date;
  totalPower: number; // all devices combined
  deviceReadings: DeviceEnergyReading[];
  gridStatus: GridStatus;
  costRate: number; // current rate per kWh
  projectedDailyCost: number;
}

export interface DeviceEnergyReading {
  deviceId: string;
  power: number;
  voltage: number;
  current: number;
  energyToday: number;
  costToday: number;
  efficiency: number;
}

export interface GridStatus {
  frequency: number;
  voltage: number;
  phase: GridPhase;
  qualityIndicators: PowerQualityIndicator[];
}

export enum GridPhase {
  SINGLE = 'single',
  THREE_PHASE = 'three_phase',
}

export interface PowerQualityIndicator {
  metric: string;
  value: number;
  unit: string;
  status: QualityStatus;
}

export enum QualityStatus {
  GOOD = 'good',
  WARNING = 'warning',
  POOR = 'poor',
  CRITICAL = 'critical',
}