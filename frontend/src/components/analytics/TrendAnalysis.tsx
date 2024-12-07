import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface TrendData {
  name: string
  value: number
  trend: number
}

interface TrendAnalysisProps {
  data: TrendData[]
  title: string
  valueLabel?: string
  trendLabel?: string
}

export function TrendAnalysis({
  data,
  title,
  valueLabel = 'Значение',
  trendLabel = 'Изменение',
}: TrendAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
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
                formatter={(value: number) => [`${value}`, valueLabel]}
                labelFormatter={label => `${label}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                name={valueLabel}
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#trend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {trendLabel}
              :
            </span>
            {data.length > 0 && (
              <span className={cn(
                'font-medium',
                data[data.length - 1].trend > 0
                  ? 'text-green-600'
                  : data[data.length - 1].trend < 0
                    ? 'text-red-600'
                    : 'text-muted-foreground',
              )}
              >
                {data[data.length - 1].trend > 0 ? '+' : ''}
                {data[data.length - 1].trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
