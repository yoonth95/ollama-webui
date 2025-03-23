import { z } from "zod";

export const ModelInfoSchema = z.object({
  model: z.string(),
  size: z.string(),
  parameterSize: z.string(),
});

export const ModelInfoArraySchema = z.array(ModelInfoSchema);

export const ModelErrorSchema = z.object({
  status: z.number(),
  message: z.string(),
});

export const GetModelResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  data: ModelInfoArraySchema,
});

export type ModelInfoType = z.infer<typeof ModelInfoSchema>;
export type ModelErrorType = z.infer<typeof ModelErrorSchema>;
export type GetModelResponseType = z.infer<typeof GetModelResponseSchema>;
