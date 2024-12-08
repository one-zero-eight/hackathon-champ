import type { TransferData } from '@/lib/transfers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getConfidenceScore } from '@/lib/transfers'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface PredictionChartProps {
  historicalData: TransferData[]
  predictions: TransferData[]
  title: string
  valueLabel: string
}

export function PredictionChart({ historicalData, predictions, title, valueLabel }: PredictionChartProps) {
  const confidence = getConfidenceScore(historicalData)

  // Sort historical data by date
  const sortedHistorical = [...historicalData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Ensure predictions are sorted
  const sortedPredictions = [...predictions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm text-muted-foreground">
            Уверенность модели:
            {' '}
            {Math.round(confidence * 100)}
            %
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart>
              <defs>
                <linearGradient id="historical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prediction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
                type="category"
                allowDuplicatedCategory={false}
              />
              <YAxis
                label={{
                  value: valueLabel,
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip
                formatter={(value: number) => [value, valueLabel]}
                labelFormatter={label => label}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#historical)"
                data={sortedHistorical}
                name="Исторические данные"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#prediction)"
                data={sortedPredictions}
                name="Прогноз"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
