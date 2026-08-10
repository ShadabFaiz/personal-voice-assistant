## 1. Persona & Conversation Layer

- [x] Persona lock rule
- [x] Core identity (Leena)
- [x] Tone adaptation
- [x] Response formatting rules
- [x] Voice delivery rules (TTS friendly)
- [ ] Conversation flow control
- [ ] Emotional depth scaling
- [ ] Humor calibration

---

## 2. Tooling Architecture (LangGraph)

- [x] Tool registry
- [x] Domain-based tool grouping
- [x] Date / Time tools
- [x] Online Search (DuckDuckGo Web search)
- [x] WebPageFetcherTool
- [x] PDFReaderTool
- [x] Tool invocation governance
- [x] Tool caching layer

---

## 3. Web Intelligence Layer

- [x] DuckDuckGo / Google search
- [x] HTML → readable text extraction
- [x] Content sanitization
- [ ] Chunking utility
- [ ] Embedding generation
- [ ] Similarity scoring
- [ ] Top-K chunk selection
- [ ] Progressive summarization (map-reduce)
- [ ] Multi-source answer merging
- [ ] Source citation support

---

## 4. Local Document Intelligence (not needed due to multimodal approach ?)

- [ ] Local PDF reader
- [ ] PDF text extraction
- [ ] PDF chunking
- [ ] PDF RAG search
- [ ] Local document knowledge base

---

## 5. LLM Infrastructure

- [x] Gemini integration
- [x] Ollama integration
- [x] Multi-provider abstraction
- [ ] Model fallback on rate limits
- [ ] Cost-optimized routing
- [ ] Streaming responses

---

## 6. Voice System

- [x] TTS integration
- [ ] Latency optimization
- [ ] Streaming speech
- [ ] Smart response length control
- [ ] Natural speech pacing

---

## 7. Infrastructure & Stability

- [ ] Session memory
- [ ] Embedding cache
- [ ] Tool response cache
- [ ] Token usage tracking

---

## 8. Platform Integrations

### Reddit Integration

- [ ] Reddit API client setup
- [ ] Monitor subreddit posts
- [ ] Monitor comment threads
- [ ] Auto-reply via LLM
- [ ] Summarize subreddit activity
- [ ] Moderation assistant
- [ ] Rate-limit handling
- [ ] Configurable subreddit subscriptions

### WhatsApp Integration

- [x] Incoming message webhook
- [x] Text message support
- [x] Voice message support
- [x] Send TTS voice replies
- [x] Media handling (images/files)
- [x] Conversation session management
- [ ] Contact authorization / allowlist

### Email Integration (Gmail) (Need more testing)

- [ ] Email API client setup
- [ ] Read new emails
- [ ] Summarize inbox
- [ ] Draft replies with LLM
- [ ] Send emails
- [ ] Priority email detection
- [ ] Extract tasks / meetings from emails

---