import { ChangeEvent } from "react";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";

interface SearchBarPropsType {
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
const SearchBar = ({ placeholder, value, onChange }: SearchBarPropsType) => {
  return (
    <div className="flex items-center border-b-[1px] border-border px-5 py-2">
      <Search className="h-4 w-4 text-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border-0 dark:bg-transparent shadow-none"
      />
    </div>
  );
};

export default SearchBar;
