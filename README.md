# JobApex - AI-Powered Job Tracker with Smart Matching

An intelligent job tracking platform that fetches jobs from external sources, matches them with user resumes using AI, and provides a conversational AI assistant for natural language job search.

## Live Demo

https://job-apex-p5a60p17c-sg172003s-projects.vercel.app/

## Test Credentials

- Email: `test@gmail.com`
- Password: `test@123`

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              JobApex Architecture                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────────────┐
│   Frontend   │◄───────►│   Backend    │◄───────►│   External Job API   │
│   (React)    │  HTTP   │  (Fastify)   │  HTTP   │   (Adzuna/Mock)      │
└──────┬───────┘         └──────┬───────┘         └──────────────────────┘
       │                        │
       │                        ▼
       │               ┌─────────────────┐
       │               │  In-Memory      │
       │               │  Storage        │
       │               │  (Users, Jobs,  │
       │               │  Applications)  │
       │               └─────────────────┘
       │                        │
       │                        ▼
       │               ┌─────────────────┐
       │               │  AI Services    │
       │               │                 │
       │               │  ┌───────────┐  │
       └──────────────►│  │ LangChain │  │◄──────► OpenAI API
                       │  │ (Matching)│  │
                       │  └───────────┘  │
                       │  ┌───────────┐  │
                       │  │ LangGraph │  │◄──────► OpenAI API
                       │  │(Assistant)│  │
                       │  └───────────┘  │
                       └─────────────────┘
```

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components
- Context API for state management

### Backend
- Node.js with Fastify
- @fastify/cors for CORS
- @fastify/multipart for file uploads
- pdf-parse for PDF text extraction
- OpenAI API for AI features

### AI/ML
- **LangChain pattern**: OpenAI chat completions with structured prompts
- **LangGraph pattern**: State-based conversation flow with intent detection
- GPT-3.5-turbo for job matching and assistant

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key

### Local Development

1. Clone the repository:
```bash
git clone <repo-url>
cd jobapex
```

2. Set up the backend:
```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
npm install
npm start
```

3. Set up the frontend:
```bash
cd app
cp .env.example .env
# Edit .env to point to backend URL
npm install
npm run dev
```

4. Open http://localhost:5173 in your browser

### Environment Variables

**Backend (.env)**
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001/api
```

## LangChain & LangGraph Usage

### LangChain for Job Matching

The job matching system uses a LangChain-inspired approach with structured prompts:

```javascript
// AI Job Matching Prompt Design
const prompt = `You are an AI job matching system. Analyze how well the candidate's resume matches the job description.

Resume:
${resumeText}

Job Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${job.skills.join(', ')}

Provide a match score from 0-100 and a brief explanation.

Respond in JSON format:
{
  "score": number,
  "explanation": "string",
  "matchingSkills": ["skill1", "skill2"],
  "keywordOverlap": ["keyword1", "keyword2"]
}`;
```

**Why this works:**
- Structured JSON output enables programmatic use
- Temperature 0.3 ensures consistent scoring
- Fallback keyword matching handles API failures
- Batch processing (5 jobs at a time) for performance

### LangGraph for AI Assistant

The AI assistant implements a LangGraph-style state machine:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Start     │────►│Intent Detect │────►│   Router    │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
            ┌────────────────────────────────────┼────┐
            │                                    │    │
            ▼                                    ▼    ▼
    ┌───────────────┐                  ┌──────────┐ ┌──────────┐
    │ Filter Update │                  │Job Search│ │   Help   │
    └───────┬───────┘                  └──────────┘ └──────────┘
            │
            ▼
    ┌───────────────┐
    │ Update UI     │
    │ State         │
    └───────────────┘
```

**Intent Detection:**
- `filter_update`: User wants to change filters ("Show remote jobs")
- `job_search`: User is searching for specific jobs ("Find React jobs")
- `help`: User needs product assistance ("How do I upload my resume?")
- `general`: General conversation

**State Management:**
- Conversation history maintained per session
- Current filter state passed to AI for context
- Tool calling updates frontend filters directly

## AI Matching Logic

### Scoring Approach

1. **Primary Method**: OpenAI GPT-3.5-turbo analysis
   - Resume text analyzed against job description
   - Skills, experience, and keywords compared
   - Score 0-100 with explanation

2. **Fallback Method**: Keyword matching
   - Extract skills from resume
   - Count matching job skills
   - Calculate percentage match

### Performance Considerations

- **Batch Processing**: 5 jobs processed in parallel
- **Caching**: Match scores stored with jobs
- **Lazy Loading**: Scores calculated on demand
- **Timeout Handling**: 30-second timeout per batch

### Color Coding

- **Green (>70%)**: Strong match - apply with confidence
- **Yellow (40-70%)**: Moderate match - review details
- **Gray (<40%)**: Weak match - consider other options

## Popup Flow Design

### User Flow

```
User clicks Apply
       │
       ▼
External link opens (new tab)
       │
       ▼
User applies on external site
       │
       ▼
User returns to JobApex
       │
       ▼
Popup appears: "Did you apply?"
       │
       ├──► Yes, Applied ──► Save to tracking
       │
       ├──► No, just browsing ──► Dismiss
       │
       └──► Applied earlier ──► Save with earlier date
```

### Edge Cases Handled

1. **User never returns**: Popup shown on next focus event
2. **User closes tab**: Pending application stored in sessionStorage
3. **Multiple applications**: Each tracked separately
4. **Duplicate applications**: Checked before saving

### Alternative Approaches Considered

1. **Browser extension**: More invasive, harder to deploy
2. **Email confirmation**: Slower, requires email integration
3. **Manual tracking only**: Less user-friendly

**Chosen approach**: Focus-based detection balances automation with user control.

## AI Assistant UI Choice

**Selected**: Floating chat bubble (bottom-right)

**Reasoning**:
- Always accessible without leaving current view
- Non-intrusive to job browsing
- Familiar pattern (similar to Intercom, Drift)
- Easy to minimize/close

**Alternative considered**: Collapsible sidebar
- Takes up more screen space
- Better for complex workflows
- Overkill for this use case

## Scalability Considerations

### 100+ Jobs

- **Current**: Batch processing (5 jobs at a time)
- **Optimization**: Add Redis caching for match scores
- **Further**: Pre-compute scores when resume uploaded

### 10,000 Users

- **Current**: In-memory storage (not scalable)
- **Required**: Database migration (PostgreSQL/MongoDB)
- **Session**: Redis for session storage
- **AI**: Rate limiting and request queuing

## Tradeoffs & Limitations

### Known Limitations

1. **In-Memory Storage**: Data lost on server restart
2. **No Real Job API**: Using mock data (Adzuna integration ready)
3. **Single User Session**: No multi-device sync
4. **PDF Parsing**: Basic text extraction only
5. **No Email Notifications**: Application reminders not implemented

### What We'd Improve With More Time

1. **Database Integration**: PostgreSQL with Prisma ORM
2. **Real Job APIs**: Adzuna, Indeed, LinkedIn integration
3. **Advanced Resume Parsing**: Skills extraction, experience calculation
4. **Email Notifications**: Application deadlines, interview reminders
5. **Mobile App**: React Native companion app
6. **Collaboration**: Share applications with mentors/friends
7. **Analytics**: Application success rates, time-to-offer metrics

## Project Structure

```
jobapex/
├── app/                          # Frontend (React)
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── contexts/             # Auth & Job contexts
│   │   ├── services/             # API service
│   │   ├── types/                # TypeScript types
│   │   ├── App.tsx               # Main app
│   │   └── main.tsx              # Entry point
│   ├── public/
│   └── package.json
│
├── backend/                      # Backend (Fastify)
│   ├── server.js                 # Main server
│   ├── package.json
│   └── .env.example
│
└── README.md                     # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Resume
- `POST /api/resume/upload` - Upload resume (PDF/TXT)
- `GET /api/resume` - Get resume info

### Jobs
- `GET /api/jobs` - Get all jobs with match scores

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Create application
- `PATCH /api/applications/:id` - Update application status

### AI Assistant
- `POST /api/ai/assistant` - Send message to AI

## License

MIT License - feel free to use this project for learning or as a starting point for your own job tracking application.

## Credits

Built as an assignment submission demonstrating:
- Full-stack development (React + Node.js)
- AI integration (LangChain/LangGraph patterns)
- Product thinking (UX decisions, edge cases)
- System design (architecture, scalability considerations)
