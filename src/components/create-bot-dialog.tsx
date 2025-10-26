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
  CheckCircle,
  Plus,
  Bot
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

interface NewBot {
  id: string
  name: string
  description: string
  image: string
  creator: {
    username: string
    avatar: string
  }
  parameters: BotParameters
}

interface CreateBotDialogProps {
  onCreateBot: (bot: NewBot) => void
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

export function CreateBotDialog({ onCreateBot }: CreateBotDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [botName, setBotName] = useState("")
  const [botDescription, setBotDescription] = useState("")
  const [parameters, setParameters] = useState<BotParameters>(defaultParameters)
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastProcessedInput, setLastProcessedInput] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
          botId: 'temp', // Temporary ID for processing
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
      
      // Convert backend parameters to frontend format
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

  const handleCreateBot = async () => {
    if (!botName.trim()) return

    setErrorMessage(null) // Clear any previous errors

    try {
      // Create bot via backend API
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: botName,
          description: botDescription,
          parameters: parameters,
          creator_username: "current_user" // TODO: Get from auth context
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error || 'Failed to create bot'
        setErrorMessage(errorMsg)
        throw new Error(errorMsg)
      }

      const newBot = await response.json()
      
      // Call the onCreateBot callback with the created bot
      onCreateBot(newBot)
      
      // Reset form
      setBotName("")
      setBotDescription("")
      setParameters(defaultParameters)
      setNaturalLanguageInput("")
      setLastProcessedInput("")
      setErrorMessage(null)
      setIsOpen(false)
      
    } catch (error) {
      console.error('Error creating bot:', error)
      
      // Only show error message if not already set
      if (!errorMessage) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to create bot'
        setErrorMessage(errorMsg)
      }
      
      // Note: We're not doing fallback creation anymore - user sees the error
      // If you want to keep the fallback, remove the lines above and uncomment below:
      /*
      // Fallback to local creation if backend fails
      const newBot: NewBot = {
        id: `bot-${Date.now()}`,
        name: botName,
        description: botDescription,
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${botName}`,
        creator: {
          username: "you",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
        },
        parameters
      }

      onCreateBot(newBot)
      
      // Reset form
      setBotName("")
      setBotDescription("")
      setParameters(defaultParameters)
      setNaturalLanguageInput("")
      setLastProcessedInput("")
      setIsOpen(false)
      */
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
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          // Reset error message when dialog is closed
          setErrorMessage(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Trading Bot
          </DialogTitle>
          <DialogDescription>
            Design and configure your custom SOL trading bot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-red-600 font-semibold">⚠️ Error:</div>
                <div className="text-red-700 text-sm">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Bot Basic Info */}
          <Card>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bot-name">Bot Name</Label>
                <Input
                  id="bot-name"
                  placeholder="e.g., My Custom SOL Trader"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bot-description">Description</Label>
                <Textarea
                  id="bot-description"
                  placeholder="Describe your bot's strategy and approach..."
                  value={botDescription}
                  onChange={(e) => setBotDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Natural Language Input */}
          <Card>
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

          {/* Current Parameters Summary */}
          <Card>
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
          <Button onClick={handleCreateBot} disabled={!botName.trim()}>
            Create Bot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
