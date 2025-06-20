import { ArchiveItem, ArchiveLoader } from "./index";
import { useGetArchiveChatRooms } from "@/widgets/settings-modal/queries/useGetArchiveChatRooms";
import { useChatRoomInfiniteScroll } from "@/widgets/layout/sidebar/hooks";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import Loader from "@/shared/ui/loader";

const ArchiveManageContent = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetArchiveChatRooms();

  const {
    loaderRef,
    hasMoreData,
    isLoading: isLoadingMore,
  } = useChatRoomInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    onFetchSuccess: () => {},
  });

  if (isLoading) return <Loader size="md" />;

  return data?.length === 0 ? (
    <div className="flex min-h-[20rem] items-center justify-center">보관된 채팅방이 없습니다.</div>
  ) : (
    <Table containerClassName="themed-scrollbar min-h-[20rem] max-h-[25rem] pr-2">
      <TableHeader>
        <TableRow className="bg-background sticky top-0 z-10 text-base font-extrabold dark:bg-neutral-800">
          <TableHead className="w-[60%]">채팅방</TableHead>
          <TableHead className="w-[32%]">생성일자</TableHead>
          <TableHead className="w-[8%]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => <ArchiveItem key={item.id} item={item} />)}
        {(hasMoreData || isLoadingMore) && <ArchiveLoader loaderRef={loaderRef} />}
      </TableBody>
    </Table>
  );
};

export default ArchiveManageContent;
