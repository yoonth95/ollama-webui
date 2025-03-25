import { z } from "zod";

export const ChatRoomSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
});

export const CreateChatRoomRequestSchema = z.object({
  message: z.string(),
  model: z.string(),
});

export const ChatRoomArraySchema = z.array(ChatRoomSchema);

export const UpdateChatRoomTitleRequestSchema = z.object({
  roomId: z.string(),
  newTitle: z.string(),
});

export type ChatRoomType = z.infer<typeof ChatRoomSchema>;
export type CreateChatRoomRequestType = z.infer<typeof CreateChatRoomRequestSchema>;
export type UpdateChatRoomTitleRequestType = z.infer<typeof UpdateChatRoomTitleRequestSchema>;
