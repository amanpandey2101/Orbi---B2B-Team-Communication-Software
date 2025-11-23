import z from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import prisma from "@/lib/db";
import { base } from "../middlewares/base";
import { tipTapJsonToMarkdown } from "@/lib/json-to-markdown";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { streamToEventIterator } from "@orpc/server";
import { aiSecurityMiddleware } from "../middlewares/arcjet/ai";

const openrouter = createOpenRouter({
  apiKey: process.env.LLM_KEY,
});

const MODEL_ID = "z-ai/glm-4.5-air:free";

const model = openrouter.chat(MODEL_ID);

export const generateThreadSummary = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(aiSecurityMiddleware)
  .route({
    method: "GET",
    path: "/ai/thread/summary",
    summary: "Tạo summary cho thread",
    tags: ["Ai"],
  })
  .input(
    z.object({
      messageId: z.string(),
    })
  )
  .handler(async ({ context, input, errors }) => {
    const baseMessage = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        threadId: true,
        channelId: true,
      },
    });

    if (!baseMessage) {
      throw errors.NOT_FOUND();
    }

    const parentId = baseMessage.threadId ?? baseMessage.id;

    const parent = await prisma.message.findFirst({
      where: {
        id: parentId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorName: true,
        replies: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorName: true,
          },
        },
      },
    });

    if (!parent) {
      throw errors.NOT_FOUND();
    }

    const replies = parent.replies.slice().reverse();

    const parentText = await tipTapJsonToMarkdown(parent.content);

    const replyLines = await Promise.all(
      replies.map(async (r) => {
        const t = await tipTapJsonToMarkdown(r.content);
        return `- ${r.authorName} - ${r.createdAt.toISOString()}: ${t}`;
      })
    );

    const compiled = [
      `Thread Root - ${parent.authorName} - ${parent.createdAt.toISOString()}`,
      parentText,
      ...(replyLines.length > 0 ? ["\nReplies", ...replyLines] : []),
    ].join("\n");

    const system = [
      "You are a professional assistant specializing in summarizing Slack-like discussion threads for a product team.",

      "Only use the provided thread content; do not fabricate facts, names, or timelines.",

      "Output Format (Markdown):",

      "- First, write a concise paragraph (2-4 sentences) capturing the thread's purpose, key decisions, context, and any blockers or next steps. No headings, no lists, no introductory text.",

      "Then, add a blank line, followed by exactly 2-3 bullet points (using '-') with the most important takeaways. Each bullet point must be one sentence.",

      "Style: neutral, specific, and concise. Preserve terminology from the thread (names, acronyms). Avoid meta-commentary or additions. Do not add a concluding sentence.",

      "If the context is insufficient, return the summary as a single sentence and omit the bulleted list.",
    ].join("\n");

    const result = streamText({
      model,
      system,
      messages: [
        {
          role: "user",
          content: compiled,
        },
      ],
      temperature: 0.2,
    });

    return streamToEventIterator(result.toUIMessageStream());
  });

export const generateCompose = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(aiSecurityMiddleware)
  .route({
    method: "POST",
    path: "/ai/compose/generate",
    summary: "Compose message",
    tags: ["AI"],
  })
  .input(
    z.object({
      content: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const markdown = await tipTapJsonToMarkdown(input.content);

    const system = [
      "You are a professional rewriting assistant. You are not a chatbot.",

      "Task: Rewrite the provided content to have a clearer and better structure while retaining the meaning, facts, terminology, and names.",

      "Do not address the user, ask questions, add greetings, or offer comments.",

      "Preserve existing links/mentions. Do not alter code blocks or inline code content.",

      "Output entirely in Markdown (paragraphs and optional bulleted lists). Do not output any HTML or images.",

      "ONLY return the rewritten content. Do not include any preamble, headings, or closing remarks.",
    ].join("\n");

    const result = streamText({
      model,
      system,
      messages: [
        {
          role: "user",
          content: "Please rewrite and improve the following content.",
        },
        {
          role: "user",
          content: markdown,
        },
      ],
      temperature: 0,
    });

    return streamToEventIterator(result.toUIMessageStream());
  });