# Project Summary & Setup Guide

This document outlines the progress made across the Scout project and explicitly details the remaining manual steps required to deploy the application.

## Completed Work

### Data Seeding & GCP Setup
- MongoDB Atlas cluster created and seeded with 4 collections (`teams`, `matches`, `venues`, `cities`).
- Atlas Vector Search index configured.
- Google Cloud project (`scout-wc`) and APIs enabled.

### Next.js Project Setup
- Scaffolded Next.js 14 application (`scout-frontend`).
- Installed necessary dependencies (`@google-cloud/vertexai`, `lucide-react`, `clsx`, etc.).
- Created directory structures and configurations (`.env.local`, `.gitignore`).

### MongoDB Embeddings Script
- Wrote `generate-embeddings.ts` inside `scout-frontend` to fetch team documents, call the Vertex AI embedding model (`text-embedding-004`), and save the vectors back to MongoDB Atlas.

### MCP Server Scaffolding
- Initialized the `scout-mcp` Node.js project.
- Installed `@mongodb-js/mongodb-mcp-server` and `express`.
- Wrote `server.js` to bridge incoming HTTP requests from the Vertex AI Agent to the MCP server.
- Added Docker configuration (`Dockerfile`, `.dockerignore`) for Cloud Run deployment.

### Frontend Implementation
- Wrote shared TypeScript types (`lib/types.ts`).
- Integrated Vertex AI via REST (`lib/vertex.ts`) supporting Application Default Credentials and Service Account JSON.
- Built the API route connecting the chat UI to Vertex AI (`app/api/chat/route.ts`).
- Designed and built all React components (`ChatMessage`, `ToolCallBadge`, `TypingIndicator`, `SuggestedQuestions`).
- Wrote the main page UI (`app/page.tsx`) with a dark, football-themed aesthetic.
- Updated `app/layout.tsx` metadata.

### Documentation
- Written a clean, professional `README.md` in the root and frontend directories.
- Added the MIT `LICENSE`.

---

## Action Items (Pending Manual Steps)

To complete the project, please perform the following steps in order:

### 1. Configure Local Environment
Open `scout-frontend/.env.local` and add your **MongoDB Connection String**:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/..."
```

### 2. Generate Vector Embeddings
Open a terminal, authenticate with Google Cloud, and run the embeddings script to populate the `embedding` fields in your Atlas database.
```bash
gcloud auth application-default login
cd scout-frontend
npx tsx generate-embeddings.ts
```
*Verify in MongoDB Atlas that the `embedding` array is populated for team documents.*

### 3. Deploy MCP Server to Cloud Run
The MCP server code is ready. Deploy it so the Vertex AI agent can reach it over the internet.
```bash
cd scout-mcp
gcloud config set project scout-wc
gcloud builds submit --tag gcr.io/scout-wc/scout-mcp
gcloud run deploy scout-mcp \
  --image gcr.io/scout-wc/scout-mcp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="<YOUR_MONGODB_URI>" \
  --memory 512Mi \
  --port 8080
```
*Copy the Service URL output by the deploy command.*

### 4. Setup Google Cloud Agent Builder
This must be done via the Google Cloud Console UI.
1. Navigate to **Agent Builder** > **Engines** > **Create app** > **Agent**.
2. Name it **Scout**, region **us-central1**, model **gemini-2.0-flash**.
3. Paste the System Instruction provided in your original brief.
4. Go to the **Tools** tab in the Agent settings and add a new **OpenAPI** tool.
5. Name it `mongodb_query` and paste the **Cloud Run URL** from Step 3.
6. Copy the **Agent UUID** from the browser URL (e.g., `.../agents/XXXXXXXX-XXXX...`).

### 5. Finalize Frontend Configuration
Add the Agent UUID to your `scout-frontend/.env.local` file:
```env
VERTEX_AGENT_ID="<YOUR-AGENT-UUID>"
```
*You can now test the app locally by running `npm run dev` inside `scout-frontend`.*

### 6. Deploy Frontend to Vercel
1. Push your code to a public GitHub repository.
2. Import the repository into Vercel.
3. In Vercel's Environment Variables settings, add:
   - `GOOGLE_CLOUD_PROJECT` = `scout-wc`
   - `VERTEX_AGENT_ID` = `<YOUR-AGENT-UUID>`
   - `VERTEX_LOCATION` = `us-central1`
4. **Important**: Since Vercel isn't running on your local machine, you must create a Service Account key in GCP with the "Vertex AI User" and "Dialogflow API Client" roles. Download the JSON key, open it, and copy its entire contents into a new Vercel variable called `GOOGLE_APPLICATION_CREDENTIALS_JSON`.

### 7. Record Your Demo Video
Use the script provided in your prompt to record the 3-minute video using your Vercel URL.
