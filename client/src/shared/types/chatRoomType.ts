import { z } from "zod";

export const ChatRoomSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
});
export const ChatRoomArraySchema = z.array(ChatRoomSchema);

export const CreateChatRoomRequestSchema = z.object({
  content: z.string(),
  model: z.string(),
  images: z.array(z.string()).optional(),
});

export const UpdateChatRoomTitleRequestSchema = z.object({
  roomId: z.string(),
  newTitle: z.string(),
});

export const ChatRoomInfiniteSchema = z.object({
  items: z.array(ChatRoomSchema),
  meta: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    totalItems: z.number(),
  }),
});

export type ChatRoomType = z.infer<typeof ChatRoomSchema>;
export type CreateChatRoomRequestType = z.infer<typeof CreateChatRoomRequestSchema>;
export type UpdateChatRoomTitleRequestType = z.infer<typeof UpdateChatRoomTitleRequestSchema>;
export type ChatRoomInfiniteType = z.infer<typeof ChatRoomInfiniteSchema>;
