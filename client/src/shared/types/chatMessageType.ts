import { z } from "zod";

export const ChatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  model: z.string(),
  content: z.string(),
  images: z.array(z.string()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ChatMessageArraySchema = z.array(ChatMessageSchema);

export type ChatMessageType = z.infer<typeof ChatMessageSchema>;
export type ChatMessageArrayType = z.infer<typeof ChatMessageArraySchema>;
