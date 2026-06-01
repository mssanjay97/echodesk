import type { SearchBarProps } from "../types/SearchBar";

export default function SearchBar({ query, setQuery, onSearch}: SearchBarProps) {
    return (
        <>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
            <input type="submit" value="Search History" onClick={onSearch} />
        </>
    );
}