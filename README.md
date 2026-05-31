# Scout World Cup 2026 Intelligence Agent

Scout is a conversational AI designed to provide real-time, accurate information about the 2026 FIFA World Cup. It was built for the Google Cloud Rapid Agent Hackathon (MongoDB Track). Instead of relying on static, potentially outdated training data, Scout dynamically queries a live MongoDB Atlas database to answer questions regarding match schedules, team statistics, travel logistics, and knockout scenarios.

## Architecture and Tech Stack

The application is structured into three main components:

1. **Frontend Interface (Next.js)**
   A modern, dark-themed sports broadcast interface built with Next.js 14 and Tailwind CSS. It communicates with the Google Cloud backend via a dedicated API route. It includes features like Markdown rendering for formatted responses and a live query status indicator.

2. **AI Reasoning (Vertex AI Agent Builder)**
   Powered by Gemini 2.0 Flash and hosted in Dialogflow CX. The agent processes natural language, decides which data endpoint to call, and formats the response based on the retrieved data. 

3. **Data Access Layer (Node.js MCP Server)**
   An Express server deployed on Google Cloud Run. It acts as the bridge between the AI agent and the database. It exposes seven strongly-typed REST endpoints to ensure the AI always requests structured data rather than attempting to construct raw database queries.

4. **Database (MongoDB Atlas)**
   A live database containing collections for teams, matches, venues, and cities. It utilizes Atlas Vector Search (powered by Vertex AI text-embedding-004) to perform semantic similarity searches for team playing styles.

## How It Works

When a user submits a question:
1. The frontend sends the query to the Dialogflow CX agent.
2. The agent interprets the query and identifies the appropriate tool (API endpoint) to call.
3. The agent calls the Cloud Run MCP server with the necessary parameters (for example, a team name or group letter).
4. The MCP server executes a secure, parameterized query against MongoDB Atlas.
5. The server returns structured JSON data back to the agent.
6. The agent formulates a conversational response using the data and returns it to the frontend.

## Usage Examples

You can ask Scout a variety of questions. Here are some examples of what it can handle:

* **Match Schedules:** "When does Brazil play their first match?" or "What are the fixtures for Group C?"
* **Team Information:** "Tell me about Argentina's key players and coach."
* **Travel and Venues:** "What are the closest airports to the stadium in Vancouver?"
* **Semantic Style Search:** "Which teams play a possession based tiki-taka style of football?"
* **Knockout Scenarios:** "If France finishes second in their group, where do they play in the Round of 16?"

## Setup and Local Development

### Prerequisites

* Node.js 20 or higher
* A MongoDB Atlas cluster
* A Google Cloud Project with Vertex AI and Cloud Run enabled

### Installation

1. Clone the repository and navigate into the project directory.

2. Install dependencies for both the frontend and the MCP server:
   ```bash
   cd scout-frontend
   npm install
   
   cd ../scout-mcp
   npm install
   ```

3. Create a `.env.local` file in the `scout-frontend` directory and add the following configuration:
   ```env
   GOOGLE_CLOUD_PROJECT=your_project_id
   VERTEX_AGENT_ID=your_agent_uuid
   VERTEX_LOCATION=us-central1
   MONGODB_URI=your_mongodb_uri
   ```

4. Create a `.env` file in the `scout-mcp` directory and add your database URI:
   ```env
   MONGODB_URI=your_mongodb_uri
   GOOGLE_CLOUD_PROJECT=your_project_id
   ```

### Running Locally

Start the Next.js frontend development server:
```bash
cd scout-frontend
npm run dev
```

The application will be available at https://scout-frontend-864234998489.us-central1.run.app.

### Deployment

* **Frontend:** The Next.js application is configured for easy deployment on Vercel. Ensure you provide the necessary environment variables, including the `GOOGLE_APPLICATION_CREDENTIALS_JSON` for Vertex AI authentication.
* **MCP Server:** The Node.js server is containerized using Docker and deployed to Google Cloud Run. You can deploy it using Google Cloud Build and the gcloud CLI.

## Security

* **Rate Limiting:** The frontend API route implements an in-memory rate limiter to prevent abuse.
* **Prompt Injection Protection:** User inputs are wrapped in strict boundaries before reaching the AI agent.
* **Query Safety:** All MongoDB queries use parameterized methods to prevent NoSQL injection.
* **Fallback Mechanisms:** The semantic search endpoint automatically falls back to a smart keyword regex search if the vector index is unavailable.

## License

This project is licensed under the MIT License.
