import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import ArchiveItem from "./ArchiveItem";

const ArchiveManageContent = () => {
  return (
    <Table containerClassName="themed-scrollbar max-h-[25rem]">
      <TableHeader className="">
        <TableRow className="text-base font-extrabold">
          <TableHead className="bg-background sticky top-0 z-10 w-[60%] dark:bg-neutral-800">채팅방</TableHead>
          <TableHead className="bg-background sticky top-0 z-10 w-[32%] dark:bg-neutral-800">생성일자</TableHead>
          <TableHead className="bg-background sticky top-0 z-10 w-[8%] dark:bg-neutral-800"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
        <ArchiveItem />
      </TableBody>
    </Table>
  );
};

export default ArchiveManageContent;
