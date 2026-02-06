import type { User, Job, Application, Filters, Resume, AIResponse } from '@/types';

// Base job data without match scores (scores calculated dynamically)
const baseJobs = [
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

// Simulated resume skills extracted from uploaded resume
let userResumeSkills: string[] = [];
let userResumeText = '';

// Extract skills from resume text
function extractSkillsFromResume(text: string): string[] {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go', 'Ruby',
    'HTML', 'CSS', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'API',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'Jenkins', 'CI/CD',
    'Git', 'GitHub', 'GitLab', 'Linux', 'Bash', 'Shell',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'Pandas', 'NumPy',
    'Agile', 'Scrum', 'Jira', 'Confluence',
    'Figma', 'Sketch', 'Adobe XD', 'UI/UX', 'Design Systems',
    'Swift', 'Kotlin', 'iOS', 'Android', 'React Native', 'Flutter',
    'Security', 'Penetration Testing', 'SIEM', 'Threat Modeling',
    'Product Management', 'Strategy', 'Analytics', 'Tableau', 'PowerBI'
  ];
  
  const textLower = text.toLowerCase();
  return skillKeywords.filter(skill => 
    textLower.includes(skill.toLowerCase()) ||
    textLower.includes(skill.toLowerCase().replace(/\./g, '')) ||
    textLower.includes(skill.toLowerCase().replace(/\s/g, ''))
  );
}

// Calculate match score between resume and job
function calculateMatchScore(resumeSkills: string[], job: typeof baseJobs[0]): {
  score: number;
  explanation: string;
  matchingSkills: string[];
  keywordOverlap: string[];
} {
  if (resumeSkills.length === 0) {
    return {
      score: 0,
      explanation: 'Upload your resume to see match scores',
      matchingSkills: [],
      keywordOverlap: []
    };
  }

  // Find matching skills
  const matchingSkills = job.skills.filter(jobSkill => 
    resumeSkills.some(resumeSkill => 
      resumeSkill.toLowerCase() === jobSkill.toLowerCase() ||
      resumeSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(resumeSkill.toLowerCase())
    )
  );

  // Calculate base score from skill overlap
  const skillMatchRatio = matchingSkills.length / job.skills.length;
  let score = Math.round(skillMatchRatio * 100);

  // Add bonus for title/role match
  const resumeTextLower = userResumeText.toLowerCase();
  const titleWords = job.title.toLowerCase().split(' ');
  const titleMatches = titleWords.filter(word => 
    word.length > 2 && resumeTextLower.includes(word)
  ).length;
  const titleBonus = Math.min(10, titleMatches * 3);
  
  score = Math.min(100, score + titleBonus);

  // Generate explanation based on score
  let explanation = '';
  if (score >= 80) {
    explanation = `Excellent match! Your skills in ${matchingSkills.slice(0, 3).join(', ')} align perfectly with this role.`;
  } else if (score >= 60) {
    explanation = `Good match. You have ${matchingSkills.length} of ${job.skills.length} required skills including ${matchingSkills.slice(0, 2).join(', ')}.`;
  } else if (score >= 40) {
    explanation = `Moderate match. You have some relevant skills but may need to develop ${job.skills.filter(s => !matchingSkills.includes(s)).slice(0, 2).join(', ')}.`;
  } else {
    explanation = `Limited match. This role requires skills like ${job.skills.slice(0, 3).join(', ')} which weren't highlighted in your resume.`;
  }

  return {
    score,
    explanation,
    matchingSkills,
    keywordOverlap: matchingSkills.slice(0, 3)
  };
}

// Generate jobs with dynamic match scores
function generateJobsWithScores(): Job[] {
  return baseJobs.map(job => {
    const matchResult = calculateMatchScore(userResumeSkills, job);
    return {
      ...job,
      matchScore: matchResult.score,
      matchExplanation: matchResult.explanation,
      matchingSkills: matchResult.matchingSkills,
      keywordOverlap: matchResult.keywordOverlap
    };
  });
}

const mockApplications: Application[] = [];

class MockApiService {
  private currentSessionId: string | null = null;
  private hasResume = false;

  setSessionId(sessionId: string) {
    this.currentSessionId = sessionId;
    void this.currentSessionId;
  }

  clearSessionId() {
    this.currentSessionId = null;
  }

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; sessionId: string; user: User }> {
    if (email === 'test@gmail.com' && password === 'test@123') {
      const sessionId = 'mock-session-' + Date.now();
      this.setSessionId(sessionId);
      return {
        success: true,
        sessionId,
        user: { id: 'mock-user', email: 'test@gmail.com' }
      };
    }
    throw new Error('Invalid credentials');
  }

  async logout(): Promise<{ success: boolean }> {
    this.clearSessionId();
    return { success: true };
  }

  // Resume
  async uploadResume(_file: File): Promise<{ success: boolean; message: string; textLength: number }> {
    // Simulate resume text extraction with varied content based on filename
    const mockResumeTexts = [
      // Frontend-focused resume
      `John Doe
Software Engineer with 5 years of experience
Skills: React, JavaScript, TypeScript, CSS, HTML, Node.js, Git, REST APIs
Experience: Built scalable web applications using React and TypeScript. 
Proficient in modern frontend frameworks and responsive design.
Technologies: React, Redux, Next.js, Tailwind CSS, Material UI`,
      
      // Backend-focused resume
      `Jane Smith
Backend Developer
Skills: Python, Java, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Microservices
Experience: Designed and implemented RESTful APIs and microservices.
Database design and optimization. Cloud infrastructure management.
Technologies: Django, Flask, Spring Boot, Redis, Kafka`,
      
      // Full-stack resume
      `Alex Johnson
Full Stack Developer
Skills: JavaScript, React, Node.js, Python, SQL, Git, Docker, AWS
Experience: End-to-end web development from database to UI.
Built full-stack applications using MERN stack.
Technologies: React, Express, MongoDB, PostgreSQL, GraphQL`,
      
      // DevOps-focused resume
      `Sarah Chen
DevOps Engineer
Skills: AWS, Azure, Docker, Kubernetes, Terraform, Jenkins, Python, Bash
Experience: CI/CD pipeline automation and cloud infrastructure.
Container orchestration and monitoring.
Technologies: AWS, GCP, Docker, Kubernetes, Ansible, Prometheus`
    ];
    
    // Pick a random resume profile
    const randomResume = mockResumeTexts[Math.floor(Math.random() * mockResumeTexts.length)];
    userResumeText = randomResume;
    userResumeSkills = extractSkillsFromResume(randomResume);
    this.hasResume = true;
    
    return {
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      textLength: randomResume.length
    };
  }

  async getResume(): Promise<{ success: boolean; resume: Resume }> {
    if (!this.hasResume) {
      throw new Error('No resume found');
    }
    return {
      success: true,
      resume: {
        uploadedAt: new Date().toISOString(),
        fileName: 'resume.pdf',
        textLength: userResumeText.length
      }
    };
  }

  // Jobs - now with dynamic match scores
  async getJobs(): Promise<{ success: boolean; jobs: Job[]; hasResume: boolean }> {
    // Simulate API delay for AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const jobs = generateJobsWithScores();
    
    return {
      success: true,
      jobs,
      hasResume: this.hasResume
    };
  }

  // Applications
  async createApplication(jobId: string, status?: string): Promise<{ success: boolean; application: Application }> {
    const jobs = generateJobsWithScores();
    const job = jobs.find(j => j.id === jobId);
    const application: Application = {
      id: 'app-' + Date.now(),
      userId: 'mock-user',
      jobId,
      status: (status as any) || 'Applied',
      notes: '',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [{ status: 'Applied', timestamp: new Date().toISOString() }],
      job
    };
    mockApplications.push(application);
    return { success: true, application };
  }

  async getApplications(): Promise<{ success: boolean; applications: Application[] }> {
    // Refresh job data for applications
    const jobs = generateJobsWithScores();
    const enrichedApps = mockApplications.map(app => ({
      ...app,
      job: jobs.find(j => j.id === app.jobId) || app.job
    }));
    
    return {
      success: true,
      applications: enrichedApps
    };
  }

  async updateApplication(id: string, updates: { status?: string; notes?: string }): Promise<{ success: boolean; application: Application }> {
    const app = mockApplications.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    
    if (updates.status) {
      app.status = updates.status as any;
      app.timeline.push({ status: updates.status, timestamp: new Date().toISOString() });
    }
    if (updates.notes !== undefined) {
      app.notes = updates.notes;
    }
    app.updatedAt = new Date().toISOString();
    
    // Refresh job data
    const jobs = generateJobsWithScores();
    app.job = jobs.find(j => j.id === app.jobId) || app.job;
    
    return { success: true, application: app };
  }

  // AI Assistant
  async sendAIMessage(
    message: string,
    currentFilters: Filters,
    _conversationHistory: { role: string; content: string }[] = []
  ): Promise<{ success: boolean; result: AIResponse }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('remote')) {
      return {
        success: true,
        result: {
          intent: 'filter_update',
          message: "I've updated the filters to show only remote jobs.",
          filters: { ...currentFilters, workMode: ['Remote'] }
        }
      };
    }
    
    if (lowerMessage.includes('full-time') || lowerMessage.includes('fulltime')) {
      return {
        success: true,
        result: {
          intent: 'filter_update',
          message: "I've filtered to show only full-time positions.",
          filters: { ...currentFilters, jobType: ['Full-time'] }
        }
      };
    }
    
    if (lowerMessage.includes('clear') || lowerMessage.includes('reset')) {
      return {
        success: true,
        result: {
          intent: 'filter_update',
          message: "I've cleared all filters for you.",
          filters: {
            searchTitle: '',
            skills: [],
            datePosted: 'any',
            jobType: [],
            workMode: [],
            location: '',
            matchScore: 'all'
          }
        }
      };
    }
    
    if (lowerMessage.includes('react')) {
      return {
        success: true,
        result: {
          intent: 'filter_update',
          message: "I've filtered for React-related jobs.",
          filters: { ...currentFilters, skills: ['React'] }
        }
      };
    }
    
    if (lowerMessage.includes('high match') || lowerMessage.includes('best match')) {
      return {
        success: true,
        result: {
          intent: 'filter_update',
          message: "I've filtered to show only high match scores (>70%).",
          filters: { ...currentFilters, matchScore: 'high' }
        }
      };
    }
    
    if (lowerMessage.includes('python')) {
      return {
        success: true,
        result: {
          intent: 'filter_update',
          message: "I've filtered for Python-related jobs.",
          filters: { ...currentFilters, skills: ['Python'] }
        }
      };
    }
    
    if (lowerMessage.includes('senior')) {
      return {
        success: true,
        result: {
          intent: 'filter_update',
          message: "I've filtered for senior-level positions.",
          filters: { ...currentFilters, searchTitle: 'Senior' }
        }
      };
    }
    
    if (lowerMessage.includes('application') || lowerMessage.includes('track')) {
      return {
        success: true,
        result: {
          intent: 'help',
          message: "You can track all your applications on the 'Applications' page. Click the 'Applications' link in the navigation bar."
        }
      };
    }
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('upload')) {
      return {
        success: true,
        result: {
          intent: 'help',
          message: "You can upload or update your resume by clicking the 'Resume' button in the navigation bar. We accept PDF or TXT files."
        }
      };
    }
    
    if (lowerMessage.includes('how') && lowerMessage.includes('match')) {
      return {
        success: true,
        result: {
          intent: 'help',
          message: "I analyze your resume skills and experience to calculate a match score for each job. The score ranges from 0-100, with green badges (>70%) indicating strong matches."
        }
      };
    }
    
    return {
      success: true,
      result: {
        intent: 'general',
        message: "I can help you find jobs, update filters, or answer questions about the app. Try asking me to 'show remote jobs', 'filter by React', 'show senior positions', or 'clear all filters'."
      }
    };
  }
}

export const apiService = new MockApiService();
