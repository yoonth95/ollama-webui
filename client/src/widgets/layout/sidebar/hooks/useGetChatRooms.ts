import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatRooms } from "@/widgets/layout/sidebar/apis";

const useGetChatRooms = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["chatRooms"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getChatRooms({ page: pageParam, limit: 20 });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
  });

  const flatData = data?.pages.flatMap((page) => (Array.isArray(page) ? page : []));

  return {
    data: flatData || [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetChatRooms;
