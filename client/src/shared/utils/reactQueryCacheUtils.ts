import { QueryClient, QueryKey, InfiniteData } from "@tanstack/react-query";

/**
 * 무한 스크롤 캐시에서 특정 아이템을 제거하는 헬퍼
 * @param queryClient React Query QueryClient 인스턴스
 * @param queryKey    대상 캐시 키 (useInfiniteQuery)
 * @param itemId      제거할 아이템 식별자
 * @param idKey       아이템 객체 내 id 필드명 (기본 "id")
 */
export function removeItemFromInfiniteCache<T extends Record<string, unknown> & { [key in K]: string | number }, K extends keyof T = "id" & keyof T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  itemId: string | number,
  idKey?: K,
): void {
  const key = (idKey || ("id" as K));
  queryClient.setQueryData(queryKey, (oldData: unknown) => {
    if (!oldData || typeof oldData !== "object" || !("pages" in oldData)) return oldData;

    const typedData = oldData as InfiniteData<{ data: { items: T[] } }, number>;

    return {
      ...typedData,
      pages: typedData.pages.map((page) => ({
        ...page,
        data: {
          ...page.data,
          items: page.data.items.filter((item) => item[key] !== itemId),
        },
      })),
    };
  });
}
