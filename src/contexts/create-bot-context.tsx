"use client"

import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

interface CreateBotContextType {
  openDialog: () => void
  closeDialog: () => void
  isOpen: boolean
}

const CreateBotContext = createContext<CreateBotContextType | undefined>(undefined)

export function CreateBotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openDialog = () => setIsOpen(true)
  const closeDialog = () => setIsOpen(false)

  return (
    <CreateBotContext.Provider value={{ openDialog, closeDialog, isOpen }}>
      {children}
    </CreateBotContext.Provider>
  )
}

export function useCreateBot() {
  const context = useContext(CreateBotContext)
  if (!context) {
    throw new Error("useCreateBot must be used within CreateBotProvider")
  }
  return context
}

