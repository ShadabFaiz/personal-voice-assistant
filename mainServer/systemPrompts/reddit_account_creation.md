# Autonomous Reddit Account Registration: Comprehensive LLM Guide

This document outlines the strict execution pipeline an LLM agent must orchestrate to autonomously create a Reddit account without human intervention. The process employs Playwright coupled with `temp-mail.io` for dynamic OTP extraction.
NOTE: Do not deviate from these step. You have to follow these steps strictly only.

## CRITICAL ENVIRONMENTAL ARCHITECTURE

When initializing Playwright, the script MUST launch using native Google Chrome infrastructure (`channel: "chrome"`) instead of the bundled Chromium binaries.

- **Reasoning**: Corporate internet proxies (e.g., Zscaler) will block `temp-mail.io` and explicitly flag vanilla Chromium network packets as "Malicious Content" due to missing system-level Root Certificates. Native Chrome natively inherits the OS keychain and securely bypasses the shadow-ban.

## GLOBAL EXECUTION STRATEGY (CRITICAL)

1. **Continuous Visual Telemetry**: The agent MUST take a DOM snapshot or screenshot _immediately after every single click, navigation, or form submission_.
2. **Success Validation**: Use these screenshots to actively verify if the expected UI state successfully rendered (e.g., checking if the page actually transitioned rather than trusting Playwright's network promise).
3. **Autonomous Resolution**: If an action fails (e.g., locator timeout, unexpected UI popup, or error toast), the agent must halt the primary flow, study the screenshot, and attempt to dynamically resolve the blocker autonomously.
4. **Human Fallback Rule**: If the obstacle cannot be overcome autonomously (e.g., hard CAPTCHA block, IP ban, or complex anti-bot walls), the agent MUST immediately pause execution, freeze the browser, and explicitly prompt the user for manual STDIN intervention.

---

## 1. TEMPORARY EMAIL GENERATION (Dual-Platform Fallback)

**CRITICAL TOOL CONSTRAINT**: Under absolutely no circumstances should you invoke the internal `tempMailtool` backend API wrapper to generate this email for Reddit. You MUST procure the temporary email strictly by executing the `browserAutomationTool` and scanning the website DOM dynamically!

1. **Platform Priority**: We utilize two temporary email platforms. `https://temp-mail.io/en` is the **PRIMARY** preferred target. If the OTP generation fails in step 3 (e.g. Reddit blocks the domain or the inbox isn't receiving payload), fallback and restart the process using the **SECONDARY** platform: `https://temp-mail.org/en/`.
2. **Initialize Context**: Open an incognito Playwright browser (`headless: false` during testing, `true` for prod) with HTTP error ignoring enabled. Navigate natively to `https://temp-mail.io/en` (or the fallback `temp-mail.org`).
3. **DOM Target**: Target the element `input#email` to extract the generated email payload.
4. **Hydration Syncing Lock (CRUCIAL)**: Do NOT instantly grab `.inputValue()` as soon as the DOM resolves! `temp-mail.io` utilizes asynchronous Single Page Application (SPA) hydration. Use an explicit `waitForFunction` polling block to evaluate that the input object physically contains an `@` symbol before extraction (Timeout: 45000ms).
5. **Store Payload**: Hold the dynamic `.inputValue()` in a globally accessible runtime variable for the Reddit engine to utilize.

## 2. REDDIT FORM INITIATION

1. **Target**: Navigate to `https://www.reddit.com/register/`. Wait for full `domcontentloaded`.
2. **Email Insertion**: Target the `<input>` labeled `email`, `#regEmail`, or `input[name="email"]`. Focus, fill the dynamically generated temp-mail.io address, and command a `.click()` action on the generic `Continue` button. **CRITICAL: You must explicitly target `"button:has-text('Continue') >> visible=true"` as your selector. Do not use generic `type="submit"` selectors! Reddit dynamically renders dozens of visually hidden `display:none` ghost buttons which trap click hooks, so the `>> visible=true` Playwright engine constraint is MANDATORY.**
3. **Transition**: Force a 2000ms arbitrary wait to allow Reddit's backend APIs to securely dispatch the automated OTP.

## 3. OTP VERIFICATION LOOP

1. **Verify Context Switch**: Check if Reddit natively rendered the `input[name="otp"]` or `input[inputmode="numeric"]` field. If true, explicitly pause the Reddit form interaction.
2. **Email Provider Scraping**: Yield execution context _back_ to the active temporary email tab.
3. **Timeout & Fallback Clause**: If the explicit inbox target fails to yield an OTP email within 90 seconds, **abort the current attempt**, swap the platform routing dynamically to `https://temp-mail.org/en/`, grab a new address, and restart from Step 1.
4. **Inbox Locator (temp-mail.io)**: Target the specific UI container `aside[data-qa="inbox"]`.
5. **Target Payload**: Instruct Playwright to filter children (`*`) inside the inbox wrapper containing the case-insensitive phrase `verify your email` or `Reddit`. Execute `.first().click()`.
6. **Regex Parsing**: After 3000ms rendering time, dump the entire string evaluation of `page.innerText('body')`. Execute regex `/\\b(\\d{6})\\b/` to organically rip the clean 6-digit pin from the surrounding HTML boilerplate.
7. **Execution**: Swap back to the Reddit tab, target the OTP payload node, fill the extracted 6-digits, and actively click the "Verify" element.

## 4. CREDENTIAL INJECTION & CAPTCHA DEFENSE

1. **Visibility Walls**: Reddit intentionally hides the `username` field until the exact moment the OTP ping validates. Execute a `waitFor({ state: 'visible' })` loop on `input[name="username"]` before filling.
2. **Password Injection**: Inject arbitrarily complex strings into `#regPassword`.
3. **Captcha Visibility Check (CRITICAL)**: Reddit utilizes invisible background iframes to track behavior score metrics, which Playwright will interpret as an existing CAPTCHA string and instantly crash if targeted blindly.
   - _Logic_: Extract `page.frames()`. Filter specifically for strings targeting `bframe` or `recaptcha`. If matched, invoke an explicit `await frame.isVisible()` assertion test.
   - _Result_: If **invisible**, Reddit is just silently tracking you. Proceed normally.
   - _Result_: If **visible**, this means Reddit initiated a hard CAPTCHA challenge (like a puzzle block). The LLM is **NOT** meant to autonomously solve this puzzle using image recognition!
   - **Visual Confirmation**: Before yielding, the LLM MUST immediately execute a `page.screenshot()` to visually confirm and document the exact CAPTCHA obstacle encountered.
   - **Human Override**: After the screenshot is saved, the LLM must instantly yield execution to the human user, printing a terminal prompt, and waiting via STDIN (e.g. `await askUserToSolveCaptcha()`), allowing the human to manually click the puzzle boxes inside the live Playwright window.
4. **Submit Phase**: Target the exact `"button:has-text('Continue') >> visible=true"` or `"button:has-text('Create Account') >> visible=true"` selector and fire the `.click()` node. **Do NOT use `button[type="submit"]`!**

## 5. POST-ONBOARDING DEMOGRAPHIC NAVIGATION

1. Instead of routing directly to the home screen `/`, Reddit will trap newly generated accounts inside a dynamic `/register/?rdt=` onboarding query parameter wall.
2. **Interests Navigation**: The main interest modal generates randomly. Target the specific sub-object mapping (`getByText(/Gaming/i)`) and implicitly execute the `.click()` event to render a localized `Continue` button below.
3. **Explicit Form Finalization**: Do NOT utilize `page.getByRole('button', { name: "Skip" })` reliably, as backend updates have occasionally detached this component.
4. **Proceed**: Send `.click()` directly targeting the `Continue` container, and the session will be successfully instantiated and fully verified on the organic Home timeline.
