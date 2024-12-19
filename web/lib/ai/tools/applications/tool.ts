import { Tool } from "../tool"
import { submitApplication } from "./submit-application"
import { submitApplicationPrompt } from "./submit-application-prompt"

export const submitApplicationTool = {
  name: "submitApplication",
  prompt: submitApplicationPrompt(),
  tool: submitApplication,
} satisfies Tool
