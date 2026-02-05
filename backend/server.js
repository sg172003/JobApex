const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mimeTypes = require('mime-types');
const OpenAI = require('openai');

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test-key'
});

// In-memory storage
const storage = {
  users: new Map(),
  sessions: new Map(),
  resumes: new Map(),
  jobs: [],
  applications: new Map(),
  aiConversations: new Map()
};

// Register plugins
fastify.register(cors, {
  origin: true,
  credentials: true
});

fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Auth middleware
async function authMiddleware(request, reply) {
  const sessionId = request.headers['session-id'];
  if (!sessionId || !storage.sessions.has(sessionId)) {
    reply.code(401).send({ error: 'Unauthorized' });
    return false;
  }
  request.userId = storage.sessions.get(sessionId);
  return true;
}

// Login endpoint
fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body;

  if (email === 'test@gmail.com' && password === 'test@123') {
    const userId = uuidv4();
    const sessionId = uuidv4();

    storage.users.set(userId, { id: userId, email });
    storage.sessions.set(sessionId, userId);

    return {
      success: true,
      sessionId,
      user: { id: userId, email }
    };
  }

  reply.code(401).send({ error: 'Invalid credentials' });
});

// Logout endpoint
fastify.post('/api/auth/logout', async (request, reply) => {
  const sessionId = request.headers['session-id'];
  if (sessionId) {
    storage.sessions.delete(sessionId);
  }
  return { success: true };
});

// Resume upload endpoint
fastify.post('/api/resume/upload', async (request, reply) => {
  const isAuth = await authMiddleware(request, reply);
  if (!isAuth) return;

  const data = await request.file();
  if (!data) {
    reply.code(400).send({ error: 'No file uploaded' });
    return;
  }

  const mimeType = data.mimetype;
  if (!['application/pdf', 'text/plain'].includes(mimeType)) {
    reply.code(400).send({ error: 'Only PDF or TXT files allowed' });
    return;
  }

  const buffer = await data.toBuffer();
  let text = '';

  try {
    if (mimeType === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else {
      text = buffer.toString('utf-8');
    }

    storage.resumes.set(request.userId, {
      text,
      uploadedAt: new Date().toISOString(),
      fileName: data.filename
    });

    return {
      success: true,
      message: 'Resume uploaded successfully',
      textLength: text.length
    };
  } catch (error) {
    reply.code(500).send({ error: 'Failed to parse file' });
  }
});

// Get resume endpoint
fastify.get('/api/resume', async (request, reply) => {
  const isAuth = await authMiddleware(request, reply);
  if (!isAuth) return;

  const resume = storage.resumes.get(request.userId);
  if (!resume) {
    reply.code(404).send({ error: 'No resume found' });
    return;
  }

  return {
    success: true,
    resume: {
      uploadedAt: resume.uploadedAt,
      fileName: resume.fileName,
      textLength: resume.text.length
    }
  };
});

// Mock job data
const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    description: 'We are looking for a Senior Software Engineer with experience in React, Node.js, and cloud technologies. You will be responsible for building scalable web applications and mentoring junior developers.',
    skills: ['React', 'Node.js', 'TypeScript', 'GCP', 'Kubernetes'],
    jobType: 'Full-time',
    workMode: 'Hybrid',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://careers.google.com'
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'Meta',
    location: 'Menlo Park, CA',
    description: 'Join our team as a Full Stack Developer working on cutting-edge social media features. Strong experience with React, Python, and GraphQL required.',
    skills: ['React', 'Python', 'GraphQL', 'PostgreSQL', 'Redis'],
    jobType: 'Full-time',
    workMode: 'Remote',
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://careers.meta.com'
  },
  {
    id: '3',
    title: 'Machine Learning Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    description: 'Build and deploy large-scale ML models. Experience with PyTorch, TensorFlow, and distributed training required.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'CUDA', 'MLOps'],
    jobType: 'Full-time',
    workMode: 'On-site',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://openai.com/careers'
  },
  {
    id: '4',
    title: 'Frontend Engineer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    description: 'Create stunning user interfaces for millions of users. Expertise in React, JavaScript, and CSS required.',
    skills: ['React', 'JavaScript', 'CSS', 'Web Performance', 'A/B Testing'],
    jobType: 'Full-time',
    workMode: 'Hybrid',
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://jobs.netflix.com'
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'Amazon',
    location: 'Seattle, WA',
    description: 'Manage and optimize cloud infrastructure. Experience with AWS, Terraform, and CI/CD pipelines required.',
    skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins'],
    jobType: 'Full-time',
    workMode: 'Remote',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://amazon.jobs'
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'Uber',
    location: 'San Francisco, CA',
    description: 'Analyze complex datasets to drive business decisions. Strong SQL, Python, and statistical knowledge required.',
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Tableau'],
    jobType: 'Full-time',
    workMode: 'Hybrid',
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://www.uber.com/careers'
  },
  {
    id: '7',
    title: 'Backend Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    description: 'Build reliable payment infrastructure. Experience with Ruby, Go, and distributed systems preferred.',
    skills: ['Ruby', 'Go', 'PostgreSQL', 'Redis', 'Microservices'],
    jobType: 'Full-time',
    workMode: 'On-site',
    postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://stripe.com/jobs'
  },
  {
    id: '8',
    title: 'Mobile Developer',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    description: 'Create beautiful mobile experiences for iOS and Android. React Native experience preferred.',
    skills: ['React Native', 'iOS', 'Android', 'Swift', 'Kotlin'],
    jobType: 'Full-time',
    workMode: 'Hybrid',
    postedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://careers.airbnb.com'
  },
  {
    id: '9',
    title: 'Security Engineer',
    company: 'Microsoft',
    location: 'Redmond, WA',
    description: 'Protect our systems and users from security threats. Experience with penetration testing and security frameworks.',
    skills: ['Security', 'Python', 'Cloud Security', 'SIEM', 'Threat Modeling'],
    jobType: 'Full-time',
    workMode: 'Hybrid',
    postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://careers.microsoft.com'
  },
  {
    id: '10',
    title: 'Product Manager',
    company: 'Apple',
    location: 'Cupertino, CA',
    description: 'Lead product development for innovative consumer electronics. Technical background preferred.',
    skills: ['Product Management', 'Agile', 'Data Analysis', 'UX', 'Strategy'],
    jobType: 'Full-time',
    workMode: 'On-site',
    postedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://jobs.apple.com'
  },
  {
    id: '11',
    title: 'Junior Web Developer',
    company: 'Shopify',
    location: 'Remote',
    description: 'Start your career with a leading e-commerce platform. Learn React, Ruby on Rails, and modern web development.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    jobType: 'Full-time',
    workMode: 'Remote',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://www.shopify.com/careers'
  },
  {
    id: '12',
    title: 'Cloud Architect',
    company: 'IBM',
    location: 'Austin, TX',
    description: 'Design and implement cloud solutions for enterprise clients. AWS, Azure, and GCP expertise required.',
    skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes'],
    jobType: 'Contract',
    workMode: 'Remote',
    postedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://www.ibm.com/careers'
  }
];

// Initialize jobs
storage.jobs = mockJobs;

// AI Job Matching using OpenAI
async function calculateMatchScore(resumeText, job) {
  try {
    const prompt = `You are an AI job matching system. Analyze how well the candidate's resume matches the job description.

Resume:
${resumeText.substring(0, 2000)}

Job Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${job.skills.join(', ')}

Provide a match score from 0-100 and a brief explanation (2-3 sentences) of why this is a good or poor match.

Respond in JSON format:
{
  "score": number,
  "explanation": "string",
  "matchingSkills": ["skill1", "skill2"],
  "keywordOverlap": ["keyword1", "keyword2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful job matching assistant. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      score: Math.min(100, Math.max(0, result.score)),
      explanation: result.explanation,
      matchingSkills: result.matchingSkills || [],
      keywordOverlap: result.keywordOverlap || []
    };
  } catch (error) {
    console.error('AI matching error:', error);
    // Fallback to simple keyword matching
    return fallbackMatching(resumeText, job);
  }
}

// Fallback keyword matching
function fallbackMatching(resumeText, job) {
  const resumeLower = resumeText.toLowerCase();
  const jobText = (job.title + ' ' + job.description + ' ' + job.skills.join(' ')).toLowerCase();

  const jobKeywords = job.skills.map(s => s.toLowerCase());
  const matchingSkills = jobKeywords.filter(keyword => resumeLower.includes(keyword));

  const score = Math.round((matchingSkills.length / jobKeywords.length) * 100);

  return {
    score: Math.min(100, Math.max(0, score)),
    explanation: `Found ${matchingSkills.length} matching skills: ${matchingSkills.join(', ')}`,
    matchingSkills,
    keywordOverlap: matchingSkills
  };
}

// Get jobs endpoint with AI matching
fastify.get('/api/jobs', async (request, reply) => {
  const isAuth = await authMiddleware(request, reply);
  if (!isAuth) return;

  const resume = storage.resumes.get(request.userId);
  let jobsWithScores = storage.jobs.map(job => ({
    ...job,
    matchScore: null,
    matchExplanation: null,
    matchingSkills: [],
    keywordOverlap: []
  }));

  // Calculate match scores if resume exists
  if (resume) {
    // Process in batches for performance
    const batchSize = 5;
    for (let i = 0; i < jobsWithScores.length; i += batchSize) {
      const batch = jobsWithScores.slice(i, i + batchSize);
      const promises = batch.map(async (job) => {
        const matchResult = await calculateMatchScore(resume.text, job);
        return {
          ...job,
          matchScore: matchResult.score,
          matchExplanation: matchResult.explanation,
          matchingSkills: matchResult.matchingSkills,
          keywordOverlap: matchResult.keywordOverlap
        };
      });

      const results = await Promise.all(promises);
      jobsWithScores.splice(i, batchSize, ...results);
    }
  }

  return {
    success: true,
    jobs: jobsWithScores,
    hasResume: !!resume
  };
});

// Application tracking endpoints
fastify.post('/api/applications', async (request, reply) => {
  const isAuth = await authMiddleware(request, reply);
  if (!isAuth) return;

  const { jobId, status, notes } = request.body;

  const application = {
    id: uuidv4(),
    userId: request.userId,
    jobId,
    status: status || 'Applied',
    notes: notes || '',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { status: 'Applied', timestamp: new Date().toISOString() }
    ]
  };

  if (!storage.applications.has(request.userId)) {
    storage.applications.set(request.userId, []);
  }

  storage.applications.get(request.userId).push(application);

  return {
    success: true,
    application
  };
});

// Get applications
fastify.get('/api/applications', async (request, reply) => {
  const isAuth = await authMiddleware(request, reply);
  if (!isAuth) return;

  const userApps = storage.applications.get(request.userId) || [];

  // Enrich with job details
  const enrichedApps = userApps.map(app => {
    const job = storage.jobs.find(j => j.id === app.jobId);
    return {
      ...app,
      job: job || null
    };
  });

  return {
    success: true,
    applications: enrichedApps
  };
});

// Update application status
fastify.patch('/api/applications/:id', async (request, reply) => {
  const isAuth = await authMiddleware(request, reply);
  if (!isAuth) return;

  const { id } = request.params;
  const { status, notes } = request.body;

  const userApps = storage.applications.get(request.userId) || [];
  const appIndex = userApps.findIndex(a => a.id === id);

  if (appIndex === -1) {
    reply.code(404).send({ error: 'Application not found' });
    return;
  }

  const app = userApps[appIndex];

  if (status && status !== app.status) {
    app.status = status;
    app.timeline.push({
      status,
      timestamp: new Date().toISOString()
    });
  }

  if (notes !== undefined) {
    app.notes = notes;
  }

  app.updatedAt = new Date().toISOString();

  return {
    success: true,
    application: app
  };
});

// AI Assistant endpoint using LangGraph pattern
fastify.post('/api/ai/assistant', async (request, reply) => {
  const isAuth = await authMiddleware(request, reply);
  if (!isAuth) return;

  const { message, currentFilters, conversationHistory = [] } = request.body;

  try {
    const systemPrompt = `You are an AI assistant for a job tracking application. Your job is to:
1. Understand user intent (job search, filter update, or help)
2. For filter updates: return the updated filter state
3. For job search: identify search criteria
4. For help: provide helpful information about the app

Current filters: ${JSON.stringify(currentFilters)}

Respond in JSON format:
{
  "intent": "filter_update" | "job_search" | "help" | "general",
  "message": "Your response to the user",
  "filters": { updated filter object if intent is filter_update },
  "searchCriteria": { criteria if intent is job_search }
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5),
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.3,
      max_tokens: 800
    });

    const content = response.choices[0].message.content;
    let result;

    try {
      result = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, treat as general response
      result = {
        intent: 'general',
        message: content
      };
    }

    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('AI assistant error:', error);
    reply.code(500).send({ error: 'AI processing failed' });
  }
});

// Health check
fastify.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
