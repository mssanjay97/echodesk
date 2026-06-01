import "./App.css";

import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";

import { useSearch } from "./hooks/useSearch";

function App() {

    const { query, setQuery, queryResponse, isLoading, isError, hasSearched, handleSearch } = useSearch();

    return (
        <>
            <h1>Search your History based on Semantics</h1>
            <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} />
            {isLoading && "Fetching results..." }
            {isError && "Error fetching results!" }
            {hasSearched && !isLoading && !isError && queryResponse.documents.length === 0 && "No results found." }
            {queryResponse.documents.length > 0 && <SearchResults queryResponse={queryResponse} /> }
        </>
    );
}

export default App;