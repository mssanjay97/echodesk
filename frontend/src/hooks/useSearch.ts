import { useState } from "react";
import { searchHistory } from "../services/searchHistory";
import { getOrSetUserID } from "../services/storage";
import type { QueryResponse } from "../types/QueryResponse";

export function useSearch() {

    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [queryResponse, setQueryResponse] = useState<QueryResponse>({ documents: [], metadata: [] });

    async function handleSearch() {

        try {

            setHasSearched(true);
            setIsLoading(true);
            const userId = await getOrSetUserID();
            const response = await searchHistory(query, userId);
            setQueryResponse(response.data);
            setIsError(false);

        } catch (error) {

            console.log(error);
            setIsError(true);

        } finally {
            setIsLoading(false);
        }
    }

    return { query, setQuery, queryResponse, isLoading, isError, hasSearched, handleSearch };
}