import type { QueryResponse as QueryResponseType } from "./types/queryResponse";

type Props = {
    queryResponse: QueryResponse;
};

export default function SearchResults({ QueryResponseType }: Props) {
    return (
        <div className="results">
            <h3>Results:</h3>

            <ul>
                {queryResponse.documents.map((doc, idx) => (
                    <li key={idx} style={{ marginBottom: "16px" }}>
                        <a
                            href={queryResponse.metadata[idx].url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {queryResponse.metadata[idx].url}
                        </a>

                        <br />
                        <br />

                        <div>{doc}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}