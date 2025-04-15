import { z } from "zod";

export const SSEChatDataTypeSchema = z.object({
  isReceiving: z.boolean(),
  response: z.string(),
  model: z.string().optional(),
  createdAt: z.string().optional(),
  error: z.boolean().optional(),
  errorType: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const ChatCancelRequestSchema = z.object({
  roomId: z.string(),
});

export type SSEChatDataType = z.infer<typeof SSEChatDataTypeSchema>;
export type ChatCancelRequestType = z.infer<typeof ChatCancelRequestSchema>;
