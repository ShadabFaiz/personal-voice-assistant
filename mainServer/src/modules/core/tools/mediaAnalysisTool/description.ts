export const toolDescription = `Analyzes local media files including PDFs, Images, Audio, and Video.
Use this tool absolutely ANY time the user uploads an image, a PDF document, or other media, or asks a question about a media file on disk. Do NOT use read_file for PDFs/Images/Media.
However, you MUST use the read_file (fileTool) tool for reading any .txt, .json, .md, or similar simple text files.
Requires absolute file path to the local media and a specific, detailed query about what you want to extract or understand from it.

Example Usage:
Input: { path: "/media/whatsapp/User/03-08-2026/report.pdf", query: "Summarize the findings on page 2" }
Output: "Based on the PDF provided, the findings indicate a 25% growth..."
`;
