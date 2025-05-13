import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Dispatch } from "react";

interface SearchbarProps {
  state: string;
  setState: Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ setState, state }: SearchbarProps) => {
  return (
    <div className="flex border-2 border-white rounded-lg px-4 py-2 w-[35em] items-center">
      <Search size={30} />
      <Input
        className={cn(
          `w-full border-none border-0 focus-visible:ring-offset-0 focus-visible:ring-0 mx-1
          placeholder:text-cold-dark placeholder:text-lg text-md dark:bg-transparent`
        )}
        placeholder="Search a topic..."
        value={state}
        onChange={(e) => setState(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
};

export default SearchBar;
