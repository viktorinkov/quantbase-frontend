"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PortfolioBalances {
  usd: number
  sol: number
  sol_value_usd: number
  total_value_usd: number
}

interface PortfolioBalancesProps {
  balances?: PortfolioBalances
}

export function PortfolioBalances({ balances }: PortfolioBalancesProps) {
  if (!balances) {
    return null
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* USD Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              USD Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${balances.usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Solana Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solana Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {balances.sol.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              ~${balances.sol_value_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
