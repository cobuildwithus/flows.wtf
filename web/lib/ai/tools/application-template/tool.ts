import { Tool } from "../tool"
import { getApplicationTemplate } from "./application-template"
import { applicationTemplatePrompt } from "./application-template-prompt"

export const applicationTemplateTool = {
  name: "applicationTemplate",
  prompt: applicationTemplatePrompt(),
  tool: getApplicationTemplate,
} satisfies Tool
