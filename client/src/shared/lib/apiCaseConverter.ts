import { z, ZodEffects } from "zod";
import snakecaseKeys from "snakecase-keys";
import camelcaseKeys, { CamelCaseKeys, Options } from "camelcase-keys";

// snake_case → camelCase 변환 (응답 처리용)
export const withCamelCase = <T extends z.ZodTypeAny>(schema: T, options: Options = { deep: true }) => {
  return z.preprocess((props: z.infer<T>) => camelcaseKeys(props, options), schema) as ZodEffects<
    T,
    CamelCaseKeys<z.infer<T>>
  >;
};

// 응답을 받을 때 snake_case로 오는 경우 data를 응답받아 parse 하기전에 camel_case로 변환
export const ApiResponse = <T>(dataSchema: z.ZodType<T>, data: unknown) => {
  const fullSchema = z.object({
    ok: z.boolean(),
    message: z.string(),
    data: withCamelCase(dataSchema).nullable(),
  });

  try {
    return fullSchema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(err.issues);
    }
  }
};

// 요청을 보낼 때 snake_case 변환 (주로 body 검증 schema에 사용)
export const ApiRequestBody = <T extends z.ZodTypeAny, D>(dataSchema: T, data: D, safe: boolean | undefined = true) => {
  try {
    if (safe) {
      return dataSchema.transform((data) => snakecaseKeys(data, { deep: true })).safeParse(data);
    }
    return dataSchema.transform((data) => snakecaseKeys(data, { deep: true })).parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(err.issues);
    }
  }
};
