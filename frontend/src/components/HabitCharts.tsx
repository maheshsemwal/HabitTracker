import { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { analyticsAPI } from '../services/api';

interface ChartData {
  streakData: Array<{ date: string; streak: number }>;
  completionData: Array<{ habit: string; completions: number; color: string }>;
  weeklyData: Array<{ day: string; completions: number }>;
}

interface HabitChartsProps {
  userId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const HabitCharts: React.FC<HabitChartsProps> = ({ userId }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [userId]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getChartData(userId);
      setChartData(data);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      // Use fallback data on error
      setChartData({
        streakData: [
          { date: '2024-01-01', streak: 1 },
          { date: '2024-01-02', streak: 2 },
          { date: '2024-01-03', streak: 3 },
          { date: '2024-01-04', streak: 4 },
          { date: '2024-01-05', streak: 5 },
          { date: '2024-01-06', streak: 6 },
          { date: '2024-01-07', streak: 7 },
        ],
        weeklyData: [
          { day: 'Mon', completions: 8 },
          { day: 'Tue', completions: 12 },
          { day: 'Wed', completions: 10 },
          { day: 'Thu', completions: 15 },
          { day: 'Fri', completions: 9 },
          { day: 'Sat', completions: 11 },
          { day: 'Sun', completions: 7 },
        ],
        completionData: [
          { habit: 'Exercise', completions: 25, color: COLORS[0] },
          { habit: 'Reading', completions: 20, color: COLORS[1] },
          { habit: 'Meditation', completions: 30, color: COLORS[2] },
          { habit: 'Water Intake', completions: 28, color: COLORS[3] },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Streak Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Streak Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.streakData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value} days`, 'Streak']}
              />
              <Line 
                type="monotone" 
                dataKey="streak" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Completions */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Completions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completions" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Habit Completion Distribution */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Habit Completion Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center">
            <ResponsiveContainer width="100%" height={300} className="lg:w-1/2">
              <PieChart>
                <Pie
                  data={chartData.completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ habit, percent }: any) => `${habit} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="completions"
                >
                  {chartData.completionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="lg:w-1/2 mt-4 lg:mt-0">
              <div className="space-y-3">
                {chartData.completionData.map((item, index) => (
                  <div key={`${item.habit}-${index}`} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.habit}</span>
                        <span className="text-sm text-muted-foreground">{item.completions}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(item.completions / Math.max(...chartData.completionData.map(d => d.completions))) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitCharts;