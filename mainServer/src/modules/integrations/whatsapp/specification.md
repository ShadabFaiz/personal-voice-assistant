# WhatsApp Integration Specification

**Description:**
This integration provides a seamless bridge between WhatsApp (via `@whiskeysockets/baileys`) and the central LLM engine, allowing you to interact with the AI assistant through WhatsApp text, voice notes, and media attachments.

---

## 1. Integration Setup

To get WhatsApp integrated and running locally:

1. **Environment Variables**: Start by renaming `.env.example` to `.env` in the `mainServer` directory and populate any necessary placeholder configurations. The specific environment variable required for WhatsApp is:

   ```env
   # Format: <country_code><phone_number>@s.whatsapp.net
   # Used to identify the admin owner and grant privileged access (e.g. filesystem visibility, user info).
   adminRemoteJidAlt=919876543210@s.whatsapp.net
   ```
2. **First Run (QR Setup)**: Boot the application with:
   ```bash
   yarn install
   npm run start:prod
   ```
   Upon starting, the server will trigger the WhatsApp socket initialization. Since it doesn't have an active session yet, it will print a QR code in the terminal (and also save an image of it inside the `whatsApp_setup` directory).
3. **Link Your Account**: Use your WhatsApp app (Linked Devices) to scan this QR code. Note: WhatsApp itself force-closes the initial socket connection, so you will be required to scan a 2nd QR code to successfully log in and complete the setup.
4. **Restart**: Once your account is successfully linked, restart the application. The bot will automatically reconnect in the background and become available via WhatsApp.

---

## 2. How the Central LLM Handles Media Queries

The central LLM operates seamlessly with multimedia WhatsApp messages by offloading compute-heavy vision tasks to decoupled tools. This prevents the primary conversational memory from bloating with large contexts.

**Flow of Execution:**
1. **Media Ingestion**: When a user sends media (like a PDF report or an Image) to the bot via WhatsApp, the integration automatically intercepts and downloads the raw attachment natively to a local directory (e.g., `/media/whatsapp/User/<date>/`).
2. **Context Passing**: The agent is provided with an explicit absolute path to where this newly downloaded image or file resides on disk, effectively acting as an implicit "attachment".
3. **MediaAnalysisTool Extraction**: To "see" the image or "read" the PDF, the central LLM invokes the dedicated [`MediaAnalysisTool`](../../core/tools/mediaAnalysisTool/specification.md). It passes the local file path along with the user's specific query. 
4. **Resolution**: The Tool acts on the media, extracts the necessary insights or optical answers, and returns the summarized text back to the central LLM. The LLM then structures a final, coherent response back into the WhatsApp chat sequence.

---

## 3. Admin Authorization Check

To restrict access and provide privileged capabilities to the owner, the integration enforces an admin authorization check on incoming messages.

1. **Configuration**: The application loads designated admin JIDs (e.g., via the `adminRemoteJidAlt` environment variable within the `ConfigService`).
2. **Verification**: When the `WhatsAppListener` intercepts an incoming message, it verifies whether the sender's JID matches the configured admin JID.
3. **System Prompting**: If the sender is verified as an admin, an `<isAdmin: true>` flag is dynamically injected into the system prompt before the message is relayed to the central LLM. Otherwise, the flag is set to `<isAdmin: false>`. This allows the LLM to contextually adjust its behavior or permissions based on the user's role.
