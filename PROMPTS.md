# Prompt Log

This file documents the AI prompts and tools used during the development of the Kulu API Management assignment.

### Entry 001
**Tool:** Antigravity (Claude 3.5 Sonnet)
**Goal:** Generate initial project structure and design system
**Prompt:** "Initialize a new Vite + React + TypeScript project with Tailwind CSS. Create a professional, dark-themed design system using HSL variables for 'slate' and 'indigo' palettes. Ensure the layout is responsive and follows a sidebar-driven dashboard architecture."
**Outcome:** Successfully generated the base architecture with a premium desktop-first layout.

### Entry 002
**Tool:** Antigravity (Claude 3.5 Sonnet)
**Goal:** Implement the "Zero-Plain-Text" API Key management
**Prompt:** "Create a secure API key management page. Implement a system where only the mask (first 4 and last 4 chars) are stored in the client-side state after generation. Use a 'clientMask' scrambler to ensure the full secret never touches the browser's persistent state or network logs after the initial creation."
**Outcome:** Implemented a robust security layer for credential handling.

### Entry 003
**Tool:** GitHub Copilot
**Goal:** Autocomplete snippet-generator edge cases
**Prompt:** `[inline Copilot suggestion accepted as-is]`
**Outcome:** Accepted as-is for cURL array param serialisation in the SandboxPage.

### Entry 004
**Tool:** Antigravity (Claude 3.5 Sonnet)
**Goal:** Integrate CodeMirror 6 for the sandbox body editor
**Prompt:** "Replace the basic textarea in the SandboxPage with a full CodeMirror 6 JSON editor. Include syntax highlighting (One Dark theme), automatic indentation, and a 'Prettify JSON' button."
**Outcome:** Significantly improved the developer experience for API testing.

### Entry 005
**Tool:** Antigravity (Claude 3.5 Sonnet)
**Goal:** Create the Usage Analytics Dashboard using Recharts
**Prompt:** "Build a data-driven Analytics dashboard with three hero cards (Volume, Error Rate, Latency) and a time-series area chart using Recharts. Include a per-endpoint breakdown table with health indicators."
**Outcome:** Delivered a clean, professional visualization of API telemetry.

### Entry 006
**Tool:** Antigravity (Claude 3.5 Sonnet)
**Goal:** Finalize the API Status Page and Changelog
**Prompt:** "Refine the Status and Changelog pages to be minimalist and professional. Remove non-functional elements like RSS buttons and search bars. Use a JSON-driven manifest for the changelog and mock data generators for the 90-day status history."
**Outcome:** Polished the final dashboard pages for a seamless user experience.
