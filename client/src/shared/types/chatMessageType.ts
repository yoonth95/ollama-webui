import { z } from "zod";
import { SSEChatErrorTypeSchema } from "@/features/chat/types/sseChatDataType";

export const ImageDataSchema = z.object({
  id: z.string(),
  data: z.string(),
  mimeType: z.string(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  model: z.string(),
  content: z.string(),
  images: z.array(ImageDataSchema).nullable(),
  errorType: SSEChatErrorTypeSchema.nullable(),
  errorMessage: z.string().nullable(),
  userMessageId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ChatMessageArraySchema = z.array(ChatMessageSchema);

export const ChatRetryRequestSchema = z.object({
  roomId: z.string(),
  userMessageId: z.string().nullable(),
  answerId: z.string().nullable(),
  isErrorRetry: z.boolean(),
});

export type ImageDataType = z.infer<typeof ImageDataSchema>;
export type ChatMessageType = z.infer<typeof ChatMessageSchema>;
export type ChatMessageArrayType = z.infer<typeof ChatMessageArraySchema>;
export type ChatRetryRequestType = z.infer<typeof ChatRetryRequestSchema>;
