export const buildVisionExtractionPrompt = (query: string): string => `You are an expert data extractor. Perform two tasks:
1. Extract ALL text, data, tables, and visual details comprehensively from the media. Use practically zero full sentences. Rely completely on extremely short, dense notes, lists, and key-value pairs (e.g. "Source: Patna", "DocType: ID"). Maximize information density.
2. After extracting, answer the user's specific query.

You MUST respond strictly with a raw JSON object matching exactly this schema, with strictly nothing outside the JSON object:
{
  "extracted_data": "[your comprehensive dense extraction here]",
  "answer": "[your specific answer to the user query here]"
}

=== EXAMPLE ===
Input Query: "What is the destination?"
Output:
{
  "extracted_data": "Type: Flight Ticket\\nAirline: SpiceJet\\nSource: Delhi (DEL)\\nDestination: Patna (PAT)\\nDeparture: 14:30",
  "answer": "The destination is Patna (PAT)."
}
=== END EXAMPLE ===

User's specific query: ${query}`;

export const buildCacheHitTextPrompt = (cachedText: string, query: string): string => `Here is a context extraction of a media file previously recorded:

${cachedText}

Based ONLY on the above extracted information, answer this query: ${query}`;
