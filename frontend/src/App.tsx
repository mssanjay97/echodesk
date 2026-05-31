import { useState } from 'react'
import './App.css'
import axios from 'axios';

import { getOrSetUserID } from './services/storage';
import { searchHistory } from "./services/api";
import type { QueryResponse as QueryResponseType } from "./types/queryResponse";
import { formatTimestamp } from "./utils/date";

// type Payload = {
//   query: string,
//   userId?: string
// }

// type QueryResponse = {
//   documents: string[],
//   metadata: { url: string }[]
// };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// async function getOrSetUserID(){

//   try {
//     if (chrome.storage) {

//       let resp = await chrome.storage.sync.get(['userId'])
//       let userId = resp.userId;
    
//       if (userId === null || userId === undefined) {
//         userId =  crypto.randomUUID();
//         await chrome.storage.sync.set({userId: userId});
//       } 
//       return userId;

//     } else {
//       let userId = localStorage.getItem('userId');

//       if (!userId) {
//         userId =  crypto.randomUUID();
//         localStorage.setItem('userId', userId);
//       }
//       return userId;
//     }

//   } catch(err) {

//     console.log("Error fetching userID from storage ");
//     throw err;
//   }
  
// }

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [queryResponse, setQueryResponse] = useState<QueryResponseType>({ documents: [], metadata: [] });

  async function handleSearch() {

    try {
      setIsLoading(true);
      setHasSearched(true);

      //let payload: Payload = {query: query};
      let userId: string | undefined = await getOrSetUserID();
      if (userId === null || userId === undefined) {
        setIsError(true);
        setIsLoading(false);
        throw "UserId fetch error"
      }

      //payload = {...payload, userId: userId}
      //let response = await axios.post('${API_BASE_URL}/query', payload);
      //let response = await axios.post(`${API_BASE_URL}/api/v1/queries`, payload);
      let response = await searchHistory(query, userId);
      if(response.status !== 200) {
        setIsError(true);
      } else {
        setQueryResponse(response.data)
        setIsError(false);
      }

      setIsLoading(false);

    } catch(error) {
      console.log("Error in handleSearch ", error);

      setIsError(true);
      setIsLoading(false);

    }

  }

  return (
    <>
      <h1> Search your History based on Semantics</h1>
      <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} />
      <input type="submit" value="Search History" onClick={() => handleSearch()} />
      {isLoading && "Fetching results... Please wait"}
      {isError && "Error fetching results!"}
      {!isLoading && hasSearched && queryResponse.documents.length === 0 && <p>No results found.</p>}
      {!isError && queryResponse &&
      <div className="results">
        <h3>Results:</h3>
        <ul>
          {queryResponse.documents.map((doc: string, idx: number) => <li><a href={queryResponse.metadata[idx]['url']} target="_blank" rel="noopener noreferrer">{queryResponse.metadata[idx]['url']}</a> {formatTimestamp(queryResponse.metadata[idx]['timestamp'])} <br/><br/> {doc} <br/><br/><br/></li>)}
        </ul> 
      </div>      
      }
    </>
  )
}

export default App
