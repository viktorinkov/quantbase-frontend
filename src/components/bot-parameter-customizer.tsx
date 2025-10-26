"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  window: number
  k_sigma: number
  risk_factor: number
  base_trade_size: number
}

interface BotParameterCustomizerProps {
  botId: string
  botName: string
  currentParameters?: BotParameters
  onParametersChange: (parameters: BotParameters) => void
}

const defaultParameters: BotParameters = {
  window: 15,
  k_sigma: 1.5,
  risk_factor: 0.5,
  base_trade_size: 0.002
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

    // Risk factor adjustments (0.0-1.0, where 0.0 is conservative, 1.0 is aggressive)
    if (lowerInput.includes('conservative') || lowerInput.includes('safe') || lowerInput.includes('low risk')) {
      newParams.risk_factor = 0.3
      newParams.base_trade_size = 0.0005 // Smaller trades for conservative
    } else if (lowerInput.includes('aggressive') || lowerInput.includes('high risk') || lowerInput.includes('risky')) {
      newParams.risk_factor = 0.7
      newParams.base_trade_size = 0.005 // Larger trades for aggressive
    } else if (lowerInput.includes('moderate')) {
      newParams.risk_factor = 0.5
      newParams.base_trade_size = 0.002
    }

    // K-Sigma adjustments (0.5-3.0, typical 1.0-2.0)
    if (lowerInput.includes('sensitive') || lowerInput.includes('quick') || lowerInput.includes('fast')) {
      newParams.k_sigma = 1.0
    } else if (lowerInput.includes('stable') || lowerInput.includes('slow') || lowerInput.includes('smooth')) {
      newParams.k_sigma = 2.5
    } else if (lowerInput.includes('balanced')) {
      newParams.k_sigma = 1.5
    }

    // Window adjustments (5-30, typical 10-20)
    if (lowerInput.includes('short term') || lowerInput.includes('quick') || lowerInput.includes('immediate')) {
      newParams.window = 10
    } else if (lowerInput.includes('long term') || lowerInput.includes('patient') || lowerInput.includes('extended')) {
      newParams.window = 25
    } else if (lowerInput.includes('balanced')) {
      newParams.window = 15
    }

    // Base trade size adjustments (0.0001-0.01)
    if (lowerInput.includes('small position') || lowerInput.includes('tiny position')) {
      newParams.base_trade_size = 0.0005
    } else if (lowerInput.includes('large position') || lowerInput.includes('big position')) {
      newParams.base_trade_size = 0.008
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
            Adjust the four core trading parameters using natural language or manual controls
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
                  placeholder="e.g., 'I want a conservative strategy with shorter lookback periods' or 'Make it more aggressive with larger positions and higher sensitivity'"
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
                    Create Custom Model
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
              {/* Window Parameter */}
              <div>
                <Label htmlFor="window">Window (Rolling Lookback)</Label>
                <Input
                  id="window"
                  type="number"
                  min="5"
                  max="30"
                  value={parameters.window}
                  onChange={(e) => setParameters({...parameters, window: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Number of time periods to look back (5-30, typical 10-20). Lower values = more responsive.
                </p>
              </div>

              {/* K-Sigma Parameter */}
              <div>
                <Label htmlFor="k_sigma">K-Sigma (Standard Deviation Multiplier)</Label>
                <Input
                  id="k_sigma"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="3.0"
                  value={parameters.k_sigma}
                  onChange={(e) => setParameters({...parameters, k_sigma: parseFloat(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Multiplier for volatility calculations (0.5-3.0, typical 1.0-2.0). Lower values = tighter bands, more trades.
                </p>
              </div>

              {/* Risk Factor Parameter */}
              <div>
                <Label htmlFor="risk_factor">Risk Factor (Risk Appetite)</Label>
                <Input
                  id="risk_factor"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={parameters.risk_factor}
                  onChange={(e) => setParameters({...parameters, risk_factor: parseFloat(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Controls risk behavior (0.0-1.0). 0.0 = conservative, 1.0 = aggressive. Typical: 0.3-0.7.
                </p>
              </div>

              {/* Base Trade Size Parameter */}
              <div>
                <Label htmlFor="base_trade_size">Base Trade Size (Position Sizing)</Label>
                <Input
                  id="base_trade_size"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  max="0.01"
                  value={parameters.base_trade_size}
                  onChange={(e) => setParameters({...parameters, base_trade_size: parseFloat(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Base size of trades in the asset being traded (0.0001-0.01, typical 0.0005-0.002). Higher values = larger positions.
                </p>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Window</span>
                  <span className="text-sm">{parameters.window} periods</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">K-Sigma</span>
                  <span className="text-sm">{parameters.k_sigma}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Risk Factor</span>
                  <span className="text-sm">{parameters.risk_factor}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Base Trade Size</span>
                  <span className="text-sm">{parameters.base_trade_size}</span>
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
