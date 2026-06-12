/**
 * ATS Engine — Core Analysis Service
 * Compares resume text against a job description to generate
 * an ATS compatibility score and detailed recommendations.
 */

// Curated skills dictionary for better keyword extraction
const TECH_SKILLS = [
  // Languages
  'javascript','typescript','python','java','c++','c#','ruby','go','rust','swift',
  'kotlin','php','scala','r','matlab','perl','bash','shell','powershell',
  // Frontend
  'react','react.js','reactjs','vue','vue.js','vuejs','angular','svelte','nextjs',
  'next.js','nuxtjs','nuxt.js','html','css','sass','scss','less','tailwind',
  'tailwindcss','bootstrap','jquery','webpack','vite','parcel','rollup',
  // Backend
  'node','node.js','nodejs','express','express.js','django','flask','fastapi',
  'spring','spring boot','laravel','rails','asp.net','nestjs','nest.js','hapi',
  'koa','fastify',
  // Databases
  'mongodb','mongoose','postgresql','postgres','mysql','sqlite','redis','elasticsearch',
  'cassandra','dynamodb','firebase','supabase','prisma','sequelize','typeorm',
  // Cloud & DevOps
  'aws','azure','gcp','google cloud','docker','kubernetes','k8s','terraform',
  'ansible','jenkins','github actions','gitlab ci','circleci','travis ci',
  'nginx','apache','linux','ubuntu','ci/cd','devops','helm','prometheus','grafana',
  // Tools & Practices
  'git','github','gitlab','bitbucket','jira','agile','scrum','kanban',
  'rest','restful','graphql','grpc','websocket','microservices','monorepo',
  'tdd','bdd','unit testing','integration testing','jest','mocha','cypress',
  'selenium','postman','swagger','openapi',
  // Data & ML
  'machine learning','deep learning','tensorflow','pytorch','keras','scikit-learn',
  'pandas','numpy','matplotlib','tableau','power bi','spark','hadoop','kafka',
  // Mobile
  'react native','flutter','ios','android','xamarin','ionic',
];

const SOFT_SKILLS = [
  'leadership','communication','teamwork','collaboration','problem solving',
  'critical thinking','adaptability','time management','project management',
  'attention to detail','creativity','analytical','presentation','mentoring',
  'negotiation','decision making','conflict resolution',
];

const ACTION_VERBS = [
  'developed','built','designed','implemented','architected','led','managed',
  'created','deployed','optimized','improved','increased','reduced','achieved',
  'delivered','collaborated','maintained','refactored','migrated','integrated',
  'automated','tested','reviewed','documented','launched','scaled',
];

const RESUME_SECTIONS = [
  'experience','education','skills','summary','objective','projects',
  'certifications','awards','publications','languages','interests','references',
];

/**
 * Normalize text: lowercase, remove punctuation, split into tokens
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s.#+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((t) => t.length > 1);
}

/**
 * Extract multi-word and single-word skills from text
 */
function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = new Set();

  // Check tech skills (supports multi-word like "machine learning")
  for (const skill of TECH_SKILLS) {
    if (lower.includes(skill)) {
      found.add(skill);
    }
  }

  // Check soft skills
  for (const skill of SOFT_SKILLS) {
    if (lower.includes(skill)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

/**
 * Extract meaningful keywords from text (excluding stopwords)
 */
function extractKeywords(text) {
  const stopwords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'by','from','is','are','was','were','be','been','being','have','has',
    'had','do','does','did','will','would','could','should','may','might',
    'this','that','these','those','i','we','you','he','she','it','they',
    'my','your','his','her','its','our','their','as','if','then','than',
    'so','yet','both','either','not','also','just','more','very','can',
    'about','into','through','during','before','after','above','below',
  ]);

  return tokenize(text)
    .filter((t) => !stopwords.has(t) && t.length > 2)
    .filter((t) => !/^\d+$/.test(t)); // exclude pure numbers
}

/**
 * Calculate keyword match score (40% weight)
 */
function calculateKeywordScore(resumeSkills, jdSkills) {
  if (jdSkills.length === 0) return { score: 70, matched: [], missing: [] };

  const matched = jdSkills.filter((s) => resumeSkills.includes(s));
  const missing = jdSkills.filter((s) => !resumeSkills.includes(s));
  const score = Math.round((matched.length / jdSkills.length) * 100);

  return { score, matched, missing };
}

/**
 * Calculate format quality score (20% weight)
 */
function calculateFormatScore(resumeText) {
  const lower = resumeText.toLowerCase();
  let score = 0;
  const maxPoints = 6;

  // Check for key sections
  const presentSections = RESUME_SECTIONS.filter((s) => lower.includes(s));
  score += Math.min(presentSections.length / 4, 1) * 3; // up to 3 points

  // Check for bullet points (lines starting with •, -, *, or numbers)
  const bulletLines = resumeText.split('\n').filter((l) =>
    /^[\s]*[-•*●▪]|\d+\./.test(l)
  ).length;
  if (bulletLines >= 5) score += 1;

  // Check for contact info patterns
  if (/[\w.]+@[\w.]+\.\w+/.test(resumeText)) score += 0.5; // email
  if (/\+?[\d\s\-().]{10,}/.test(resumeText)) score += 0.5; // phone

  // Check for action verbs
  const verbCount = ACTION_VERBS.filter((v) => lower.includes(v)).length;
  if (verbCount >= 5) score += 1;

  return Math.round((score / maxPoints) * 100);
}

/**
 * Calculate readability score (20% weight)
 */
function calculateReadabilityScore(resumeText) {
  const lines = resumeText.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return 50;

  let score = 60; // base

  // Good length (not too short, not too long)
  const wordCount = tokenize(resumeText).length;
  if (wordCount >= 200 && wordCount <= 800) score += 15;
  else if (wordCount >= 100) score += 8;

  // Action verbs usage
  const verbCount = ACTION_VERBS.filter((v) =>
    resumeText.toLowerCase().includes(v)
  ).length;
  score += Math.min(verbCount * 2, 15);

  // Quantified achievements (numbers in context)
  const quantified = (resumeText.match(/\d+[\s%+x]*(years?|months?|projects?|users?|%|x|million|billion|k\b)/gi) || []).length;
  score += Math.min(quantified * 2, 10);

  return Math.min(score, 100);
}

/**
 * Calculate experience match score (20% weight)
 */
function calculateExperienceScore(resumeText, jdText) {
  const lower = resumeText.toLowerCase();
  let score = 50;

  // Years of experience mentioned
  const yearsMatch = resumeText.match(/(\d+)\+?\s*years?\s*(of\s+)?(experience|exp)/gi);
  if (yearsMatch) score += 15;

  // Role-related keywords from JD in resume
  const jdWords = extractKeywords(jdText);
  const roleWords = jdWords.filter((w) => w.length > 4);
  const matchCount = roleWords.filter((w) => lower.includes(w)).length;
  const matchRatio = roleWords.length > 0 ? matchCount / roleWords.length : 0;
  score += Math.round(matchRatio * 25);

  // Has education section
  if (/bachelor|master|phd|degree|university|college|b\.s\.|m\.s\./i.test(resumeText)) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Generate strengths based on resume analysis
 */
function generateStrengths(resumeText, matchedSkills) {
  const strengths = [];
  const lower = resumeText.toLowerCase();

  if (matchedSkills.length >= 5) strengths.push('Strong technical skill alignment with job requirements');
  if (ACTION_VERBS.filter((v) => lower.includes(v)).length >= 5)
    strengths.push('Effective use of action verbs throughout resume');
  if (/\d+[\s%+]*(years?|projects?|users?|%)/i.test(resumeText))
    strengths.push('Quantified achievements demonstrating measurable impact');
  if (/bachelor|master|phd|degree/i.test(resumeText))
    strengths.push('Relevant educational background');
  if (RESUME_SECTIONS.filter((s) => lower.includes(s)).length >= 4)
    strengths.push('Well-structured resume with clear sections');
  if (lower.includes('project') && lower.includes('github'))
    strengths.push('Portfolio projects with code references');
  if (matchedSkills.length >= 8) strengths.push('Comprehensive skill set matching job requirements');

  return strengths.slice(0, 5);
}

/**
 * Generate improvement areas
 */
function generateImprovements(missingKeywords, resumeText) {
  const improvements = [];
  const lower = resumeText.toLowerCase();

  if (missingKeywords.length > 3) improvements.push(`Missing ${missingKeywords.length} important keywords from job description`);
  if (ACTION_VERBS.filter((v) => lower.includes(v)).length < 3)
    improvements.push('Limited use of strong action verbs');
  if (!/\d+[\s%+]*(years?|projects?|users?|%)/i.test(resumeText))
    improvements.push('Achievements lack quantified metrics and numbers');
  if (!lower.includes('summary') && !lower.includes('objective'))
    improvements.push('Missing professional summary or objective statement');
  if (!/linkedin|github|portfolio/i.test(resumeText))
    improvements.push('No links to LinkedIn, GitHub, or portfolio');
  const wordCount = tokenize(resumeText).length;
  if (wordCount < 200) improvements.push('Resume content is too brief — add more detail');

  return improvements.slice(0, 5);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(missingKeywords, improvements, atsScore) {
  const recommendations = [];

  if (missingKeywords.length > 0) {
    recommendations.push({
      title: 'Add Missing Keywords',
      description: `Incorporate these keywords naturally into your experience: ${missingKeywords.slice(0, 5).join(', ')}`,
      impact: 'high',
    });
  }

  if (atsScore < 70) {
    recommendations.push({
      title: 'Optimize for ATS Parsing',
      description: 'Use standard section headers (Experience, Education, Skills). Avoid tables, columns, and graphics that confuse ATS parsers.',
      impact: 'high',
    });
  }

  recommendations.push({
    title: 'Quantify Your Achievements',
    description: 'Replace vague statements with specific metrics. E.g., "Improved performance by 40%" instead of "Improved performance".',
    impact: 'high',
  });

  recommendations.push({
    title: 'Strengthen Action Verbs',
    description: 'Start each bullet point with powerful action verbs like "Architected", "Optimized", "Delivered", "Scaled", "Led".',
    impact: 'medium',
  });

  if (!improvements.some((i) => i.includes('summary'))) {
    recommendations.push({
      title: 'Add a Professional Summary',
      description: 'Include a 2-3 sentence summary at the top highlighting your key skills and experience relevant to this role.',
      impact: 'medium',
    });
  }

  recommendations.push({
    title: 'Tailor Resume to Job Description',
    description: 'Mirror the exact language used in the job description. ATS systems often match exact phrases.',
    impact: 'medium',
  });

  recommendations.push({
    title: 'Optimize File Format',
    description: 'Submit as a clean PDF. Avoid headers/footers, text boxes, or multi-column layouts that break ATS parsing.',
    impact: 'low',
  });

  return recommendations.slice(0, 6);
}

/**
 * Generate suggested keywords (not in resume or JD but related to matched skills)
 */
function generateSuggestedKeywords(matchedSkills, missingKeywords) {
  const suggestions = new Set();

  const relatedMap = {
    react: ['redux', 'react query', 'next.js', 'react testing library'],
    node: ['express', 'nestjs', 'fastify', 'pm2'],
    'node.js': ['express', 'nestjs', 'fastify'],
    mongodb: ['mongoose', 'atlas', 'aggregation'],
    python: ['django', 'flask', 'fastapi', 'pandas'],
    aws: ['ec2', 's3', 'lambda', 'cloudformation', 'ecs'],
    docker: ['kubernetes', 'docker-compose', 'container orchestration'],
    kubernetes: ['helm', 'kubectl', 'service mesh'],
    graphql: ['apollo', 'relay', 'schema design'],
    typescript: ['generics', 'decorators', 'type guards'],
    postgresql: ['pgadmin', 'query optimization', 'indexing'],
    git: ['git flow', 'pull requests', 'code review'],
    agile: ['scrum', 'sprint planning', 'retrospectives'],
    'machine learning': ['tensorflow', 'scikit-learn', 'model deployment'],
  };

  for (const skill of matchedSkills) {
    const related = relatedMap[skill.toLowerCase()] || [];
    for (const r of related) {
      if (!matchedSkills.includes(r) && !missingKeywords.includes(r)) {
        suggestions.add(r);
      }
    }
  }

  return Array.from(suggestions).slice(0, 8);
}

/**
 * Main ATS Analysis Function
 * @param {string} resumeText - Extracted text from resume
 * @param {string} jobDescription - Job description text
 * @returns {object} Full ATS analysis result
 */
function analyzeResume(resumeText, jobDescription) {
  // Extract skills from both
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescription);

  // Keyword analysis
  const { score: kwScore, matched, missing } = calculateKeywordScore(resumeSkills, jdSkills);

  // Sub-scores
  const formatScore = calculateFormatScore(resumeText);
  const readabilityScore = calculateReadabilityScore(resumeText);
  const experienceScore = calculateExperienceScore(resumeText, jobDescription);

  // Weighted ATS Score
  const atsScore = Math.round(
    kwScore * 0.4 +
    formatScore * 0.2 +
    readabilityScore * 0.2 +
    experienceScore * 0.2
  );

  // Generate outputs
  const strengths = generateStrengths(resumeText, matched);
  const improvements = generateImprovements(missing, resumeText);
  const recommendations = generateRecommendations(missing, improvements, atsScore);
  const suggestedKeywords = generateSuggestedKeywords(matched, missing);

  // Capitalize skill names for display
  const capitalize = (s) => s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    atsScore: Math.min(Math.max(atsScore, 0), 100),
    keywordMatch: kwScore,
    formatQuality: formatScore,
    readability: readabilityScore,
    experienceMatch: experienceScore,
    matchedSkills: matched.map(capitalize),
    missingKeywords: missing.map(capitalize),
    suggestedKeywords: suggestedKeywords.map(capitalize),
    strengths,
    improvements,
    recommendations,
  };
}

module.exports = { analyzeResume };
