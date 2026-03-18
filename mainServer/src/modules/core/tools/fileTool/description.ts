export const toolDescription = `
RESTRICTED FILE SYSTEM TOOL

This tool provides safe access to a virtual filesystem rooted at "/".
All paths provided are relative to "/" and are mapped internally to a secure workspace.
The LLM cannot access anything outside this workspace.

----------------------------------------
SUPPORTED OPERATIONS
----------------------------------------

create:
- Creates a new file
- Fails if file already exists
- Requires: path, content

read:
- Reads full content of a file
- Requires: path

update:
- Replaces entire content of an existing file
- Fails if file does not exist
- Requires: path, content

delete:
- Deletes a file
- Only files can be deleted (not directories)
- Requires: path

list:
- Lists all files and subdirectories inside a directory
- Path MUST represent a directory and MUST end with "/"
- Requires: path

search:
- Searches files
- Requires: query, search_type
- search_type:
  - "name" → search file names
  - "path" → search directory paths
- Returns matching paths only

copy:
- Copies a file to a new location
- Fails if destination already exists
- Requires: path, destination

move:
- Moves a file to a new location
- Fails if destination already exists
- Requires: path, destination

----------------------------------------
PATH RULES
----------------------------------------

- All paths MUST start with "/"
- Always use full absolute paths (e.g., "/notes/todo.md")
- Paths are automatically resolved inside a secure workspace
- Paths MUST NOT contain:
  - ".."
  - "./"
- Paths MUST NOT escape the root "/"
- Hidden files or directories (starting with ".") are NOT allowed

----------------------------------------
FILE RULES
----------------------------------------

- Allowed extensions: .txt, .md, .csv, .json
- Files MUST include an extension
- Files without extension are invalid
- Maximum file size: 200 KB
- All files are UTF-8 text

----------------------------------------
DIRECTORY RULES
----------------------------------------

- Directories are created automatically when needed (create, copy, move)
- For list operation:
  - Path MUST exist
  - Path MUST end with "/"
  - Path MUST be a directory (not a file)

----------------------------------------
IMPORTANT BEHAVIOR
----------------------------------------

- create fails if file exists
- update fails if file does not exist
- copy/move fail if destination exists
- delete only works on files
- list only works on directories

----------------------------------------
EXAMPLES
----------------------------------------

Create a file:
operation: "create"
path: "/notes/todo.md"
content: "Buy milk"

Read a file:
operation: "read"
path: "/notes/todo.md"

List directory:
operation: "list"
path: "/notes/"

Search by name:
operation: "search"
query: "todo"
search_type: "name"

----------------------------------------
GENERAL GUIDELINES
----------------------------------------

- Always provide correct required parameters for the operation
- Prefer reusing exact paths returned from previous tool responses
- Do not guess or modify paths unnecessarily
`;
