"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Wand2,
  CheckCircle,
  Plus,
  Bot
} from "lucide-react"
import { RollingText } from "@/components/ui/shadcn-io/rolling-text"

// Looping Rolling Text Component
function LoopingRollingText({ text, className }: { text: string; className?: string }) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(prev => prev + 1)
    }, 2500) // Loop every 2.5 seconds (allows animation to complete)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={className}>
      <RollingText
        key={key}
        text={text}
        transition={{ duration: 0.4, delay: 0.05 }}
      />
    </div>
  )
}

interface BotParameters {
  window: number
  k_sigma: number
  risk_factor: number
  base_trade_size: number
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
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const defaultParameters: BotParameters = {
  window: 15,
  k_sigma: 1.5,
  risk_factor: 0.5,
  base_trade_size: 0.002
}

export function CreateBotDialog({ onCreateBot, open, onOpenChange }: CreateBotDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use controlled or uncontrolled mode
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = open !== undefined ? onOpenChange || (() => {}) : setInternalOpen
  const [botName, setBotName] = useState("")
  const [botDescription, setBotDescription] = useState("")
  const [parameters, setParameters] = useState<BotParameters>(defaultParameters)
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastProcessedInput, setLastProcessedInput] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showOptimizingLoader, setShowOptimizingLoader] = useState(false)

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageInput.trim()) return

    setIsProcessing(true)
    setShowOptimizingLoader(true)
    setLastProcessedInput(naturalLanguageInput)

    try {
      // Minimum 2 second delay to show the loader animation
      const [response] = await Promise.all([
        fetch('/api/bots/personalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // No botId - triggers standalone endpoint for parameter generation
            user_preferences: {
              user_request: naturalLanguageInput,
              preferences_description: naturalLanguageInput
            },
            natural_language_input: naturalLanguageInput
          })
        }),
        new Promise(resolve => setTimeout(resolve, 2000))
      ])

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to process natural language input'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.detail || errorMessage
        } catch {
          // If not JSON, use the text as-is
          if (errorText) errorMessage = errorText
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Apply personalized parameters from backend
      if (result.personalized_parameters) {
        setParameters(result.personalized_parameters)
      } else {
        // Fallback to local processing if response format is unexpected
        console.log('Unexpected response format, using local fallback')
        const processedParams = processNaturalLanguageInput(naturalLanguageInput, parameters)
        setParameters(processedParams)
      }

    } catch (error) {
      console.error('Error processing natural language:', error)
      // Fallback to local processing if backend fails
      const processedParams = processNaturalLanguageInput(naturalLanguageInput, parameters)
      setParameters(processedParams)
    } finally {
      setIsProcessing(false)
      setShowOptimizingLoader(false)
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
      {open === undefined && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Bot
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Loader Overlay */}
        {showOptimizingLoader && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-lg">
            <LoopingRollingText
              text="Optimizing Algorithm"
              className="text-2xl font-bold text-foreground"
            />
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Trading Bot
          </DialogTitle>
          <DialogDescription>
            Design and configure your custom trading bot
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
                <Label htmlFor="bot-name" className="mb-2 block">Bot Name</Label>
                <Input
                  id="bot-name"
                  placeholder="e.g., My Custom SOL Trader"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bot-description" className="mb-2 block">Description</Label>
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
                <Label htmlFor="natural-input" className="mb-2 block">Describe your trading preferences</Label>
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
                    Create Custom Model
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Current Parameters Summary */}
          <Card>
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
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={showOptimizingLoader}>
            Cancel
          </Button>
          <Button onClick={handleCreateBot} disabled={!botName.trim() || showOptimizingLoader}>
            Create Bot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
