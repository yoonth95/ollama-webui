import { z } from "zod";

export const SSEChatErrorTypeSchema = z.enum(["NETWORK", "TIMEOUT", "MODEL", "CONTENT", "CONNECTION", "UNKNOWN"]);

export const SSEChatDataTypeSchema = z.object({
  isRetry: z.boolean().optional(),
  isReceiving: z.boolean(),
  content: z.string(),
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
