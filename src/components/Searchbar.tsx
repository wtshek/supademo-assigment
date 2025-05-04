import { useState, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { debounce } from "@/utils/utils";

interface SearchbarProps {
  onSearch: (value: string) => void;
  className?: string;
}

export const SEARCH_DEBOUNCE_DELAY = 400;

const Searchbar: React.FC<SearchbarProps> = ({ onSearch, className }) => {
  const [value, setValue] = useState<string>("");

  // Debounced search handler
  const debouncedSearch = useRef(
    debounce((val: unknown) => {
      onSearch((val as string).trim());
    }, SEARCH_DEBOUNCE_DELAY)
  ).current;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex rounded-lg overflow-hidden h-10 shadow border-[1px] border-solid border-zinc-50 ${className}`}
    >
      <input
        type="text"
        className="flex-1 bg-transparent placeholder-zinc-400 px-8 outline-none"
        placeholder="Search"
        value={value}
        onChange={handleChange}
        aria-label="Search"
      />
      <button
        type="submit"
        className="flex items-center justify-center w-20 h-full hover:cursor-pointer transition-colors"
        aria-label="Search"
      >
        <FaSearch />
      </button>
    </form>
  );
};

export default Searchbar;
