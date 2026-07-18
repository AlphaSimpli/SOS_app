#!/usr/bin/env node

/**
 * QUICK START GUIDE - Security Guard Shift Planning Validator
 * 
 * This guide provides a quick reference for the shift planning validator module.
 */

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║     SECURITY GUARD SHIFT PLANNING VALIDATOR - QUICK START GUIDE            ║
║                                                                            ║
║     Prevents Conflicts:                                                   ║
║     ✓ Guard double-booking (overlapping shifts)                          ║
║     ✓ Security post conflicts (overlapping assignments)                  ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

PROJECT FILES
═════════════════════════════════════════════════════════════════════════════

1. shiftValidator.js (MAIN MODULE)
   └─ Core validation logic and data structures
   └─ Exports: validateShiftAssignment(), getGuardById(), getPostById(), etc.
   └─ Lines: ~400 | Size: ~15 KB

2. shiftValidator.test.js (COMPREHENSIVE TEST SUITE)
   └─ 15+ test cases covering all scenarios
   └─ Tests guard double-booking, post conflicts, edge cases
   └─ Run: node shiftValidator.test.js
   └─ Lines: ~350 | Size: ~14 KB

3. README.md (FULL DOCUMENTATION)
   └─ Detailed API documentation
   └─ Usage examples and integration patterns
   └─ Performance considerations and best practices
   └─ Lines: ~600+ | Size: ~25 KB

4. integration-examples.js (PRACTICAL EXAMPLES)
   └─ Real-world usage patterns
   └─ Functions for scheduling, reporting, conflict resolution
   └─ Express.js API examples (commented)
   └─ Lines: ~400 | Size: ~16 KB

5. QUICK-START.js (THIS FILE)
   └─ Quick reference guide
   └─ Common usage patterns
   └─ Troubleshooting tips


CORE CONCEPT: TIME OVERLAP DETECTION
═════════════════════════════════════════════════════════════════════════════

The validation uses this overlap algorithm:

    Overlaps = (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)

Examples:
  • New: 2-4 PM, Existing: 1-3 PM    → OVERLAP ✗
  • New: 2-4 PM, Existing: 3-5 PM    → OVERLAP ✗
  • New: 2-4 PM, Existing: 4-6 PM    → NO OVERLAP ✓ (back-to-back OK)
  • New: 2-4 PM, Existing: 1-2 PM    → NO OVERLAP ✓


BASIC USAGE
═════════════════════════════════════════════════════════════════════════════

const { validateShiftAssignment, existingShifts } = require('./shiftValidator');

const newShift = {
  guardId: 4,
  postId: 101,
  startTime: new Date('2026-07-22T08:00:00'),
  endTime: new Date('2026-07-22T16:00:00'),
  status: 'assigned'
};

const result = validateShiftAssignment(newShift, existingShifts);

if (result.valid) {
  console.log('✓ Shift is valid, can be assigned');
} else {
  console.log('✗ Conflict detected:', result.reason);
}


KEY VALIDATION RULES
═════════════════════════════════════════════════════════════════════════════

1. GUARD DOUBLE-BOOKING
   Rule: Same guard cannot have overlapping shifts (any location)
   Check: guardId + time overlap
   Example: Guard 1 assigned 8-4 can't be assigned 2-6, even different post

2. SECURITY POST CONFLICT
   Rule: Same post cannot have multiple guards at same time
   Check: postId + time overlap
   Example: Post 101 can't have Guard 1 and Guard 2 both 9-5

3. STATUS FILTERING
   Rule: Only 'assigned' shifts are checked for conflicts
   Note: 'open' shifts don't block assignments

4. INPUT VALIDATION
   Rule: Required fields must be present and valid
   Check: guardId, postId, startTime, endTime
   Format: startTime and endTime must be Date objects


API REFERENCE - MAIN FUNCTION
═════════════════════════════════════════════════════════════════════════════

validateShiftAssignment(newShift, existingShifts)
├─ Parameters:
│  ├─ newShift (Object)
│  │  ├─ guardId (number, required)
│  │  ├─ postId (number, required)
│  │  ├─ startTime (Date, required)
│  │  ├─ endTime (Date, required)
│  │  └─ status (string, default: 'assigned')
│  │
│  └─ existingShifts (Array)
│     └─ Array of Shift objects to check against
│
└─ Returns: { valid: boolean, reason?: string }
   └─ { valid: true } if assignment is safe
   └─ { valid: false, reason: "..." } if conflict detected


API REFERENCE - UTILITY FUNCTIONS
═════════════════════════════════════════════════════════════════════════════

getGuardById(guardId)
  Returns: Guard object or null
  Example: const guard = getGuardById(1)

getPostById(postId)
  Returns: SecurityPost object or null
  Example: const post = getPostById(101)

getGuardShifts(guardId)
  Returns: Array of assigned shifts for a guard
  Example: const shifts = getGuardShifts(1)

getPostShifts(postId)
  Returns: Array of assigned shifts at a post
  Example: const shifts = getPostShifts(101)

isTimeOverlap(newStart, newEnd, existingStart, existingEnd)
  Returns: boolean
  Example: const overlaps = isTimeOverlap(start1, end1, start2, end2)


DATA STRUCTURES
═════════════════════════════════════════════════════════════════════════════

Guard {
  id: number,
  name: string,
  email: string
}

SecurityPost {
  id: number,
  clientName: string,
  locationAddress: string
}

Shift {
  id: number,
  guardId: number,
  postId: number,
  startTime: Date,
  endTime: Date,
  status: 'assigned' | 'open'
}


COMMON PATTERNS
═════════════════════════════════════════════════════════════════════════════

Pattern 1: Validate Before Assignment
──────────────────────────────────────
const { validateShiftAssignment } = require('./shiftValidator');

const result = validateShiftAssignment(newShift, existingShifts);
if (!result.valid) {
  throw new Error(\`Cannot assign: \${result.reason}\`);
}
// Proceed with database save...


Pattern 2: Find Guard Availability
──────────────────────────────────────
const { getGuardShifts, isTimeOverlap } = require('./shiftValidator');

function isAvailable(guardId, start, end) {
  const shifts = getGuardShifts(guardId);
  return !shifts.some(s => isTimeOverlap(start, end, s.startTime, s.endTime));
}


Pattern 3: Check Post Coverage
──────────────────────────────────────
const { getPostShifts } = require('./shiftValidator');

function isPostCovered(postId, date) {
  const shifts = getPostShifts(postId);
  return shifts.some(s => 
    new Date(s.startTime).toDateString() === new Date(date).toDateString()
  );
}


Pattern 4: Batch Assign Multiple Guards
──────────────────────────────────────
const results = assignments.map(assignment => {
  const result = validateShiftAssignment(assignment, existingShifts);
  return { ...assignment, valid: result.valid, error: result.reason };
});


TESTING
═════════════════════════════════════════════════════════════════════════════

Run Full Test Suite:
  $ node shiftValidator.test.js

Test Coverage:
  ✓ Valid shift assignments (4 tests)
  ✓ Guard double-booking prevention (2 tests)
  ✓ Security post conflict prevention (1 test)
  ✓ Boundary edge cases (1 test)
  ✓ Input validation (2 tests)
  ✓ Open shift handling (1 test)
  ✓ New guard assignment (1 test)
  ✓ Utility functions (4 tests)
  ✓ Complex scenarios (3 tests)
  ──────────────────────────────
  Total: 19 tests, all passing ✓


TROUBLESHOOTING
═════════════════════════════════════════════════════════════════════════════

Q: "Guard is already assigned to shift X during this time window"
A: The guard has an overlapping shift. Check getGuardShifts(guardId)
   and find alternative times or reassign the conflicting shift.

Q: "Security post Y already has guard Z assigned during this time"
A: The post has another guard assigned at that time. Check getPostShifts(postId)
   or assign this guard to a different post/time.

Q: "Missing required field: X"
A: The shift object is missing a required property. Ensure you have:
   - guardId, postId, startTime, endTime, status

Q: "Start time must be before end time"
A: Your shift's startTime is >= endTime. Verify the shift times:
   - startTime < endTime (required)

Q: "Shift assignment appears valid but still fails"
A: Check the status of existing shifts. Only 'assigned' shifts cause conflicts.
   Verify existingShifts array contains the shifts you expect.


PERFORMANCE NOTES
═════════════════════════════════════════════════════════════════════════════

Time Complexity: O(n) where n = number of existing shifts
Space Complexity: O(1) excluding input

For systems with 1000s of shifts:
  • Consider indexing shifts by guardId and postId
  • Cache guard/post shift lists
  • Use interval trees for large datasets
  • Implement pagination for queries


INTEGRATION TIPS
═════════════════════════════════════════════════════════════════════════════

✓ Validate BEFORE inserting to database
✓ Return clear error messages to users
✓ Log conflicts for audit trail
✓ Implement retry logic with alternative times
✓ Cache guard/post data for performance
✓ Consider time zones for multi-location scheduling
✓ Add unit tests for your business logic


MOCK DATA OVERVIEW
═════════════════════════════════════════════════════════════════════════════

4 Guards (IDs: 1-4)
  • John Smith, Sarah Johnson, Michael Chen, Emma Wilson

3 Security Posts (IDs: 101-103)
  • Tech Corp HQ, Finance Bank, Hospital Center

4 Existing Shifts (demonstrating conflicts)
  • Guard 1: Post 101 (8am-4pm on 7/20), Post 103 (2pm-10pm on 7/21)
  • Guard 2: Post 102 (9am-5pm on 7/20)
  • Guard 3: Post 101 (4pm-12am on 7/21)

Use these for testing and integration development.


NEXT STEPS
═════════════════════════════════════════════════════════════════════════════

1. Review README.md for complete API documentation
2. Run test suite: node shiftValidator.test.js
3. Study integration-examples.js for real-world patterns
4. Integrate validateShiftAssignment() into your backend
5. Implement database persistence layer
6. Add user-facing shift booking UI
7. Set up monitoring/logging for conflicts


═════════════════════════════════════════════════════════════════════════════
For detailed documentation, see README.md
For integration examples, see integration-examples.js
For test cases, see shiftValidator.test.js
═════════════════════════════════════════════════════════════════════════════
`);
