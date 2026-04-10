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
- [ ] PDFReaderTool
- [ ] RAGProcessor
- [ ] Tool invocation governance
- [ ] Tool caching layer

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

## 4. Local Document Intelligence

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

## 7. Network / Fetching Layer

- [x] Custom TLS CA support
- [ ] Retry mechanism
- [ ] Exponential backoff
- [ ] Smart timeout strategy
- [ ] User-Agent rotation
- [ ] Proxy support
- [ ] Request logging

---

## 8. Infrastructure & Stability

- [ ] Session memory
- [ ] Embedding cache
- [ ] Tool response cache
- [ ] Observability / logging
- [ ] Token usage tracking
- [ ] Error resilience

---

## 9. Platform Integrations

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

- [ ] WhatsApp Business API setup
- [ ] Incoming message webhook
- [ ] Text message support
- [ ] Voice message support
- [ ] Send TTS voice replies
- [ ] Media handling (images/files)
- [ ] Conversation session management
- [ ] Contact authorization / allowlist

### Email Integration (Gmail / Outlook)

- [ ] Email API client setup
- [ ] Read new emails
- [ ] Summarize inbox
- [ ] Draft replies with LLM
- [ ] Send emails
- [ ] Priority email detection
- [ ] Extract tasks / meetings from emails

---