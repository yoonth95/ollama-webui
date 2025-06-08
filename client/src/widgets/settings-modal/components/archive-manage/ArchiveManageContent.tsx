import ArchiveItem from "./ArchiveItem";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const ArchiveManageContent = () => {
  return (
    <Table containerClassName="themed-scrollbar max-h-[25rem] pr-2">
      <TableHeader>
        <TableRow className="bg-background sticky top-0 z-10 text-base font-extrabold dark:bg-neutral-800">
          <TableHead className="w-[60%]">채팅방</TableHead>
          <TableHead className="w-[32%]">생성일자</TableHead>
          <TableHead className="w-[8%]"></TableHead>
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
