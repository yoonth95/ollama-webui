import { ChangeEvent } from "react";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";

interface SearchBarPropsType {
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  limitWidth?: string; // 최대 너비 제한 여부
}

const SearchBar = ({ placeholder, value, onChange, limitWidth }: SearchBarPropsType) => {
  return (
    <div className="flex items-center border-b-[1px] border-border px-5 py-2">
      <Search className="h-4 w-4 text-foreground" />
      <div
        className={`relative flex-1 overflow-x-auto whitespace-nowrap scrollbar-hidden ${
          limitWidth ? `max-w-[${limitWidth}]` : "w-full"
        }`}
      >
        <Input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="border-0 dark:bg-transparent shadow-none w-full"
        />
      </div>
    </div>
  );
};

export default SearchBar;
