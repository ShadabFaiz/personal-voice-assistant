# Media Analysis Tool

**Tool Name:**
- `media_analysis`

**Description:**
Analyzes local media files including PDFs, Images, Audio, and Video. Required for answering specific questions regarding unstructured files natively sitting on disk. 

**Parameters:**
- `path` (string, required): The absolute path to the local media file.
- `query` (string, required): The specific question or query regarding the media contents.

---

## Examples

### 1. Analyzing a Local Image or PDF
**Example**
```ts
Input:
{
  path: "/media/whatsapp/User/03-08-2026/report.pdf",
  query: "Summarize the findings on page 2"
}

Output:
"Based on the PDF provided, the findings indicate a 25% growth over the last quarter..."
```
