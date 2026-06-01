import type { QueryResponse } from "../types/QueryResponse";

export default function SearchResults({ queryResponse }: { queryResponse: QueryResponse; }) {

    return (
        <div className="results">
            <h3>Results:</h3>
            <ul>
                {queryResponse.documents.map((doc, idx) => (
                    <li key={idx}>
                        <a href = {queryResponse.metadata[idx].url} target="_blank" rel = "noopener noreferrer"> {queryResponse.metadata[idx].url} </a>
                        <br /><br /> {doc} <br /><br />
                    </li>
                ))}
            </ul>
        </div>
    );
}