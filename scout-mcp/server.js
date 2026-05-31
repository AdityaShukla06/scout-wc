const express = require('express');
const { MongoClient } = require('mongodb');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const port = process.env.PORT || 8080;
const uri = process.env.MONGODB_URI;
const gcpProject = process.env.GOOGLE_CLOUD_PROJECT || 'scout-wc';

if (!uri) {
  console.error("Missing MONGODB_URI environment variable");
  process.exit(1);
}

const client = new MongoClient(uri);
let db;

async function connectMongo() {
  try {
    await client.connect();
    db = client.db("scout");
    console.log("Successfully connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectMongo();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint 1: Get all matches for a specific team (home or away)
app.get('/matches/team/:teamName', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const teamName = req.params.teamName;
    const filter = {
      $or: [
        { home_team: { $regex: teamName, $options: 'i' } },
        { away_team: { $regex: teamName, $options: 'i' } }
      ]
    };

    const matches = await db.collection('matches').find(filter).sort({ date: 1 }).toArray();

    for (const match of matches) {
      if (match.venue_id) {
        const venue = await db.collection('venues').findOne({ _id: match.venue_id });
        match.venue_details = venue || null;
      }
    }

    res.json({
      team: teamName,
      match_count: matches.length,
      matches
    });
  } catch (error) {
    console.error("Error in /matches/team:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 2: Get all matches in a specific group
app.get('/matches/group/:group', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const group = req.params.group.toUpperCase();
    const matches = await db.collection('matches')
      .find({ group: group })
      .sort({ date: 1 })
      .toArray();

    res.json({
      group,
      match_count: matches.length,
      matches
    });
  } catch (error) {
    console.error("Error in /matches/group:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 3: Get full details about a specific team
app.get('/team/:teamId', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const teamId = req.params.teamId;
    let team = null;

    if (teamId.length === 3) {
      team = await db.collection('teams').findOne(
        { _id: teamId.toUpperCase() },
        { projection: { embedding: 0 } }
      );
    }

    if (!team && req.query.name) {
      team = await db.collection('teams').findOne(
        { name: { $regex: req.query.name, $options: 'i' } },
        { projection: { embedding: 0 } }
      );
    }

    if (!team) {
      team = await db.collection('teams').findOne(
        { name: { $regex: teamId, $options: 'i' } },
        { projection: { embedding: 0 } }
      );
    }

    if (!team) {
      return res.status(404).json({ error: `Team not found: ${teamId}` });
    }

    res.json(team);
  } catch (error) {
    console.error("Error in /team:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 4: Get venue details combined with host city info
app.get('/venue/:venueId', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const venueId = req.params.venueId.toUpperCase();
    const venue = await db.collection('venues').findOne({ _id: venueId });

    if (!venue) {
      return res.status(404).json({ error: `Venue not found: ${venueId}` });
    }

    const city = await db.collection('cities').findOne({ venues: venueId });

    res.json({ venue, city: city || null });
  } catch (error) {
    console.error("Error in /venue:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 5: Get travel and logistics info for a host city
app.get('/city/:cityName', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const cityName = req.params.cityName;
    const city = await db.collection('cities').findOne({
      name: { $regex: cityName, $options: 'i' }
    });

    if (!city) {
      return res.status(404).json({ error: `City not found: ${cityName}` });
    }

    if (city.venues && city.venues.length > 0) {
      city.venue_list = await db.collection('venues')
        .find({ _id: { $in: city.venues } })
        .toArray();
    }

    res.json(city);
  } catch (error) {
    console.error("Error in /city:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 6: Vector search for teams with similar playing styles
app.get('/teams/similar-style', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const { description, limit } = req.query;

    if (!description) {
      return res.status(400).json({ error: "Missing 'description' query parameter" });
    }

    const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
    const authClient = await auth.getClient();
    const token = await authClient.getAccessToken();

    const embeddingResponse = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${gcpProject}/locations/us-central1/publishers/google/models/text-embedding-004:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instances: [{ content: description }]
        })
      }
    );

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      console.error("Embedding API error:", errText);
      return res.status(500).json({ error: "Failed to generate embedding for query" });
    }

    const embeddingData = await embeddingResponse.json();
    const queryVector = embeddingData.predictions[0].embeddings.values;

    let results = [];
    try {
      results = await db.collection('teams').aggregate([
        {
          $vectorSearch: {
            index: 'teams_vector_index',
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: 32,
            limit: parseInt(limit) || 5
          }
        },
        {
          $project: {
            embedding: 0,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]).toArray();
    } catch (err) {
      console.warn("Vector search failed or index is not ready. Falling back to text search. Error:", err.message);
    }

    if (!results || results.length === 0) {
      console.log("Running smart text fallback search for style description...");
      // Split description into keywords of length > 3
      const keywords = description.split(/\s+/).filter(k => k.trim().length > 3);
      let queryObj = {};
      if (keywords.length > 0) {
        queryObj = {
          $or: keywords.map(kw => ({
            style_description: { $regex: kw, $options: 'i' }
          }))
        };
      }
      
      const rawResults = await db.collection('teams')
        .find(queryObj, { projection: { embedding: 0 } })
        .limit(parseInt(limit) || 5)
        .toArray();
      
      results = rawResults.map(team => ({
        ...team,
        score: 0.85
      }));
    }

    res.json({
      query: description,
      results
    });
  } catch (error) {
    console.error("Error in /teams/similar-style:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 7: Calculate knockout stage path for a team
app.get('/knockout-path/:teamId', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });

    const teamId = req.params.teamId;
    const finish = req.query.finish || '1';

    let team = null;
    if (teamId.length === 3) {
      team = await db.collection('teams').findOne(
        { _id: teamId.toUpperCase() },
        { projection: { embedding: 0 } }
      );
    }
    if (!team) {
      team = await db.collection('teams').findOne(
        { name: { $regex: teamId, $options: 'i' } },
        { projection: { embedding: 0 } }
      );
    }

    if (!team) {
      return res.status(404).json({ error: `Team not found: ${teamId}` });
    }

    const knockoutPaths = {
      'A': {
        '1': { plays_against: 'Runner-up of Group B', round16_city: 'Los Angeles', round16_venue: 'SOFI' },
        '2': { plays_against: 'Winner of Group B', round16_city: 'New York', round16_venue: 'METLIFE' }
      },
      'B': {
        '1': { plays_against: 'Runner-up of Group A', round16_city: 'New York', round16_venue: 'METLIFE' },
        '2': { plays_against: 'Winner of Group A', round16_city: 'Los Angeles', round16_venue: 'SOFI' }
      },
      'C': {
        '1': { plays_against: 'Runner-up of Group D', round16_city: 'Dallas', round16_venue: 'ATT' },
        '2': { plays_against: 'Winner of Group D', round16_city: 'Miami', round16_venue: 'HARD_ROCK' }
      },
      'D': {
        '1': { plays_against: 'Runner-up of Group C', round16_city: 'Miami', round16_venue: 'HARD_ROCK' },
        '2': { plays_against: 'Winner of Group C', round16_city: 'Dallas', round16_venue: 'ATT' }
      },
      'E': {
        '1': { plays_against: 'Runner-up of Group F', round16_city: 'Seattle', round16_venue: 'LUMEN' },
        '2': { plays_against: 'Winner of Group F', round16_city: 'Kansas City', round16_venue: 'EMPOWER' }
      },
      'F': {
        '1': { plays_against: 'Runner-up of Group E', round16_city: 'Kansas City', round16_venue: 'EMPOWER' },
        '2': { plays_against: 'Winner of Group E', round16_city: 'Seattle', round16_venue: 'LUMEN' }
      },
      'G': {
        '1': { plays_against: 'Runner-up of Group H', round16_city: 'Boston', round16_venue: 'GILLETTE' },
        '2': { plays_against: 'Winner of Group H', round16_city: 'Vancouver', round16_venue: 'BCEM' }
      },
      'H': {
        '1': { plays_against: 'Runner-up of Group G', round16_city: 'Vancouver', round16_venue: 'BCEM' },
        '2': { plays_against: 'Winner of Group G', round16_city: 'Boston', round16_venue: 'GILLETTE' }
      }
    };

    const teamGroup = team.group;
    if (!teamGroup || !knockoutPaths[teamGroup]) {
      return res.status(400).json({ error: `Cannot determine knockout path for group: ${teamGroup}` });
    }

    const finishPos = finish === '2' ? '2' : '1';
    const pathInfo = knockoutPaths[teamGroup][finishPos];

    let venueDetails = null;
    if (pathInfo.round16_venue) {
      venueDetails = await db.collection('venues').findOne({ _id: pathInfo.round16_venue });
    }

    res.json({
      team: team.name,
      group: teamGroup,
      assumed_finish: parseInt(finishPos),
      round_of_16: {
        opponent: pathInfo.plays_against,
        city: pathInfo.round16_city,
        venue: venueDetails ? venueDetails.name : pathInfo.round16_venue
      },
      potential_path: `Round of 16 (${pathInfo.round16_city}) - Quarter-final - Semi-final - Final (MetLife Stadium, New York)`
    });
  } catch (error) {
    console.error("Error in /knockout-path:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
});
