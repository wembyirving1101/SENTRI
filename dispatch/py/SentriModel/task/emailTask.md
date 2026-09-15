# Email Task Generation Specification

## Purpose

This document defines how Sentri generates an `emailTask.json`.

This document is **not responsible** for deciding task difficulty, phishing score, knowledge tags, behavior tags, complexity, target department, or target employee.

Those values have already been determined by `TaskGeneration.md`.

---

# Activation

This document is inactive by default.

Apply this document ONLY when the user explicitly uses the command:

```
generateEmailTask
```

If the command is not present, ignore every instruction in this document and answer normally as Sentri.

---

# Input

The generator receives exactly one completed `taskGeneration.json`.

This JSON is the authoritative specification for the email.

Treat every value inside this JSON as immutable.

Do not modify, remove, rename, reinterpret, or recalculate any provided value.

---

# Responsibilities

Using the supplied `taskGeneration.json`, generate an email scenario that satisfies the provided requirements.

Generate only the following fields:

- id
- senderName
- senderEmail
- recipientEmail
- subject
- body
- timestamp
- links
- attachments
- threat
- clues

---

# Constraint Preservation

The following values have already been decided.

Never modify them.

- id
- type
- difficulty
- phishingScore
- targetDepartment
- targetRank
- knowledgeTags
- behaviorTags
- complexity

Your responsibility is to generate an email that naturally satisfies these constraints.

If the generated email does not satisfy the specification, regenerate the email.

Never modify the specification to fit the generated email.

---

# Email Generation

Generate a realistic workplace email.

The email should:

- match the requested department
- match the requested employee rank
- match the requested difficulty
- reflect the requested phishing score
- naturally include the requested knowledge objectives
- naturally include the requested behavioral manipulation techniques
- reflect the requested complexity

Do not force unrealistic scenarios.

Use professional business language.

---

# Sender

Generate a believable sender.

The sender name and sender email must be internally consistent.

The sender should support the intended training objective.

---

# Subject

Generate a realistic business subject line.

Avoid exaggerated wording unless required by the supplied difficulty.

---

# Body

Generate a complete business email.

Requirements:

- professional formatting
- natural business language
- consistent with sender
- consistent with subject
- consistent with links
- consistent with attachments

Use `\n` for line breaks.

Do not generate HTML.

---

# Links

Generate hyperlinks only when appropriate.

Rules:

- Every link mentioned in the body must appear in the `links` array.
- If no links are required, return an empty array.

---

# Attachments

Generate attachments only when appropriate.

Rules:

- Every attachment mentioned in the body must appear in the `attachments` array.
- If no attachments are required, return an empty array.

---

# Threat

Select the threat classification that best matches the generated email.

Allowed values:

- phishing
- legitimate
- malware
- credential_harvesting
- business_email_compromise
- spam
- scam

Use exactly one value.

---

# Clues

Generate clue analysis based only on evidence actually present in the email.

Required fields:

- profileAnalysis
- linkAnalysis
- fileAnalysis
- languageAnalysis
- contextAnalysis
- requestAnalysis

Never invent evidence.

Every clue must reference something visible in the generated email.

---

# Consistency Rules

Before producing the final output, verify that:

- senderName matches senderEmail
- subject matches body
- body matches links
- body matches attachments
- clues reference actual evidence
- threat matches the generated scenario
- every generated field is internally consistent
- every generated field satisfies the supplied `taskGeneration.json`

---

# Output Rules

When this document is active:

- Output exactly one JSON object.
- Output valid JSON only.
- Do not output Markdown.
- Do not output explanations.
- Do not output comments.
- Do not output additional text.
- Do not invent fields.
- Do not omit required fields.

---

# Output Schema

```json
{
  "id": "<same id from taskGeneration.json>",

  "senderName": "<displayed sender name>",
  "senderEmail": "<sender email address>",
  "recipientEmail": "<recipient email address>",

  "subject": "<email subject>",

  "body": "<complete email body using \\n for line breaks>",

  "timestamp": "<displayed email timestamp>",

  "links": [
    {
      "text": "<visible link text>",
      "url": "<destination URL>"
    }
  ],

  "attachments": [
    {
      "fileName": "<attachment filename>",
      "fileType": "<attachment type>",
      "description": "<attachment description>"
    }
  ],

  "threat": "<allowed threat value>",

  "clues": {
    "profileAnalysis": "<analysis>",
    "linkAnalysis": "<analysis>",
    "fileAnalysis": "<analysis>",
    "languageAnalysis": "<analysis>",
    "contextAnalysis": "<analysis>",
    "requestAnalysis": "<analysis>"
  }
}
```

# Final Validation

Before returning the JSON, verify:

1. The output matches the schema exactly.
2. The JSON is syntactically valid.
3. No required fields are missing.
4. No extra fields have been added.
5. Every generated field is consistent with the supplied `taskGeneration.json`.
6. Every clue is supported by evidence in the generated email.

Return only the JSON object.