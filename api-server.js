const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const axios = require('axios');
const authConfig = require("./src/auth_config.json");
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');


const app = express();

const port = process.env.API_PORT || 5000;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = process.env.APP_ORIGIN || authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER" ||
  !mongoApiKey // Check if MONGO_API_KEY is also provided
) {
  console.error(
    "Exiting: Please make sure that auth_config.json and environment variables are in place and populated with valid values"
  );
  process.exit(1);
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({
  origin: appOrigin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  tokenSigningAlg: "RS256",
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});
// Assuming Axios is used for making HTTP requests to an external MongoDB service

app.get("/reported-prompts", async (req, res) => {
  console.log('checking for data.');
  try {
    const dataApiUrl = process.env.MONGODB_DATA_API_URL || 'https://data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find';
    const response = await axios.post(dataApiUrl, {
      "collection": "prompts",
      "database": "userprompts",
      "dataSource": "RememberPrompt",
      "filter": {}
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': process.env.MONGODB_DATA_API_KEY
      }
    });

    // Send the response from MongoDB back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/reported-prompts', async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-todpo/endpoint/data/v1/action/find',
      headers: {
        'Content-Type': 'application/json',
        'api-key': 'rs0qR8HxnpjWTLTDFL1RRVHH277ID0yPXLVvM426h8xuocaFWzwLPdLFz09V9exE'
        // Safely using the API key
      },
      data: {
        collection: 'prompts',
        database: 'userprompts',
        dataSource: 'RememberPrompt',
        filter: {}
      }
    });
    const text = res.text(response.data);
console.log('response from MongoDB API:', text);
  } catch (error) {
    console.error('Error calling MongoDB API:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));

// File uploads (PDF/DOCX/TXT) for copyright checks
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^\w.\-]/g, '_');
    const timestamp = Date.now();
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// Simple, pluggable copyright assessment
async function assessCopyrightRisk(text) {
  const externalUrl = process.env.SIMILARITY_API_URL;
  const apiKey = process.env.SIMILARITY_API_KEY;

  // Basic local heuristic and shingling as a fallback
  const words = (text || '').trim().split(/\s+/);
  const wordCount = words.length;
  const charCount = text.length;
  const potentialRiskByLength = wordCount > 2500 || charCount > 15000;

  // Build lightweight fingerprints (3-gram shingles) for a coarse uniqueness estimate
  const shingles = new Set();
  for (let i = 0; i < words.length - 2 && i < 50000; i++) {
    shingles.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`.toLowerCase());
  }
  const uniqueShingleRatio = shingles.size / Math.max(1, words.length - 2);

  // If external similarity check configured, try it
  if (externalUrl && apiKey) {
    try {
      const resp = await axios.post(externalUrl, { text }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 30000
      });
      // Expecting response: { score: 0..1, matches?: [{source, excerpt, similarity}] }
      const score = typeof resp.data?.score === 'number' ? resp.data.score : 0;
      const matches = Array.isArray(resp.data?.matches) ? resp.data.matches : [];
      return {
        mode: 'external',
        score,
        matches,
        potentialRisk: score >= 0.6 || potentialRiskByLength
      };
    } catch (e) {
      console.warn('External similarity API failed, falling back to local heuristic:', e.message);
    }
  }

  // Local heuristic score, 0..1 where higher means more risky
  const lengthFactor = Math.min(1, wordCount / 8000); // saturate near long docs
  const uniquenessFactor = 1 - Math.min(1, uniqueShingleRatio * 12); // more repeated phrases -> higher risk
  const score = Math.max(0, Math.min(1, 0.6 * lengthFactor + 0.4 * uniquenessFactor));

  return {
    mode: 'local',
    score,
    matches: [],
    potentialRisk: potentialRiskByLength || score >= 0.6
  };
}

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const mime = req.file.mimetype;
    let text = '';
    let meta = {};

    if (mime === 'application/pdf') {
      const data = await pdfParse(fs.readFileSync(filePath));
      text = data.text || '';
      meta = {
        pages: data.numpages || undefined,
        info: data.info || undefined
      };
    } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value || '';
    } else if (mime === 'text/plain') {
      text = fs.readFileSync(filePath, 'utf8');
    }

    const wordCount = text ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;

    // Assess copyright risk (external if configured, else local)
    const similarity = await assessCopyrightRisk(text);

    return res.json({
      file: {
        name: req.file.originalname,
        storedAs: path.basename(filePath),
        sizeBytes: req.file.size,
        mime
      },
      meta,
      stats: {
        wordCount,
        charCount,
      },
      preview: text.slice(0, 1000),
      potentialRisk: similarity.potentialRisk,
      similarity
    });
  } catch (err) {
    console.error('Upload processing error:', err);
    return res.status(500).json({ error: 'Failed to process uploaded file' });
  }
});
