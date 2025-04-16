import { z } from "zod";

const SSEChatErrorTypeSchema = z.enum(["network", "timeout", "model", "content", "connection", "unknown"]);

export const SSEChatDataTypeSchema = z.object({
  isReceiving: z.boolean(),
  response: z.string(),
  model: z.string().optional(),
  createdAt: z.string().optional(),
  error: z.boolean().optional(),
  errorType: SSEChatErrorTypeSchema.optional(),
  errorMessage: z.string().optional(),
});

export const ChatCancelRequestSchema = z.object({
  roomId: z.string(),
});

export type SSEChatErrorType = z.infer<typeof SSEChatErrorTypeSchema>;
export type SSEChatDataType = z.infer<typeof SSEChatDataTypeSchema>;
export type ChatCancelRequestType = z.infer<typeof ChatCancelRequestSchema>;
