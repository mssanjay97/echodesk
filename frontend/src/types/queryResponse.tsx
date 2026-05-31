export default type QueryResponse = {
  documents: string[],
  metadata: { url: string;
    timestamp: string; }[]
};