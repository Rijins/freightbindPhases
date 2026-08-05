import { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Input from "./Input";

/**
 * Search field with a leading magnifier and an inline clear button. Fully
 * controlled; debouncing is left to the caller (see useDebounce / SearchBar).
 */
const SearchInput = ({
  value = "",
  onChange,
  name,
  label,
  placeholder = "Search...",
  className = "",
  ...rest
}) => {
  const [term, setTerm] = useState(value);

  useEffect(() => {
    setTerm(value);
  }, [value]);

  const handleChange = (event) => {
    setTerm(event.target.value);
    onChange?.(event.target.value);
  };

  const handleClear = () => {
    setTerm("");
    onChange?.("");
  };

  return (
    <Input
      name={name}
      label={label}
      value={term}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      icon={FiSearch}
      trailing={
        term ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <FiX size={14} />
          </button>
        ) : undefined
      }
      {...rest}
    />
  );
};

export default SearchInput;