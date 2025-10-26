"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Clock, Users, BarChart3, Activity, Zap, Star, Award } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import botsData from "@/data/bots.json"

// Filter for forecasting models only
const forecastingModels = botsData.filter(bot => bot.category === "forecasting")

function ForecastingModelCard({ model }: { model: any }) {
  const isPositive = model.monthlyPerformance > 0
  const accuracyPercent = parseFloat(model.accuracy.replace('%', ''))
  
  // Color scheme based on ranking
  const getRankingColor = (ranking: number) => {
    if (ranking <= 2) return "bg-gradient-to-br from-yellow-500 to-orange-500"
    if (ranking <= 4) return "bg-gradient-to-br from-blue-500 to-purple-500" 
    if (ranking <= 6) return "bg-gradient-to-br from-green-500 to-emerald-500"
    return "bg-gradient-to-br from-gray-500 to-slate-500"
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 25) return "text-emerald-600"
    if (performance >= 20) return "text-blue-600"
    if (performance >= 15) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 relative overflow-hidden">
      {/* Ranking Badge */}
      <div className={`absolute top-4 right-4 ${getRankingColor(model.ranking)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10`}>
        #{model.ranking}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {model.name.slice(0, 2)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {model.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {model.architecture}
            </CardDescription>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              {model.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{model.accuracy}</div>
            <Progress value={accuracyPercent} className="mt-2 h-2" />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">MAPE</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{model.mape}%</div>
            <Progress value={100 - model.mape} className="mt-2 h-2" />
          </div>
        </div>

        {/* Performance & Usage Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 ${getPerformanceColor(model.monthlyPerformance)}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-lg font-bold">{model.monthlyPerformance}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Monthly</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Users className="w-4 h-4" />
              <span className="text-lg font-bold">{(model.userCount / 1000).toFixed(1)}K</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Users</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600">
              <BarChart3 className="w-4 h-4" />
              <span className="text-lg font-bold">{Math.round(model.totalTrades / 1000)}K</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Trades</p>
          </div>
        </div>

        {/* Performance Chart */}
        {model.dailyPerformance && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              7-Day Performance Trend
            </h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={model.dailyPerformance}>
                  <defs>
                    <linearGradient id={`colorGradient${model.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Performance']}
                    labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                    contentStyle={{ backgroundColor: '#1e40af', border: 'none', borderRadius: '8px', color: 'white' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill={`url(#colorGradient${model.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Technical Specs with Enhanced Visual */}
        {model.specs && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Technical Architecture
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-xs text-purple-600 font-medium">Epochs</div>
                <div className="text-lg font-bold text-purple-900">{model.specs.epochs || 'N/A'}</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-xs text-purple-600 font-medium">Training Time</div>
                <div className="text-lg font-bold text-purple-900">{model.specs.training_time || 'N/A'}</div>
              </div>
              {model.specs.history_window && (
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="text-xs text-purple-600 font-medium">Window</div>
                  <div className="text-lg font-bold text-purple-900">{model.specs.history_window}</div>
                </div>
              )}
              {model.specs.learning_rate && (
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="text-xs text-purple-600 font-medium">Learning Rate</div>
                  <div className="text-lg font-bold text-purple-900">{model.specs.learning_rate}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Model Comparison Radar - Accuracy vs MAPE */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Performance Metrics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray={`${accuracyPercent}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-700">{model.accuracy}</span>
                </div>
              </div>
              <div className="text-xs text-green-600 font-medium">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray={`${100 - model.mape}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-700">{model.mape}%</span>
                </div>
              </div>
              <div className="text-xs text-orange-600 font-medium">MAPE</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {model.tags.slice(0, 4).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Top {model.topPercentile}%</span>
            <span className="text-gray-400">•</span>
            <span>#{model.ranking}/{model.totalBots}</span>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function ForecastingPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
              {/* Header Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Forecasting Models</h1>
                    <p className="text-gray-600">Advanced AI models for cryptocurrency price prediction</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Models</p>
                          <p className="text-2xl font-bold">{forecastingModels.length}</p>
                        </div>
                        <Target className="w-8 h-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Best Accuracy</p>
                          <p className="text-2xl font-bold">
                            {Math.max(...forecastingModels.map(m => parseFloat(m.accuracy.replace('%', ''))))}%
                          </p>
                        </div>
                        <Activity className="w-8 h-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Total Users</p>
                          <p className="text-2xl font-bold">
                            {Math.round(forecastingModels.reduce((sum, m) => sum + m.userCount, 0) / 1000)}K
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Total Trades</p>
                          <p className="text-2xl font-bold">
                            {Math.round(forecastingModels.reduce((sum, m) => sum + m.totalTrades, 0) / 1000)}K
                          </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Overview Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Model Performance Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        Model Performance Rankings
                      </CardTitle>
                      <CardDescription>Monthly performance comparison across all models</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={forecastingModels.slice(0, 6).map(m => ({ 
                            name: m.name.split(' ').slice(0, 2).join(' '), 
                            performance: m.monthlyPerformance,
                            ranking: m.ranking
                          }))}>
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any, name: string) => [`${value}%`, 'Performance']}
                              contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                            />
                            <Bar dataKey="performance" fill="#3b82f6" radius={4} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Accuracy Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Accuracy Distribution
                      </CardTitle>
                      <CardDescription>Model accuracy ranges and distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: '85%+ Accuracy', value: forecastingModels.filter(m => parseFloat(m.accuracy.replace('%', '')) >= 85).length, fill: '#10b981' },
                                { name: '80-84% Accuracy', value: forecastingModels.filter(m => parseFloat(m.accuracy.replace('%', '')) >= 80 && parseFloat(m.accuracy.replace('%', '')) < 85).length, fill: '#3b82f6' },
                                { name: '75-79% Accuracy', value: forecastingModels.filter(m => parseFloat(m.accuracy.replace('%', '')) >= 75 && parseFloat(m.accuracy.replace('%', '')) < 80).length, fill: '#f59e0b' },
                                { name: '<75% Accuracy', value: forecastingModels.filter(m => parseFloat(m.accuracy.replace('%', '')) < 75).length, fill: '#ef4444' }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Tooltip formatter={(value: any) => [`${value} models`, 'Count']} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Models Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {forecastingModels
                  .sort((a, b) => a.ranking - b.ranking) // Sort by ranking
                  .map((model) => (
                    <ForecastingModelCard key={model.id} model={model} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}