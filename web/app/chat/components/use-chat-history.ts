"use client"

import { Message } from "ai"

interface Props {
  id: string
}

export function useChatHistory(props: Props) {
  const { id } = props

  function readChatHistory(): Message[] {
    if (typeof window === "undefined") return []

    try {
      return JSON.parse(localStorage.getItem(id) || "[]")
    } catch (error) {
      console.error("Failed to parse chat history:", error)
      return []
    }
  }

  function storeChatHistory(messages: Message[]) {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(id, JSON.stringify(messages))
    } catch (error) {
      console.error("Failed to store chat history:", error)
    }
  }

  function resetChatHistory() {
    if (typeof window === "undefined") return
    localStorage.removeItem(id)
  }

  return {
    readChatHistory,
    storeChatHistory,
    resetChatHistory,
  }
}
