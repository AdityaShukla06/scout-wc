# Scout  2026 FIFA World Cup Intelligence Agent

Scout is a conversational AI designed to help fans navigate the 2026 FIFA World Cup. Built for the Google Cloud Rapid Agent Hackathon, the agent uses MongoDB Atlas as its knowledge base to answer questions about match schedules, team intelligence, fan travel logistics, and knockout scenarios.

## Overview

The system bridges a Next.js frontend with a Vertex AI Agent using the MongoDB MCP Server. When queried, Gemini 2.0 Flash routes data requests through the MCP server directly to MongoDB, meaning all facts are sourced from real-time database queries instead of static training data.

## Key Capabilities

- **Schedule Lookups**: Filter matches by date, group, stage, or host city.
- **Team Intelligence**: Retrieve playing styles, stats, and key players.
- **Travel Logistics**: Pull airport, public transport, and hotel data for the 16 host venues.
- **Semantic Team Search**: Uses Google's `text-embedding-004` and Atlas Vector Search to find teams with similar playing styles.

## System Architecture

The core of the application relies on a modular architecture:
1. **Frontend**: Next.js 14 App Router, deployed on Vercel.
2. **AI Reasoning**: Google Cloud Vertex AI Agent Builder (Gemini 2.0 Flash).
3. **Data Access Layer**: MongoDB MCP Server hosted on Cloud Run.
4. **Database**: MongoDB Atlas M0 cluster containing `teams`, `matches`, `venues`, and `cities` collections.

## Setup & Deployment

### Prerequisites

- MongoDB Atlas cluster
- Google Cloud Project with Vertex AI and Cloud Run enabled
- Node.js 20+

### Local Environment

1. Clone the repository.
2. Install dependencies for both the frontend and the MCP server:
   ```bash
   cd scout-frontend && npm install
   cd ../scout-mcp && npm install
   ```
3. Set up your environment variables:
   ```env
   # scout-frontend/.env.local
   GOOGLE_CLOUD_PROJECT=your-project-id
   VERTEX_AGENT_ID=your-agent-uuid
   VERTEX_LOCATION=us-central1
   MONGODB_URI=your-mongodb-uri
   ```
4. Run the frontend locally:
   ```bash
   cd scout-frontend
   npm run dev
   ```

### Deployment

The frontend is optimized for Vercel, and the MCP server is packaged for Google Cloud Run. Ensure that the Service Account key is provided in production via `GOOGLE_APPLICATION_CREDENTIALS_JSON` so the frontend can securely authenticate with Vertex AI.

## License

This project is licensed under the MIT License.
