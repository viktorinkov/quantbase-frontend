"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Settings, 
  Wand2, 
  Target,
  CheckCircle
} from "lucide-react"

interface BotParameters {
  kSig: number
  window: number
  stopLoss: number
  takeProfit: number
  positionSize: number
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
  tradingHours: '24/7' | 'market-hours' | 'custom'
  customHours?: string
}

interface BotParameterCustomizerProps {
  botId: string
  botName: string
  currentParameters?: BotParameters
  onParametersChange: (parameters: BotParameters) => void
}

const defaultParameters: BotParameters = {
  kSig: 2.0,
  window: 20,
  stopLoss: 2.0,
  takeProfit: 4.0,
  positionSize: 0.1,
  riskLevel: 'moderate',
  tradingHours: '24/7'
}

export function BotParameterCustomizer({ 
  botId,
  botName, 
  currentParameters = defaultParameters,
  onParametersChange 
}: BotParameterCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [parameters, setParameters] = useState<BotParameters>(currentParameters)
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastProcessedInput, setLastProcessedInput] = useState("")

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageInput.trim()) return
    
    setIsProcessing(true)
    setLastProcessedInput(naturalLanguageInput)
    
    try {
      // Call backend API for Claude AI processing
      const response = await fetch('/api/bots/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: botId,
          user_preferences: {
            user_request: naturalLanguageInput,
            preferences_description: naturalLanguageInput
          },
          natural_language_input: naturalLanguageInput
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process natural language input')
      }

      const result = await response.json()
      
      // Update parameters with Claude AI response
      if (result.personalized_parameters) {
        setParameters(result.personalized_parameters)
      }
      
    } catch (error) {
      console.error('Error processing natural language:', error)
      // Fallback to local processing if backend fails
      const processedParams = processNaturalLanguageInput(naturalLanguageInput, parameters)
      setParameters(processedParams)
    } finally {
      setIsProcessing(false)
    }
  }

  const processNaturalLanguageInput = (input: string, currentParams: BotParameters): BotParameters => {
    const lowerInput = input.toLowerCase()
    const newParams = { ...currentParams }

    // Risk level adjustments
    if (lowerInput.includes('conservative') || lowerInput.includes('safe') || lowerInput.includes('low risk')) {
      newParams.riskLevel = 'conservative'
      newParams.stopLoss = 1.5
      newParams.takeProfit = 3.0
      newParams.positionSize = 0.05
    } else if (lowerInput.includes('aggressive') || lowerInput.includes('high risk') || lowerInput.includes('risky')) {
      newParams.riskLevel = 'aggressive'
      newParams.stopLoss = 3.0
      newParams.takeProfit = 6.0
      newParams.positionSize = 0.2
    }

    // K-Signal adjustments
    if (lowerInput.includes('sensitive') || lowerInput.includes('quick') || lowerInput.includes('fast')) {
      newParams.kSig = 1.5
    } else if (lowerInput.includes('stable') || lowerInput.includes('slow') || lowerInput.includes('smooth')) {
      newParams.kSig = 2.5
    }

    // Window adjustments
    if (lowerInput.includes('short term') || lowerInput.includes('quick') || lowerInput.includes('immediate')) {
      newParams.window = 10
    } else if (lowerInput.includes('long term') || lowerInput.includes('patient') || lowerInput.includes('extended')) {
      newParams.window = 30
    }

    // Stop loss adjustments
    if (lowerInput.includes('tight stop') || lowerInput.includes('close stop')) {
      newParams.stopLoss = 1.0
    } else if (lowerInput.includes('wide stop') || lowerInput.includes('loose stop')) {
      newParams.stopLoss = 4.0
    }

    // Take profit adjustments
    if (lowerInput.includes('small profit') || lowerInput.includes('quick profit')) {
      newParams.takeProfit = 2.0
    } else if (lowerInput.includes('big profit') || lowerInput.includes('large profit')) {
      newParams.takeProfit = 8.0
    }

    // Position size adjustments
    if (lowerInput.includes('small position') || lowerInput.includes('tiny position')) {
      newParams.positionSize = 0.02
    } else if (lowerInput.includes('large position') || lowerInput.includes('big position')) {
      newParams.positionSize = 0.3
    }

    return newParams
  }

  const handleSave = async () => {
    try {
      // Save parameters via backend API
      const response = await fetch('/api/bots/personalize', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: botId,
          user_request: `Update parameters: ${JSON.stringify(parameters)}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save parameters')
      }

      const result = await response.json()
      
      // Update with any modifications from backend
      if (result.modified_parameters) {
        setParameters(result.modified_parameters)
        onParametersChange(result.modified_parameters)
      } else {
        onParametersChange(parameters)
      }
      
    } catch (error) {
      console.error('Error saving parameters:', error)
      // Fallback to local save if backend fails
      onParametersChange(parameters)
    } finally {
      setIsOpen(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'text-green-600 bg-green-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      case 'aggressive': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Customize Parameters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Customize {botName} Parameters
          </DialogTitle>
          <DialogDescription>
            Adjust trading parameters using natural language or manual controls
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Natural Language Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Natural Language Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="natural-input">Describe your trading preferences</Label>
                <Textarea
                  id="natural-input"
                  placeholder="e.g., 'I want a conservative strategy with tight stop losses and quick profits' or 'Make it more aggressive with larger positions'"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              {lastProcessedInput && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Processed:</p>
                    <p className="text-sm text-blue-700">&ldquo;{lastProcessedInput}&rdquo;</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleNaturalLanguageSubmit}
                disabled={!naturalLanguageInput.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Apply Natural Language Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Manual Parameter Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manual Parameter Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Level */}
              <div>
                <Label className="text-base font-medium">Risk Level</Label>
                <div className="flex gap-2 mt-2">
                  {(['conservative', 'moderate', 'aggressive'] as const).map((risk) => (
                    <Button
                      key={risk}
                      variant={parameters.riskLevel === risk ? "default" : "outline"}
                      size="sm"
                      onClick={() => setParameters({...parameters, riskLevel: risk})}
                      className="capitalize"
                    >
                      {risk}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Technical Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ksig">K-Signal Sensitivity</Label>
                  <Input
                    id="ksig"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="5.0"
                    value={parameters.kSig}
                    onChange={(e) => setParameters({...parameters, kSig: parseFloat(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower = more sensitive to price changes
                  </p>
                </div>

                <div>
                  <Label htmlFor="window">Analysis Window</Label>
                  <Input
                    id="window"
                    type="number"
                    min="5"
                    max="50"
                    value={parameters.window}
                    onChange={(e) => setParameters({...parameters, window: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of periods for analysis
                  </p>
                </div>
              </div>

              {/* Risk Management */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stoploss">Stop Loss (%)</Label>
                  <Input
                    id="stoploss"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="10.0"
                    value={parameters.stopLoss}
                    onChange={(e) => setParameters({...parameters, stopLoss: parseFloat(e.target.value)})}
                  />
                </div>

                <div>
                  <Label htmlFor="takeprofit">Take Profit (%)</Label>
                  <Input
                    id="takeprofit"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="20.0"
                    value={parameters.takeProfit}
                    onChange={(e) => setParameters({...parameters, takeProfit: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              {/* Position Sizing */}
              <div>
                <Label htmlFor="positionsize">Position Size (% of portfolio)</Label>
                <Input
                  id="positionsize"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1.0"
                  value={parameters.positionSize}
                  onChange={(e) => setParameters({...parameters, positionSize: parseFloat(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How much of your portfolio to risk per trade
                </p>
              </div>

              {/* Trading Hours */}
              <div>
                <Label className="text-base font-medium">Trading Schedule</Label>
                <div className="flex gap-2 mt-2">
                  {(['24/7', 'market-hours', 'custom'] as const).map((schedule) => (
                    <Button
                      key={schedule}
                      variant={parameters.tradingHours === schedule ? "default" : "outline"}
                      size="sm"
                      onClick={() => setParameters({...parameters, tradingHours: schedule})}
                    >
                      {schedule === 'market-hours' ? 'Market Hours' : schedule}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Parameters Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4" />
                Current Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Level</span>
                    <Badge className={getRiskColor(parameters.riskLevel)}>
                      {parameters.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">K-Signal</span>
                    <span className="text-sm">{parameters.kSig}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Window</span>
                    <span className="text-sm">{parameters.window} periods</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stop Loss</span>
                    <span className="text-sm">{parameters.stopLoss}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Take Profit</span>
                    <span className="text-sm">{parameters.takeProfit}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Position Size</span>
                    <span className="text-sm">{(parameters.positionSize * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Parameters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
