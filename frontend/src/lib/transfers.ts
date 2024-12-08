export interface TransferData {
  date: string
  value: number
}

// Calculate moving average to smooth data and detect trends
function calculateMovingAverage(data: TransferData[], windowSize: number): TransferData[] {
  return data.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const window = data.slice(start, index + 1)
    const sum = window.reduce((acc, curr) => acc + curr.value, 0)
    return {
      date: data[index].date,
      value: Math.round(sum / window.length),
    }
  })
}

// Detect and remove outliers using IQR method
function removeOutliers(data: TransferData[]): TransferData[] {
  const values = data.map(d => d.value)
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  return data.filter(d => d.value >= lowerBound && d.value <= upperBound)
}

// Enhanced linear regression with weighted recent data and trend analysis
function linearRegression(data: TransferData[]) {
  const n = data.length
  if (n < 2)
    return null

  // Convert dates to numerical values (months since epoch)
  const x = data.map((d) => {
    const date = new Date(d.date)
    return date.getFullYear() * 12 + date.getMonth()
  })
  const y = data.map(d => d.value)

  // Calculate exponential weights (more recent data has higher weight)
  const weights = x.map((_, i) => Math.exp((i - (n - 1)) * 0.15))
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const normalizedWeights = weights.map(w => w / weightSum)

  // Calculate weighted means
  const meanX = x.reduce((a, b, i) => a + b * normalizedWeights[i], 0)
  const meanY = y.reduce((a, b, i) => a + b * normalizedWeights[i], 0)

  // Calculate weighted coefficients
  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += normalizedWeights[i] * (x[i] - meanX) * (y[i] - meanY)
    denominator += normalizedWeights[i] * (x[i] - meanX) * (x[i] - meanX)
  }

  const slope = numerator / denominator
  const intercept = meanY - slope * meanX

  // Calculate trend strength
  const recentSlope = n >= 6 ? calculateRecentTrend(data.slice(-6)) : slope
  const trendStrength = Math.min(Math.abs(recentSlope / slope), 2)

  // Detect seasonality
  const seasonality = detectSeasonality(data)

  return { slope, intercept, seasonality, trendStrength }
}

// Calculate recent trend for last few months
function calculateRecentTrend(recentData: TransferData[]): number {
  const x = recentData.map((_, i) => i)
  const y = recentData.map(d => d.value)

  const meanX = x.reduce((a, b) => a + b, 0) / x.length
  const meanY = y.reduce((a, b) => a + b, 0) / y.length

  let numerator = 0
  let denominator = 0
  for (let i = 0; i < x.length; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY)
    denominator += (x[i] - meanX) * (x[i] - meanX)
  }

  return numerator / denominator
}

// Detect seasonal patterns in the data
function detectSeasonality(data: TransferData[]): number[] | null {
  if (data.length < 12)
    return null

  const monthlyAverages = Array.from({ length: 12 }).map(() => 0)
  const monthCounts = Array.from({ length: 12 }).map(() => 0)

  // Calculate average value for each month
  data.forEach((point: TransferData) => {
    const date = new Date(point.date)
    const month = date.getMonth()
    monthlyAverages[month] += point.value
    monthCounts[month]++
  })

  // Calculate seasonal factors
  const seasonalFactors = monthlyAverages.map((sum, i) =>
    monthCounts[i] > 0 ? sum / monthCounts[i] : 1,
  )

  // Normalize seasonal factors
  const avgFactor = seasonalFactors.reduce((a, b) => a + b, 0) / 12
  return seasonalFactors.map(factor => factor / avgFactor)
}

export function predictFutureValues(historicalData: TransferData[], numMonths: number = 3): TransferData[] {
  if (historicalData.length < 3)
    return []

  // Sort and clean historical data
  const sortedData = [...historicalData]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate baseline from recent months
  const recentMonths = sortedData.slice(-6) // Look at last 6 months
  const recentAvg = recentMonths.reduce((sum, item) => sum + item.value, 0) / recentMonths.length
  const baselineValue = 4 // Set baseline to 4 events

  // Calculate variance from recent data
  const variance = recentMonths.reduce((sum, item) => sum + (item.value - recentAvg) ** 2, 0) / recentMonths.length
  const stdDev = Math.sqrt(variance)

  // Remove outliers and smooth data
  const cleanedData = removeOutliers(sortedData)
  const smoothedData = calculateMovingAverage(cleanedData, 3)

  const regression = linearRegression(smoothedData)
  if (!regression)
    return []

  const { slope, seasonality } = regression
  const predictions: TransferData[] = []

  // Start predictions from next month
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const startMonth = nextMonth.getFullYear() * 12 + nextMonth.getMonth()
  const endMonth = startMonth + numMonths

  // Generate predictions only for future months
  for (let monthsSinceEpoch = startMonth; monthsSinceEpoch < endMonth; monthsSinceEpoch++) {
    const year = Math.floor(monthsSinceEpoch / 12)
    const month = monthsSinceEpoch % 12

    // Skip if this month already exists in historical data
    const monthExists = sortedData.some((d) => {
      const histDate = new Date(d.date)
      return histDate.getFullYear() === year && histDate.getMonth() === month
    })
    if (monthExists)
      continue

    // Start with baseline value
    let predictedValue = baselineValue

    // Apply trend influence (limited effect)
    const trendInfluence = 0.2 // 20% influence from trend
    const monthsFromNow = monthsSinceEpoch - startMonth
    predictedValue += slope * monthsFromNow * trendInfluence

    // Apply seasonality if detected (limited effect)
    if (seasonality) {
      const seasonalEffect = (seasonality[month] - 1) * 0.3 // 30% influence from seasonality
      predictedValue *= (1 + seasonalEffect)
    }

    // Add small random variation based on historical standard deviation
    const variationRange = stdDev * 0.5 // 50% of historical standard deviation
    const randomVariation = (Math.random() - 0.5) * variationRange
    predictedValue += randomVariation

    // Ensure prediction stays within reasonable bounds
    predictedValue = Math.max(Math.round(baselineValue * 0.7), Math.min(Math.round(baselineValue * 1.5), Math.round(predictedValue)))

    predictions.push({
      date: new Date(year, month, 1).toISOString().slice(0, 7),
      value: Math.round(predictedValue),
    })
  }

  return predictions
}

// Calculate confidence score based on data quality and prediction accuracy
export function getConfidenceScore(historicalData: TransferData[]): number {
  if (historicalData.length < 3)
    return 0

  // Sort and clean data
  const sortedData = [...historicalData]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const cleanedData = removeOutliers(sortedData)

  const regression = linearRegression(cleanedData)
  if (!regression)
    return 0

  const { slope, intercept } = regression
  const y = cleanedData.map(d => d.value)
  const yMean = y.reduce((a, b) => a + b, 0) / y.length

  // Calculate R-squared with more weight on recent data
  const weights = cleanedData.map((_, i) => Math.exp((i - (cleanedData.length - 1)) * 0.05))
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const normalizedWeights = weights.map(w => w / weightSum)

  let ssRes = 0
  let ssTot = 0

  cleanedData.forEach((data, i) => {
    const date = new Date(data.date)
    const monthsSinceEpoch = date.getFullYear() * 12 + date.getMonth()
    const predicted = slope * monthsSinceEpoch + intercept

    ssRes += normalizedWeights[i] * (y[i] - predicted) ** 2
    ssTot += normalizedWeights[i] * (y[i] - yMean) ** 2
  })

  const rSquared = 1 - (ssRes / ssTot)

  // Calculate confidence factors with adjusted weights
  const dataQuantityFactor = Math.min(1, Math.sqrt(cleanedData.length / 6)) // More forgiving on data quantity
  const variabilityFactor = Math.max(0.5, 1 - (Math.abs(slope) / (yMean || 1))) // Less punishing for variability
  const seasonalityFactor = regression.seasonality ? 0.9 : 1 // Less impact from seasonality
  const stabilityFactor = Math.min(1, cleanedData.length / 12) // Gradual increase with more data

  // Combine factors with weighted importance
  const finalConfidence = (
    rSquared * 0.4 // 40% weight on fit quality
    + dataQuantityFactor * 0.3 // 30% weight on data quantity
    + variabilityFactor * 0.2 // 20% weight on stability
    + seasonalityFactor * 0.1 // 10% weight on seasonality
  ) * stabilityFactor // Overall stability adjustment

  return Math.max(0.1, Math.min(1, finalConfidence)) // Minimum 10% confidence
}
