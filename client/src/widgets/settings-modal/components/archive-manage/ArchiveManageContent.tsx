import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import ArchiveItem from "./ArchiveItem";

const ArchiveManageContent = () => {
  return (
    <div className="themed-scrollbar relative h-[25rem] max-h-[25rem]">
      <Table>
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="font-bold">
            <TableHead className="w-[60%] text-base font-extrabold">채팅방</TableHead>
            <TableHead className="w-[32%] text-base font-extrabold">생성일자</TableHead>
            <TableHead className="w-[8%] font-extrabold"></TableHead>
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
        </TableBody>
      </Table>
    </div>
  );
};

export default ArchiveManageContent;
