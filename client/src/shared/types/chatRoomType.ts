import { z } from "zod";

export const ChatRoomSchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(),
});

export const CreateChatRoomRequestSchema = z.object({
  message: z.string(),
  model: z.string(),
});

export const ChatRoomArraySchema = z.array(ChatRoomSchema);

export type ChatRoomType = z.infer<typeof ChatRoomSchema>;
export type CreateChatRoomRequestType = z.infer<typeof CreateChatRoomRequestSchema>;
