import { z } from "zod";

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
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ChatMessageArraySchema = z.array(ChatMessageSchema);

export type ImageDataType = z.infer<typeof ImageDataSchema>;
export type ChatMessageType = z.infer<typeof ChatMessageSchema>;
export type ChatMessageArrayType = z.infer<typeof ChatMessageArraySchema>;
