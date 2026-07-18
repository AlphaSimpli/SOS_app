/**
 * Security Guard Shift Planning Utility Module
 * 
 * Prevents scheduling conflicts:
 * - Guard double-booking (overlapping shifts for same guard)
 * - Security post conflicts (overlapping assignments at same location)
 */

// ============================================================================
// DATA STRUCTURES & MOCK DATA
// ============================================================================

/**
 * Guards - Security personnel
 * @typedef {Object} Guard
 * @property {number} id - Unique identifier
 * @property {string} name - Guard's full name
 * @property {string} email - Contact email
 */
const guards = [
  { id: 1, name: 'John Smith', email: 'john.smith@company.com' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
  { id: 3, name: 'Michael Chen', email: 'michael.chen@company.com' },
  { id: 4, name: 'Emma Wilson', email: 'emma.wilson@company.com' },
];

/**
 * SecurityPosts - Physical locations requiring security coverage
 * @typedef {Object} SecurityPost
 * @property {number} id - Unique identifier
 * @property {string} clientName - Client/facility name
 * @property {string} locationAddress - Physical address
 */
const securityPosts = [
  { id: 101, clientName: 'Tech Corp HQ', locationAddress: '123 Innovation Drive, San Francisco, CA' },
  { id: 102, clientName: 'Finance Bank', locationAddress: '456 Wall Street, New York, NY' },
  { id: 103, clientName: 'Hospital Center', locationAddress: '789 Medical Plaza, Boston, MA' },
];

/**
 * Shifts - Assigned or open security shifts
 * @typedef {Object} Shift
 * @property {number} id - Unique shift identifier
 * @property {number} guardId - Assigned guard (null if open)
 * @property {number} postId - Security post location
 * @property {Date} startTime - Shift start timestamp
 * @property {Date} endTime - Shift end timestamp
 * @property {string} status - 'assigned' or 'open'
 */
const existingShifts = [
  {
    id: 1001,
    guardId: 1,
    postId: 101,
    startTime: new Date('2026-07-20T08:00:00'),
    endTime: new Date('2026-07-20T16:00:00'),
    status: 'assigned',
  },
  {
    id: 1002,
    guardId: 2,
    postId: 102,
    startTime: new Date('2026-07-20T09:00:00'),
    endTime: new Date('2026-07-20T17:00:00'),
    status: 'assigned',
  },
  {
    id: 1003,
    guardId: 1,
    postId: 103,
    startTime: new Date('2026-07-21T14:00:00'),
    endTime: new Date('2026-07-21T22:00:00'),
    status: 'assigned',
  },
  {
    id: 1004,
    guardId: 3,
    postId: 101,
    startTime: new Date('2026-07-21T16:00:00'),
    endTime: new Date('2026-07-22T00:00:00'),
    status: 'assigned',
  },
];

// ============================================================================
// CORE VALIDATION LOGIC
// ============================================================================

/**
 * Check if two time intervals overlap
 * Overlapping condition: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
 * 
 * @param {Date} newStart - New shift start time
 * @param {Date} newEnd - New shift end time
 * @param {Date} existingStart - Existing shift start time
 * @param {Date} existingEnd - Existing shift end time
 * @returns {boolean} True if intervals overlap
 */
function isTimeOverlap(newStart, newEnd, existingStart, existingEnd) {
  return newStart < existingEnd && newEnd > existingStart;
}

/**
 * Validate shift assignment against conflicts
 * 
 * Checks for two types of conflicts:
 * 1. Guard Double-Booking: Same guard with overlapping shifts
 * 2. Post Conflict: Same post with overlapping guards
 * 
 * @param {Shift} newShift - The shift to validate
 * @param {Shift[]} existingShifts - Array of existing shifts to check against
 * @returns {Object} { valid: boolean, reason?: string }
 */
function validateShiftAssignment(newShift, existingShifts) {
  // Validate input parameters
  if (!newShift || typeof newShift !== 'object') {
    return {
      valid: false,
      reason: 'Invalid shift object provided',
    };
  }

  if (!Array.isArray(existingShifts)) {
    return {
      valid: false,
      reason: 'Existing shifts must be an array',
    };
  }

  // Check required fields
  const requiredFields = ['guardId', 'postId', 'startTime', 'endTime'];
  for (const field of requiredFields) {
    if (newShift[field] === undefined || newShift[field] === null) {
      return {
        valid: false,
        reason: `Missing required field: ${field}`,
      };
    }
  }

  // Validate time ordering
  if (newShift.startTime >= newShift.endTime) {
    return {
      valid: false,
      reason: 'Start time must be before end time',
    };
  }

  // Validate dates are valid
  if (!(newShift.startTime instanceof Date) || !(newShift.endTime instanceof Date)) {
    return {
      valid: false,
      reason: 'Start and end times must be Date objects',
    };
  }

  // Check for guard double-booking
  for (const existingShift of existingShifts) {
    // Skip if not the same guard or shift not assigned
    if (existingShift.guardId !== newShift.guardId || existingShift.status !== 'assigned') {
      continue;
    }

    // Check time overlap
    if (isTimeOverlap(newShift.startTime, newShift.endTime, existingShift.startTime, existingShift.endTime)) {
      return {
        valid: false,
        reason: `Guard ${newShift.guardId} is already assigned to shift ${existingShift.id} during this time window (${existingShift.startTime.toISOString()} - ${existingShift.endTime.toISOString()})`,
      };
    }
  }

  // Check for security post conflicts
  for (const existingShift of existingShifts) {
    // Skip if not the same post or shift not assigned
    if (existingShift.postId !== newShift.postId || existingShift.status !== 'assigned') {
      continue;
    }

    // Check time overlap
    if (isTimeOverlap(newShift.startTime, newShift.endTime, existingShift.startTime, existingShift.endTime)) {
      return {
        valid: false,
        reason: `Security post ${newShift.postId} already has guard ${existingShift.guardId} assigned during this time window (${existingShift.startTime.toISOString()} - ${existingShift.endTime.toISOString()})`,
      };
    }
  }

  // All validations passed
  return {
    valid: true,
  };
}

/**
 * Get guard details by ID
 * @param {number} guardId - Guard identifier
 * @returns {Guard|null} Guard object or null if not found
 */
function getGuardById(guardId) {
  return guards.find((guard) => guard.id === guardId) || null;
}

/**
 * Get security post details by ID
 * @param {number} postId - Post identifier
 * @returns {SecurityPost|null} SecurityPost object or null if not found
 */
function getPostById(postId) {
  return securityPosts.find((post) => post.id === postId) || null;
}

/**
 * Get all shifts for a specific guard
 * @param {number} guardId - Guard identifier
 * @returns {Shift[]} Array of shifts assigned to the guard
 */
function getGuardShifts(guardId) {
  return existingShifts.filter((shift) => shift.guardId === guardId && shift.status === 'assigned');
}

/**
 * Get all shifts for a specific security post
 * @param {number} postId - Post identifier
 * @returns {Shift[]} Array of shifts at the post
 */
function getPostShifts(postId) {
  return existingShifts.filter((shift) => shift.postId === postId && shift.status === 'assigned');
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Data
  guards,
  securityPosts,
  existingShifts,

  // Validation
  validateShiftAssignment,

  // Utilities
  isTimeOverlap,
  getGuardById,
  getPostById,
  getGuardShifts,
  getPostShifts,
};
