# FILE TOOLS SPECIFICATION

## Purpose

This document defines the specification for the file system tools used by the AI agent.

The goal is to allow the LLM to safely read and manipulate files while preventing access to the host operating system.

---

# 1. WORKSPACE DIRECTORY

All file operations must occur inside a restricted directory called the **agent workspace**.

**Workspace name**

```
agent_workspace
```

### Example project structure

```
mainServer/
   src/
   systemPrompts/
   recordings/
   agent_workspace/
      notes/
      data/
      drafts/
      temp/
```

The LLM is **NOT aware of the real workspace path**.

For the LLM, the root directory appears as:

```
/
```

### Path Mapping Example

| LLM Path        | Actual Path                    |
| --------------- | ------------------------------ |
| /notes/todo.md  | agent_workspace/notes/todo.md  |
| /data/users.csv | agent_workspace/data/users.csv |
| /drafts/post.md | agent_workspace/drafts/post.md |

---

When the File Tool is initialised, it checks for the existence of directory:`agent_workspace`.
If it does not exists, then FileTool will automatically generate it.

# 2. ALLOWED FILE TYPES

The following file types are allowed:

```
.txt
.md
.csv
.json
.html
.js
```

Any other extension must be rejected.

Files **without extensions are rejected**.

### Examples of invalid file names

```
/notes/todo
/data/users
/report
```

---

# 3. PATH RULES

All paths provided by the LLM must follow these rules.

### Allowed Examples

```
/file.txt
/notes/todo.md
/data/users.csv
/folder1/folder2/file.json
```

### Not Allowed Examples

```
../file.txt
./file.txt
~/file.txt
folder/file.txt
/../../etc/passwd
```

### Requirements

1. Path MUST start with "/"
2. Paths MUST be canonicalized before validation
3. Path MUST NOT resolve outside the workspace
4. Path traversal sequences must be rejected
5. Hidden files or directories are not allowed

### Canonicalization Requirement

Before validation, paths must be normalized and canonicalized to ensure they resolve strictly inside the workspace root.

Examples of invalid paths:

```
/notes/../secret/file.txt
/notes/./file.txt
/notes/.../file.txt
```

---

# 4. SECURITY RESTRICTIONS

The file system must enforce:

- No access outside agent_workspace
- Directory traversal must be blocked
- Only allowed extensions can be created
- Hidden files must be rejected
- Symbolic links must not be followed

### Hidden File Rule

Files or directories starting with "." are considered hidden and are rejected.

Examples:

Invalid:

```
/secret.txt
/.config/settings.json
/notes/.draft.md
```

---

# 5. FILE ENCODING

All files are stored and returned as **UTF-8 text**.

Binary files are not supported.

---

# 6. FILE SIZE LIMITS

Maximum file size allowed in the workspace:

```
200 KB
```

Files are always returned **in full** when using the read operation.

No length limit is applied to file reads.

Search operations return only **short snippets** of matched content.

---

# 7. DIRECTORY BEHAVIOR

Directories are created automatically for the following operations:

```
create
copy
move
```

If a file is created in a directory that does not exist, the system must automatically create the directory.

Example:

```
/notes/ideas/todo.md
```

Equivalent system behavior:

```
mkdir -p
```

For the following operations the directory **must already exist**:

```
read
update
delete
list
```

---

# 8. FILE TOOL

Only one tool is exposed to the LLM.

**Tool Name**

```
file_tool
```

### Parameters

```
operation (required)

path (required except for search operations scanning root)

content (required for create and update)

destination (required for copy and move)

new_name (required for rename)

query (required for search)

search_type (required for search)
```

Optional parameters may be omitted when not relevant to the selected operation.

### Supported Operations

```
create
read
update
delete
list
search
copy
move
rename
```

---

# 9. OPERATION EXECUTION FLOW

Every operation must follow this sequence:

1. Validate input parameters
2. Canonicalize and validate paths
3. Validate operation constraints
4. Execute filesystem action
5. Return structured response as tuple

```
[error, data]
```

---

# 10. OPERATION DEFINITIONS

## CREATE

Creates a new file.

Validation rules:

- File MUST NOT already exist
- Extension must be allowed

Example:

```
operation: create
path: /notes/todo.md
content: Buy milk
```

### Success Response

```
[null, {
  status: "success",
  operation: "create",
  path: "/notes/todo.md"
}]
```

### Failure Response

```
[{ message: "File already exists at /notes/todo.md" }, null]
```

---

## READ

Reads file contents.

Validation rules:

- File MUST exist

Example:

```
operation: read
path: /notes/todo.md
```

### Success Response

```
[null, {
  status: "success",
  operation: "read",
  path: "/notes/todo.md",
  content: "Buy milk"
}]
```

### Failure Response

```
[{ message: "File does not exist at /notes/todo.md" }, null]
```

---

## UPDATE

Replaces contents of an existing file.

Validation rules:

- File MUST exist
- File must NOT be created automatically

Example:

```
operation: update
path: /notes/todo.md
content: Buy milk and eggs
```

### Success Response

```
[null, {
  status: "success",
  operation: "update",
  path: "/notes/todo.md"
}]
```

---

## DELETE

Deletes a file.

Validation rules:

- File MUST exist
- Directories cannot be deleted

Example:

```
operation: delete
path: /notes/todo.md
```

### Success Response

```
[null, {
  status: "success",
  operation: "delete",
  path: "/notes/todo.md"
}]
```

---

## LIST

Lists files and directories inside a directory.

Validation rules:

- Path MUST reference a directory
- Path MUST end with "/"
- Path MUST exist

Examples:

Valid:

```
operation: list
path: /diary/54/
```

Invalid:

```
operation: list
path: /diary/54/anb.md
```

### Success Response

```
[null, {
  status: "success",
  operation: "list",
  paths: [
    "/diary/54/anb.md",
    "/diary/54/notes.md",
    "/diary/54/archive/"
  ]
}]
```

Directories must end with "/".

---

# 11. SEARCH

Searches files inside the workspace.

### Parameters

```
operation: search
path
query
search_type
```

### Search Types

```
content
name
path
```

---

## CONTENT SEARCH

Search inside file contents. (Note: Currently not implemented)

Supported file types:

```
.txt
.md
```

Example:

```
operation: search
path: /
query: LangGraph
search_type: content
```

### Success Response

```
[null, {
  status: "success",
  operation: "search",
  results: [
    {
      path: "/notes/langgraph.md",
      line: 42,
      snippet: "LangGraph allows building structured LLM workflows"
    },
    ...
  ]
}]
```

---

## NAME SEARCH

### Success Response

```
[null, {
  status: "success",
  operation: "search",
  results: [
    { path: "/docs/roadmap.md" },
    { path: "/docs/project-roadmap.md" }
  ]
}]
```

---

## PATH SEARCH

### Success Response

```
[null, {
  status: "success",
  operation: "search",
  results: [
    { path: "/notes/" },
    { path: "/notes/archive/" }
  ]
}]
```

### Search Limits

```
Maximum files scanned: 200
Maximum results returned: 20
```

Results should be ordered by relevance.  
If relevance cannot be determined, order by path.

---

# 12. COPY

Copies a file.

Validation rules:

- Source file MUST exist
- Destination MUST NOT exist
- Destination must be a full file path

Example:

```
operation: copy
path: /notes/todo.md
destination: /notes/todo_backup.md
```

### Success Response

```
[null, {
  status: "success",
  operation: "copy",
  path: "/notes/todo_backup.md"
}]
```

---

# 13. MOVE

Moves a file.

Validation rules:

- Source file MUST exist
- Destination MUST NOT exist
- Destination must be a full file path

Example:

```
operation: move
path: /notes/todo.md
destination: /archive/todo.md
```

### Success Response

```
[null, {
  status: "success",
  operation: "move",
  path: "/archive/todo.md"
}]
```

---

## 14. RENAME

Renames a file within its current directory.

Validation rules:

- Source file MUST exist
- Destination MUST NOT exist
- New name MUST NOT contain path separators
- Destination must be a valid file name with allowed extension

Example:

```
operation: rename
path: /notes/todo.md
new_name: tasks.md
```

### Success Response

```
[null, {
  status: "success",
  operation: "rename",
  path: "/notes/tasks.md"
}]
```

---

# 15. RESPONSE FORMAT

All file paths returned by the tool must be **absolute paths relative to the LLM root**.

Example:

```
/notes/todo.md
/data/users.csv
```

Never return:

```
todo.md
./todo.md
agent_workspace/notes/todo.md
```

---

# 16. ERROR HANDLING

All operations MUST return errors using the tuple format:

```
[ { message: string }, null ]
```

### Examples

```
[{ message: "File does not exist at /notes/todo.md." }, null]

[{ message: "File already exists at /notes/todo.md. Use operation 'update' instead." }, null]

[{ message: "Path resolves outside workspace." }, null]

[{ message: "Access outside workspace denied." }, null]
```

---

# 17. FUTURE EXTENSIONS

Possible future operations:

```
append
file_metadata
directory_tree
batch_operations
```

All future operations must follow the same security rules and the same response pattern:

```
[error, data]
```
