# Scout 

Scout is a conversational AI companion for the 2026 FIFA World Cup, designed to help fans navigate the tournament with ease. From match schedules to fan travel logistics, Scout relies entirely on real-time data from MongoDB Atlas.

## Live Demo
[Live Demo](https://scout-wc2026.vercel.app)

## Architecture

```
User 
  chat message
Next.js (Frontend)
  API call
Vertex AI Agent Builder (Google Cloud)
  Gemini 2.0 Flash (reasoning model)
  MongoDB MCP Server (tool execution)
  queries
MongoDB Atlas
```

## Tech Stack

| Component | Technology |
|---|---|
| Database | MongoDB Atlas |
| AI Agent | Google Cloud Vertex AI Agent Builder |
| Model | Gemini 2.0 Flash |
| Tools Bridge | MongoDB MCP Server |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Hosting | Vercel (Frontend), Cloud Run (MCP) |

## Features

- **Match Schedules:** Ask when any team plays and where.
- **Team Intelligence:** Learn about playing styles, key players, and World Cup history.
- **Fan Logistics:** Discover airports, transport, and hotels for any host city.
- **Semantic Search:** Find teams with similar playing styles using Atlas Vector Search.

## Local Setup

1. Clone the repository
2. Install dependencies: `npm install` in `scout-frontend` and `scout-mcp`
3. Set environment variables in `.env.local`
4. Authenticate: `gcloud auth application-default login`
5. Run the frontend: `npm run dev`

## Environment Variables

| Variable | Description | Source |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Atlas Dashboard |
| `GOOGLE_CLOUD_PROJECT` | GCP Project ID | GCP Console |
| `VERTEX_AGENT_ID` | UUID of the created Agent | Agent Builder |
| `VERTEX_LOCATION` | GCP Region | Typically `us-central1` |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Prod Auth | GCP Service Account |

## MongoDB Schema

- **teams:** 32 teams with stats and playing styles.
- **matches:** All 48 group stage and knockout fixtures.
- **venues:** 16 stadiums and transport information.
- **cities:** 11+ host cities and logistics advice.

## License
MIT
