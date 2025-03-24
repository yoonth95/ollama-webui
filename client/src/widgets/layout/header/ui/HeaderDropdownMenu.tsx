import { useState } from "react";
import { SearchBar } from "@/shared/components";
import { AddModelButton, InstalledModels, DownloadableModels } from "@/widgets/layout/header/ui";

const HeaderDropdownMenu = () => {
  const [inputValue, setInputValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <>
      <SearchBar placeholder="모델 검색" value={inputValue} onChange={handleSearchChange} />
      <div className="my-2 px-3">
        {inputValue ? (
          <AddModelButton inputValue={inputValue} setInputValue={setInputValue} />
        ) : (
          <div className="grid gap-3">
            <InstalledModels />
            <DownloadableModels />
          </div>
        )}
      </div>
    </>
  );
};

export default HeaderDropdownMenu;
