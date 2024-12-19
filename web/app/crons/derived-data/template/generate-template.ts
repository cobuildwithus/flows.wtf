import { createAnthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

const anthropic = createAnthropic({ apiKey: `${process.env.ANTHROPIC_API_KEY}` })

export async function generateTemplate(title: string, description: string) {
  const { object } = await generateObject({
    model: anthropic("claude-3-5-sonnet-20241022"),
    schema: z.object({
      template: z.string().describe("Markdown content of the template"),
    }),
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant in a grant program called "Flows".
        Flows is a system that provides funding to projects in different categories (called "flows").
        Each flow (category) has specific set of rules and guidelines that need to be followed by the recipients.
        When user (future recipient) wants to apply for a grant in a specific flow, they need to submit an application.
        User needs to provide information like title, tagline, or image, but the most important part is a description.
        Description is a markdown document that contains information about the project, team, impact, and other relevant information.
        To make it easier for user and to make sure that all applications are consistent and follow the same format,
        we need to provide a template for the description. Users then can just fill in the template with their information.

        You will be given a title and description of a flow.
        Your job is to generate a template for someone applying, in line with the description of the flow they're applying to.
        As a part of application user needs to mark checkbox that they agree with the terms and conditions - so please do not include this part in the template.
        The template should not ask user to describe how they plan to stick to the requirements.
        The main goal of the description field in application process is to learn about the project, not to ensure that recipient knows all the requirements.
        All these requirements are already included in the flow description, displayed near the application form.
        Do not ask user for their name, email or any other contact information.

        The editor applications use have option to upload images or videos. You may mention this in the template whenever it makes sense.

        DO NOT include this in the template: "Note: An application fee is required and will be returned if you meet the application requirements."
        Do not include any reminders about ongoing requirements inside the template itself.
        Prefer header sections instead of bullet points, so it's easier for the user to read and fill in.
        Do not paraphrase too much, just make it very similar to the How to Apply section of the flow description.
        DO NOT include a title section or "Flow name" Application at the top of the template.
        Prefer to wrap areas the application should fill in with [] square brackets so they can easily input what's required and overwrite it.
        Always use h1 headings for section headers, we use a small font for the editor, so it is necessary to make them large.
        Don't use words like you or your, instead use the first person eg: "About me" instead of "About you".

        The template should be in markdown format, and should be easy to understand and follow. It shouldn't be too long.
        Include mainly what's mentioned in "How to apply" section of the flow description. Keep it very short, and do not paraphrase the flow description. Only include what's absolutely necessary, it's just a structure for applicants to fill in. 
        Ideally the template should not be much longer than the How to Apply section of the flow description. Above all else, make it very similar to the How to Apply section of the flow description, make the language incredibly simple, and do not include many words. Ensure you emphasize the important of uploading images or videos if the flow description requires it. Make it very clear.
        Finally, in every application, make sure to include a section at the beginning for the applicant to share who they are, and social links. 
        `,
      },

      {
        role: "user",
        content: [{ type: "text", text: `Title: ${title}\n\nDescription: ${description}` }],
      },
    ],
    maxTokens: 2500,
  })

  return object
}
