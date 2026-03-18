# DATE TIME TOOLS SPECIFICATION

## Purpose

This document defines the specification for date and time tools used by the AI agent.

The goal is to provide the LLM with current date, time, and day information without requiring access to system clocks or external time sources.

---

# 1. TIMEZONE

All date and time operations return values in the **system local timezone** of the server where the application is running.

No timezone conversion is performed.

---

# 2. DATE TIME TOOL

The DateTimeTool provides a set of individual tools for retrieving different aspects of current date and time.

### Available Tools

```
getDateTime
getDay
getDate
getTime
```

Each tool is independently callable and requires no parameters.

---

# 3. TOOL DEFINITIONS

## GET DATE TIME

Returns current date and time.

**Tool Name**

```
getDateTime
```

### Parameters

```
None
```

### Response Format

```
{
  date: {
    date: "2025-03-17",
    format: "YYYY-MM-DD"
  },
  time: {
    time: "14:30:45",
    format: "HH:mm:ss"
  }
}
```

### Example

Request:

```
getDateTime()
```

Response:

```
{
  date: {
    date: "2025-03-17",
    format: "YYYY-MM-DD"
  },
  time: {
    time: "14:30:45",
    format: "HH:mm:ss"
  }
}
```

---

## GET DAY

Returns the current day of the week.

**Tool Name**

```
getDay
```

### Parameters

```
None
```

### Response Format

```
{
  day: "Monday"
}
```

### Day Values

The following day values can be returned:

```
Sunday
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
```

### Example

Request:

```
getDay()
```

Response:

```
{
  day: "Wednesday"
}
```

---

## GET DATE

Returns current date.

**Tool Name**

```
getDate
```

### Parameters

```
None
```

### Response Format

```
{
  date: "2025-03-17",
  format: "YYYY-MM-DD"
}
```

### Date Format

The date follows the ISO 8601 format (YYYY-MM-DD).

### Example

Request:

```
getDate()
```

Response:

```
{
  date: "2025-03-17",
  format: "YYYY-MM-DD"
}
```

---

## GET TIME

Returns current time.

**Tool Name**

```
getTime
```

### Parameters

```
None
```

### Response Format

```
{
  time: "14:30:45",
  format: "HH:mm:ss"
}
```

### Time Format

The time follows the 24-hour format (HH:mm:ss).

### Example

Request:

```
getTime()
```

Response:

```
{
  time: "14:30:45",
  format: "HH:mm:ss"
}
```

---

# 4. TOOL EXECUTION FLOW

All tools follow this simple execution pattern:

1. Get current system date/time
2. Format according to tool specification
3. Return structured response

No validation or error handling is required as these tools always succeed.

---

# 5. IMPLEMENTATION NOTES

### Time Source

All tools use JavaScript `Date` object to retrieve system time.

```javascript
const now = new Date();
```

### Date Formatting

Date is formatted as:

```
YYYY-MM-DD
```

Where:

- Year: Full 4-digit year
- Month: Zero-padded month (01-12)
- Day: Zero-padded day (01-31)

### Time Formatting

Time is formatted as:

```
HH:mm:ss
```

Where:

- Hours: 24-hour format (00-23)
- Minutes: Zero-padded minutes (00-59)
- Seconds: Zero-padded seconds (00-59)

### Day Mapping

JavaScript `getDay()` returns values 0-6, which are mapped to:

```
0 → Sunday
1 → Monday
2 → Tuesday
3 → Wednesday
4 → Thursday
5 → Friday
6 → Saturday
```

---

# 6. RESPONSE FORMAT

All tools return structured objects with the following characteristics:

1. **Root object**: Contains the primary data
2. **Format field**: Explicitly states the format used
3. **String values**: All values are strings
4. **No metadata**: No additional metadata is included

### Example Structure

```
{
  [data_field]: "value",
  format: "format_description"
}
```

---

# 7. TOOL ORDERING

When `getAllTools()` is called, tools are returned in the following order:

```
1. getDay
2. getTime
3. getDateTime
4. getDate
```

This ordering prioritizes the most granular tools first.

---

# 8. ERROR HANDLING

No error handling is implemented as these tools:

1. Always succeed (system time is always available)
2. Require no external dependencies
3. Have no side effects

If the JavaScript `Date` object fails to initialize (extremely rare), the behavior is undefined.

---

# 9. FUTURE EXTENSIONS

Possible future extensions:

```
getTimestamp - Unix timestamp in milliseconds
getTimezone - Return timezone name/offset
getDateTimeWithTimezone - Accept timezone parameter
getRelativeTime - Relative time (e.g., "2 hours ago")
```

All future extensions must maintain the same response pattern with explicit format fields.
