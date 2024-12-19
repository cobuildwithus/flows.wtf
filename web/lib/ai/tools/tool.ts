import { CoreTool } from "ai"

export type Tool = {
  name: string
  prompt: string
  tool: CoreTool
}

export function getToolsPrompt(tools: Tool[]) {
  return `
    # Tools 
    You have access to the following tools
    
    ${tools.map((tool) => `## ${tool.name}\n ${tool.prompt}`).join("\n\n")}`
}

export function getTools(tools: Tool[]): Record<string, CoreTool> {
  return Object.fromEntries(tools.map((tool) => [tool.name, tool.tool]))
}
