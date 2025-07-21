interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface UserProfileData {
  gradeLevel: string;
  learningGoals: string[];
  preferredSubjects: string[];
  studyTime: string;
  difficultyPreference: string;
}

export function validateUserProfile(data: any): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!data.gradeLevel || typeof data.gradeLevel !== 'string') {
    errors.push('Grade level is required and must be a string');
  }

  if (!Array.isArray(data.learningGoals) || data.learningGoals.length === 0) {
    errors.push('Learning goals are required and must be a non-empty array');
  }

  if (!Array.isArray(data.preferredSubjects) || data.preferredSubjects.length === 0) {
    errors.push('Preferred subjects are required and must be a non-empty array');
  }

  if (!data.studyTime || typeof data.studyTime !== 'string') {
    errors.push('Study time is required and must be a string');
  }

  if (!data.difficultyPreference || typeof data.difficultyPreference !== 'string') {
    errors.push('Difficulty preference is required and must be a string');
  }

  // Validate grade level options
  const validGradeLevels = [
    'Elementary (K-5)',
    'Middle School (6-8)',
    'High School (9-12)',
    'College/University',
    'Graduate School',
    'Professional/Adult'
  ];

  if (data.gradeLevel && !validGradeLevels.includes(data.gradeLevel)) {
    errors.push('Invalid grade level');
  }

  // Validate difficulty preference
  const validDifficulties = ['Beginner', 'Intermediate', 'Advanced', 'Adaptive'];
  if (data.difficultyPreference && !validDifficulties.includes(data.difficultyPreference)) {
    errors.push('Invalid difficulty preference');
  }

  // Validate array contents
  if (Array.isArray(data.learningGoals)) {
    const invalidGoals = data.learningGoals.filter((goal: any) => typeof goal !== 'string');
    if (invalidGoals.length > 0) {
      errors.push('All learning goals must be strings');
    }
  }

  if (Array.isArray(data.preferredSubjects)) {
    const invalidSubjects = data.preferredSubjects.filter((subject: any) => typeof subject !== 'string');
    if (invalidSubjects.length > 0) {
      errors.push('All preferred subjects must be strings');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}