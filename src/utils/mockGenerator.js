/**
 * Generate fresh random mock resumes that do NOT overlap with an existing set.
 * Structure matches mockResumes.js exactly.
 */

const firstNames = [
  'John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura',
  'Robert', 'Emma', 'Daniel', 'Olivia', 'James', 'Sophia', 'William', 'Isabella', 'Joseph', 'Mia',
  'Ethan', 'Ava', 'Lucas', 'Charlotte', 'Mason', 'Amelia', 'Logan', 'Harper', 'Aiden', 'Evelyn',
  'Liam', 'Ella', 'Noah', 'Grace', 'Benjamin', 'Chloe', 'Henry', 'Lily', 'Sebastian', 'Zoe'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Green'
];

const roles = [
  'Software Engineer', 'Senior React Developer', 'Backend Developer', 'Data Scientist',
  'Product Manager', 'UX Designer', 'DevOps Engineer', 'QA Tester', 'System Analyst',
  'Marketing Specialist', 'HR Manager', 'Full Stack Developer', 'Mobile Developer',
  'Cloud Architect', 'AI/ML Engineer', 'Security Analyst', 'Database Administrator',
  'Technical Lead', 'Scrum Master', 'Business Analyst'
];

const allSkills = {
  tech: ['React', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'AWS', 'Docker', 'Kubernetes', 'SQL',
         'MongoDB', 'Next.js', 'TypeScript', 'GraphQL', 'Redis', 'SAP', 'Vue.js', 'Angular',
         'PostgreSQL', 'Firebase', 'TensorFlow', 'PyTorch', 'Rust', 'Swift', 'Kotlin'],
  design: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX Research',
           'InVision', 'Principle', 'Framer', 'Canva'],
  soft: ['Leadership', 'Communication', 'Agile', 'Scrum', 'Problem Solving', 'Mentoring',
         'Team Player', 'Critical Thinking', 'Project Management', 'Negotiation']
};

const educationLevels = ["Bachelor's Degree", "Bachelor's Degree", "Master's Degree", "PhD"];

/**
 * @param {number} count - Number of resumes to generate
 * @param {Array} existingCandidates - Currently loaded candidates to avoid duplicates
 * @returns {Array} - New unique mock resumes
 */
export const generateMockResumes = (count = 100, existingCandidates = []) => {
  // Build a Set of existing names for O(1) lookup
  const existingNames = new Set(existingCandidates.map(c => c.name));
  const usedNames = new Set();

  const candidates = [];
  let attempts = 0;
  const maxAttempts = count * 10; // Safety limit to avoid infinite loop

  while (candidates.length < count && attempts < maxAttempts) {
    attempts++;

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;

    // Skip if name already exists in the old set OR in the current new batch
    if (existingNames.has(fullName) || usedNames.has(fullName)) {
      continue;
    }

    usedNames.add(fullName);

    const role = roles[Math.floor(Math.random() * roles.length)];
    const exp = Math.floor(Math.random() * 15) + 1;
    const education = educationLevels[Math.floor(Math.random() * educationLevels.length)];

    // Give everyone a mix of all skills so Software Engineers can have UI/UX design skills too
    let pool = [...allSkills.tech, ...allSkills.design, ...allSkills.soft];

    // Shuffle and pick random skills
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedSkills = shuffled.slice(0, Math.floor(Math.random() * 5) + 4);

    candidates.push({
      id: `RAND-${Date.now().toString(36)}-${candidates.length + 1}`.toUpperCase(),
      name: fullName,
      currentRole: role,
      yearsOfExperience: exp,
      skills: selectedSkills,
      education,
      summary: `Experienced ${role} with ${exp} years in the industry. Passionate about delivering high quality work and continuous learning.`,
    });
  }

  return candidates;
};
