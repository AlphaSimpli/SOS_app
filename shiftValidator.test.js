/**
 * Test Suite for Security Guard Shift Planning Validator
 * 
 * Demonstrates:
 * - Valid shift assignments
 * - Blocked guard double-booking attempts
 * - Blocked security post conflicts
 * - Edge cases and time boundary handling
 */

const {
  guards,
  securityPosts,
  existingShifts,
  validateShiftAssignment,
  getGuardById,
  getPostById,
  getGuardShifts,
  getPostShifts,
} = require('./shiftValidator');

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Print test result with formatting
 * @param {string} testName - Name of the test
 * @param {boolean} passed - Whether test passed
 * @param {string} details - Details about the result
 */
function printTestResult(testName, passed, details = '') {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m | ${testName}`);
  if (details) {
    console.log(`        ${details}`);
  }
}

/**
 * Print section header
 * @param {string} title - Section title
 */
function printSection(title) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(80)}\n`);
}

// ============================================================================
// TEST CASES
// ============================================================================

printSection('SECURITY GUARD SHIFT PLANNING VALIDATOR - TEST SUITE');

// Test 1: Valid shift assignment (no conflicts)
console.log('Test Suite 1: Valid Shift Assignments\n');

const validShift1 = {
  id: 2001,
  guardId: 4,
  postId: 101,
  startTime: new Date('2026-07-22T08:00:00'),
  endTime: new Date('2026-07-22T16:00:00'),
  status: 'assigned',
};

const result1 = validateShiftAssignment(validShift1, existingShifts);
printTestResult(
  'Valid Assignment: Guard 4 at Post 101 (no conflicts)',
  result1.valid,
  `Result: ${result1.valid}`
);

// Test 2: Guard double-booking (same guard, overlapping times)
console.log('\nTest Suite 2: Guard Double-Booking Prevention\n');

const doubleBookingAttempt = {
  id: 2002,
  guardId: 1,
  postId: 102,
  startTime: new Date('2026-07-20T10:00:00'),
  endTime: new Date('2026-07-20T14:00:00'),
  status: 'assigned',
};

const result2 = validateShiftAssignment(doubleBookingAttempt, existingShifts);
printTestResult(
  'Blocked: Guard 1 double-booking attempt (overlaps with shift 1001)',
  !result2.valid,
  `Reason: ${result2.reason}`
);

// Test 3: Guard overlapping at different post (still a conflict)
const differentPostSameGuard = {
  id: 2003,
  guardId: 1,
  postId: 102,
  startTime: new Date('2026-07-20T15:00:00'),
  endTime: new Date('2026-07-20T18:00:00'),
  status: 'assigned',
};

const result3 = validateShiftAssignment(differentPostSameGuard, existingShifts);
printTestResult(
  'Blocked: Guard 1 double-booking at different post (overlaps with shift 1001)',
  !result3.valid,
  `Reason: ${result3.reason}`
);

// Test 4: Security post conflict (different guards, same time, same post)
console.log('\nTest Suite 3: Security Post Conflict Prevention\n');

const postConflictAttempt = {
  id: 2004,
  guardId: 2,
  postId: 101,
  startTime: new Date('2026-07-20T12:00:00'),
  endTime: new Date('2026-07-20T18:00:00'),
  status: 'assigned',
};

const result4 = validateShiftAssignment(postConflictAttempt, existingShifts);
printTestResult(
  'Blocked: Post 101 conflict (Guard 2 overlaps with Guard 1, shift 1001)',
  !result4.valid,
  `Reason: ${result4.reason}`
);

// Test 5: Exact boundary edge case (shift starts when another ends - should be valid)
console.log('\nTest Suite 4: Boundary Edge Cases\n');

const backToBackShift = {
  id: 2005,
  guardId: 4,
  postId: 101,
  startTime: new Date('2026-07-20T16:00:00'),
  endTime: new Date('2026-07-21T00:00:00'),
  status: 'assigned',
};

const result5 = validateShiftAssignment(backToBackShift, existingShifts);
printTestResult(
  'Valid: Back-to-back shift (starts when Guard 1 shift 1001 ends at 16:00)',
  result5.valid,
  `Result: ${result5.valid} (no overlap - exact boundary is allowed)`
);

// Test 6: Invalid input handling
console.log('\nTest Suite 5: Input Validation\n');

const invalidShift = {
  guardId: 1,
  postId: 101,
  startTime: new Date('2026-07-20T10:00:00'),
  // Missing endTime
};

const result6 = validateShiftAssignment(invalidShift, existingShifts);
printTestResult(
  'Invalid: Missing endTime field',
  !result6.valid,
  `Reason: ${result6.reason}`
);

const invalidTimeOrder = {
  id: 2006,
  guardId: 4,
  postId: 101,
  startTime: new Date('2026-07-20T16:00:00'),
  endTime: new Date('2026-07-20T08:00:00'),
  status: 'assigned',
};

const result7 = validateShiftAssignment(invalidTimeOrder, existingShifts);
printTestResult(
  'Invalid: Start time after end time',
  !result7.valid,
  `Reason: ${result7.reason}`
);

// Test 7: Shift with open status (should not conflict)
console.log('\nTest Suite 6: Open Shift Handling\n');

const openShiftNoConflict = {
  id: 2007,
  guardId: 4,
  postId: 102,
  startTime: new Date('2026-07-22T12:00:00'),
  endTime: new Date('2026-07-22T14:00:00'),
  status: 'open', // Open shift - doesn't conflict
};

const result8 = validateShiftAssignment(openShiftNoConflict, existingShifts);
printTestResult(
  'Valid: Open shift at non-conflicting time with new guard',
  result8.valid,
  `Result: ${result8.valid}`
);

// Test 8: Guard with no existing shifts
console.log('\nTest Suite 7: New Guard Assignment\n');

const newGuardShift = {
  id: 2008,
  guardId: 4,
  postId: 103,
  startTime: new Date('2026-07-20T08:00:00'),
  endTime: new Date('2026-07-20T16:00:00'),
  status: 'assigned',
};

const result9 = validateShiftAssignment(newGuardShift, existingShifts);
printTestResult(
  'Valid: New guard assignment (Guard 4 at non-conflicting post)',
  result9.valid,
  `Result: ${result9.valid}`
);

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

printSection('UTILITY FUNCTION TESTS');

console.log('Test Suite 8: Data Retrieval Functions\n');

const guard1 = getGuardById(1);
printTestResult(
  'Get Guard by ID: Guard 1 retrieved',
  guard1 && guard1.name === 'John Smith',
  `Guard: ${guard1 ? guard1.name : 'Not found'}`
);

const post101 = getPostById(101);
printTestResult(
  'Get Post by ID: Post 101 retrieved',
  post101 && post101.clientName === 'Tech Corp HQ',
  `Post: ${post101 ? post101.clientName : 'Not found'}`
);

const guard1Shifts = getGuardShifts(1);
printTestResult(
  'Get Guard Shifts: Guard 1 has 2 assigned shifts',
  guard1Shifts.length === 2,
  `Shifts: ${guard1Shifts.length}`
);

const post101Shifts = getPostShifts(101);
printTestResult(
  'Get Post Shifts: Post 101 has 2 assigned shifts',
  post101Shifts.length === 2,
  `Shifts: ${post101Shifts.length}`
);

// ============================================================================
// COMPLEX SCENARIO TEST
// ============================================================================

printSection('COMPLEX REAL-WORLD SCENARIO');

console.log('Scenario: Attempting to create optimal schedule for 2026-07-22\n');

const scenario = [
  {
    shift: { id: 3001, guardId: 1, postId: 102, startTime: new Date('2026-07-22T08:00:00'), endTime: new Date('2026-07-22T16:00:00'), status: 'assigned' },
    description: 'Guard 1 at Post 102 (8am-4pm)',
  },
  {
    shift: { id: 3002, guardId: 2, postId: 103, startTime: new Date('2026-07-22T16:00:00'), endTime: new Date('2026-07-23T00:00:00'), status: 'assigned' },
    description: 'Guard 2 at Post 103 (4pm-midnight)',
  },
  {
    shift: { id: 3003, guardId: 3, postId: 101, startTime: new Date('2026-07-22T08:00:00'), endTime: new Date('2026-07-22T16:00:00'), status: 'assigned' },
    description: 'Guard 3 at Post 101 (8am-4pm)',
  },
];

console.log('Attempting assignments:');
let scenarioPassed = 0;
for (const test of scenario) {
  const result = validateShiftAssignment(test.shift, existingShifts);
  printTestResult(
    test.description,
    result.valid,
    result.valid ? 'Assignment accepted' : `Rejected: ${result.reason}`
  );
  if (result.valid) scenarioPassed++;
}

console.log(`\nScenario Result: ${scenarioPassed}/${scenario.length} shifts successfully scheduled`);

// ============================================================================
// SUMMARY
// ============================================================================

printSection('TEST SUMMARY');

console.log(`
This test suite demonstrates:

✓ Valid shift assignments without conflicts
✓ Prevention of guard double-booking (same guard, overlapping times)
✓ Prevention of security post conflicts (overlapping assignments)
✓ Edge case handling (back-to-back shifts, boundary conditions)
✓ Input validation (missing fields, invalid time ordering)
✓ Status awareness (open shifts don't trigger conflict checks)
✓ Utility functions for data retrieval

Key Implementation Details:

1. Time Overlap Logic:
   Condition: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
   - Prevents exact boundary overlap (back-to-back shifts OK)
   - Handles date/time comparisons correctly

2. Conflict Detection:
   - Guard-level: Same guardId + time overlap = conflict
   - Post-level: Same postId + time overlap = conflict
   - Only checks 'assigned' shifts (ignores 'open' shifts)

3. Data Structures:
   - Guards: id, name, email
   - SecurityPosts: id, clientName, locationAddress
   - Shifts: id, guardId, postId, startTime, endTime, status
`);
