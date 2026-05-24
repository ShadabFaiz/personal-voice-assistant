# Containerization Guide: Personal Voice Assistant

This guide explains how to containerize, optimize, and run the Personal Voice Assistant `mainServer` using Docker and Webpack.

---

## 1. Overview
We use a **Multi-Stage Docker build** combined with **Webpack Bundling** to achieve a hyper-optimized production image.
*   **Original Size**: ~855MB
*   **Optimized Size**: **~283MB** (67% reduction)

---

## 2. The Optimization Strategy

### Multi-Stage Build
Our `Dockerfile` is split into two parts:
1.  **Builder Stage**: Installs all dependencies (including dev tools) and compiles the application.
2.  **Runtime Stage**: Copies only the final bundle into a clean Alpine Linux image. It **completely skips** the `node_modules` folder, saving hundreds of MBs.

### Webpack Bundling & Tree-Shaking
We use Webpack to trace the application code from `src/main.ts` and bundle only the necessary code into a single `dist/main.js` file. This "tree-shaking" automatically excludes unused code from heavy libraries like LangChain.

---

## 3. Configuration Files

### `nest-cli.json`
Enabled Webpack and specified a custom configuration path:
```json
"compilerOptions": {
  "webpack": true,
  "webpackConfigPath": "webpack-build.config.js"
}
```

### `webpack-build.config.js`
Forces Webpack to bundle dependencies that are usually externalized. It also includes an `IgnorePlugin` to handle optional NestJS modules gracefully.

### `.dockerignore`
Ensures that local `node_modules`, `dist`, and sensitive `.env` files are not copied into the image layers.

---

## 4. How to Run

### Environment Setup (`.env`)
The application relies on environment variables for API keys and service endpoints.
1.  **Template**: Copy the provided `mainServer/.env.example` to `.env` in the root directory.
2.  **Key Variables**:
    *   `GOOGLE_GEMINI_API_KEY`: Your Gemini API key.
    *   `TRANSCRIPTION_SERVER_ENDPOINT`: Set to `http://host.docker.internal:5002/transcript` for containerized runs.
    *   `CUSTOM_CA_CERT_PATH`: The **host path** to your Zscaler/Proxy certificate.
    *   `GOOGLE_CLIENT_ID / SECRET`: Required for the Gmail tool.

### Build and Start
Run this command from the root directory:
```bash
docker-compose up --build -d
```

### Check Logs
To verify the server started correctly:
```bash
docker-compose logs -f main-server
```

### Stop and Cleanup
To stop the services:
```bash
docker-compose down
```
To remove old image layers and save space:
```bash
docker image prune -f
```

---

## 5. Important Notes

### Environment Variables
Variables are injected at runtime via `docker-compose`. You can update your `.env` file and simply restart the container to apply changes—no rebuild required:
```bash
docker-compose restart main-server
```

### Connectivity (host.docker.internal)
Inside the container, `localhost` refers to the container itself. If you need to reach services running on your Mac (like the Transcription or Synthesis servers), use `host.docker.internal`:
```env
TRANSCRIPTION_SERVER_ENDPOINT=http://host.docker.internal:5002/transcript
```

### SSL Certificates
The CA certificate is mapped dynamically from your host machine into the container via `volumes` in `docker-compose.yml`. Ensure `CUSTOM_CA_CERT_PATH` points to the correct location on your Mac.
