interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface MemoryEntryData {
  userId: string;
  type: 'interaction' | 'preference' | 'performance' | 'feedback';
  content: any;
  metadata: {
    subject?: string;
    difficulty?: string;
    timestamp?: Date;
    context?: string;
  };
}

export function validateMemoryEntry(data: any): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('User ID is required and must be a string');
  }

  if (!data.type || typeof data.type !== 'string') {
    errors.push('Type is required and must be a string');
  }

  if (data.content === undefined || data.content === null) {
    errors.push('Content is required');
  }

  if (!data.metadata || typeof data.metadata !== 'object') {
    errors.push('Metadata is required and must be an object');
  }

  // Validate type
  const validTypes = ['interaction', 'preference', 'performance', 'feedback'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push('Invalid memory entry type');
  }

  // Validate metadata structure
  if (data.metadata) {
    if (data.metadata.subject && typeof data.metadata.subject !== 'string') {
      errors.push('Metadata subject must be a string');
    }

    if (data.metadata.difficulty && typeof data.metadata.difficulty !== 'string') {
      errors.push('Metadata difficulty must be a string');
    }

    if (data.metadata.context && typeof data.metadata.context !== 'string') {
      errors.push('Metadata context must be a string');
    }

    if (data.metadata.timestamp && !(data.metadata.timestamp instanceof Date) && typeof data.metadata.timestamp !== 'string') {
      errors.push('Metadata timestamp must be a Date or string');
    }
  }

  // Validate content based on type
  if (data.type === 'performance' && data.content) {
    if (typeof data.content.score !== 'number') {
      errors.push('Performance content must include a numeric score');
    }
  }

  if (data.type === 'interaction' && data.content) {
    if (!data.content.action || typeof data.content.action !== 'string') {
      errors.push('Interaction content must include an action string');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}