import { useCallback, useEffect, useRef } from "react";
import { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import useDebounce from "@/shared/hooks/useDebounce";
import { ChatRoomType } from "@/shared/types/chatRoomType";
import { AxiosInfiniteResponseType } from "@/shared/types/apiType";
import { ChatRoomInfiniteType } from "@/shared/types/chatRoomType";
import { ApiError } from "@/shared/types/apiErrorType";

type UseChatRoomInfiniteScrollPropsType = {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<AxiosInfiniteResponseType<ChatRoomInfiniteType>>, ApiError>>;
  onFetchSuccess: (items: ChatRoomType[]) => void;
};

const useChatRoomInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onFetchSuccess,
}: UseChatRoomInfiniteScrollPropsType) => {
  const { ref, inView } = useInView({ threshold: 0 });
  const pageRequestCountRef = useRef(0);
  const isRequestPendingRef = useRef(false);
  const debounce = useDebounce();

  const fetchMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage || isRequestPendingRef.current) return;

    try {
      isRequestPendingRef.current = true;

      const result = await fetchNextPage();
      if (result.data && result.data.pages) {
        const newPages = result.data.pages;
        const latestPage = newPages[newPages.length - 1];
        if (latestPage?.data?.items && latestPage.data.items.length > 0) {
          onFetchSuccess(latestPage.data.items);
          pageRequestCountRef.current += 1;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Error fetching more chat rooms:", error);
    } finally {
      isRequestPendingRef.current = false;
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, onFetchSuccess]);

  useEffect(() => {
    if (inView && !isRequestPendingRef.current) {
      debounce(() => fetchMore(), 100);
    }
  }, [inView, debounce, fetchMore]);

  return {
    loaderRef: ref,
    isLoading: isFetchingNextPage,
    hasMoreData: hasNextPage,
  };
};

export default useChatRoomInfiniteScroll;
