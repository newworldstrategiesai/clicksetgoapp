// pages/api/anthropic.ts (Next.js API route)
import { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "", 
      // Make sure to set your key in the environment
    });

    const message = await anthropic.beta.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      tools: [
        {
          type: "computer_20241022",
          name: "computer",
          display_width_px: 1024,
          display_height_px: 768,
          display_number: 1
        },
        {
          type: "text_editor_20241022",
          name: "str_replace_editor"
        },
        {
          type: "bash_20241022",
          name: "bash"
        }
      ],
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      betas: ["computer-use-2024-10-22"],
    });

    // Return the raw message or part of it back to the client
    return res.status(200).json({ result: message });
  } catch (error: any) {
    console.error("Anthropic API Error:", error);
    return res
      .status(500)
      .json({ error: "Error calling Anthropic API", details: error?.message });
  }
}
