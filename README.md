# Security Guard Shift Planning Validator

A robust JavaScript utility module that prevents scheduling conflicts in security guard shift-planning applications. Validates shift assignments to prevent guard double-booking and security post conflicts.

## Overview

This module ensures system integrity by preventing two critical scheduling errors:

1. **Guard Double-Booking**: Preventing the same guard from being assigned to overlapping shifts (regardless of location)
2. **Security Post Conflicts**: Ensuring no two guards are assigned to the same security post during overlapping timeframes

## Data Structures

### Guard
```javascript
{
  id: number,           // Unique identifier
  name: string,         // Guard's full name
  email: string         // Contact email
}
```

### SecurityPost
```javascript
{
  id: number,           // Unique identifier
  clientName: string,   // Client/facility name
  locationAddress: string // Physical address
}
```

### Shift
```javascript
{
  id: number,           // Unique shift identifier
  guardId: number,      // Assigned guard ID (null for open shifts)
  postId: number,       // Security post location ID
  startTime: Date,      // Shift start (ISO 8601 or Date object)
  endTime: Date,        // Shift end (ISO 8601 or Date object)
  status: string        // 'assigned' or 'open'
}
```

## Core Function: `validateShiftAssignment(newShift, existingShifts)`

### Purpose
Validates whether a new shift can be safely assigned without creating scheduling conflicts.

### Parameters
- **newShift** (Shift): The shift to validate
- **existingShifts** (Shift[]): Array of existing shifts to check against

### Returns
```javascript
{
  valid: boolean,       // true if assignment is valid
  reason?: string      // Error message if valid === false
}
```

### Validation Rules

#### 1. Guard Double-Booking Check
Prevents the same guard from having overlapping shifts:
```
IF (newShift.guardId === existingShift.guardId)
   AND (existingShift.status === 'assigned')
   AND (times overlap)
THEN Block assignment
```

#### 2. Security Post Conflict Check
Prevents overlapping assignments at the same location:
```
IF (newShift.postId === existingShift.postId)
   AND (existingShift.status === 'assigned')
   AND (times overlap)
THEN Block assignment
```

#### 3. Time Overlap Logic
Uses the standard interval overlap algorithm:
```
Overlaps = (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
```

**Key Behavior**: Back-to-back shifts are allowed. If one shift ends at 4:00 PM and another starts at 4:00 PM, they do NOT overlap.

## Usage Examples

### Example 1: Valid Assignment
```javascript
const { validateShiftAssignment, existingShifts } = require('./shiftValidator');

const newShift = {
  id: 2001,
  guardId: 4,
  postId: 101,
  startTime: new Date('2026-07-22T08:00:00'),
  endTime: new Date('2026-07-22T16:00:00'),
  status: 'assigned'
};

const result = validateShiftAssignment(newShift, existingShifts);

if (result.valid) {
  console.log('✓ Shift successfully assigned');
  // Save to database
} else {
  console.log(`✗ Assignment blocked: ${result.reason}`);
}
```

**Output:**
```
✓ Shift successfully assigned
```

### Example 2: Blocked Double-Booking
```javascript
const doubleBooking = {
  id: 2002,
  guardId: 1,  // Guard 1 already has a shift
  postId: 102,
  startTime: new Date('2026-07-20T10:00:00'),
  endTime: new Date('2026-07-20T14:00:00'),
  status: 'assigned'
};

const result = validateShiftAssignment(doubleBooking, existingShifts);

if (!result.valid) {
  console.log(`Assignment blocked: ${result.reason}`);
}
```

**Output:**
```
Assignment blocked: Guard 1 is already assigned to shift 1001 during this time window (2026-07-20T08:00:00.000Z - 2026-07-20T16:00:00.000Z)
```

### Example 3: Blocked Post Conflict
```javascript
const postConflict = {
  id: 2003,
  guardId: 2,
  postId: 101,  // Post 101 already has Guard 1 assigned
  startTime: new Date('2026-07-20T12:00:00'),
  endTime: new Date('2026-07-20T18:00:00'),
  status: 'assigned'
};

const result = validateShiftAssignment(postConflict, existingShifts);

if (!result.valid) {
  console.log(`Security post conflict: ${result.reason}`);
}
```

**Output:**
```
Security post conflict: Security post 101 already has guard 1 assigned during this time window (2026-07-20T08:00:00.000Z - 2026-07-20T16:00:00.000Z)
```

## Utility Functions

### `getGuardById(guardId)`
Retrieves guard details by ID.
```javascript
const guard = getGuardById(1);
// Returns: { id: 1, name: 'John Smith', email: 'john.smith@company.com' }
```

### `getPostById(postId)`
Retrieves security post details by ID.
```javascript
const post = getPostById(101);
// Returns: { id: 101, clientName: 'Tech Corp HQ', locationAddress: '...' }
```

### `getGuardShifts(guardId)`
Gets all assigned shifts for a guard.
```javascript
const shifts = getGuardShifts(1);
// Returns array of shifts assigned to Guard 1
```

### `getPostShifts(postId)`
Gets all assigned shifts at a security post.
```javascript
const shifts = getPostShifts(101);
// Returns array of all guard assignments at Post 101
```

### `isTimeOverlap(newStart, newEnd, existingStart, existingEnd)`
Low-level time overlap detection (exposed for custom logic).
```javascript
const overlaps = isTimeOverlap(
  new Date('2026-07-20T10:00:00'),
  new Date('2026-07-20T14:00:00'),
  new Date('2026-07-20T12:00:00'),
  new Date('2026-07-20T18:00:00')
);
// Returns: true
```

## Input Validation

The validator performs comprehensive input validation:

| Check | Error Message |
|-------|---------------|
| Missing shift object | "Invalid shift object provided" |
| Missing array for existingShifts | "Existing shifts must be an array" |
| Missing guardId | "Missing required field: guardId" |
| Missing postId | "Missing required field: postId" |
| Missing startTime | "Missing required field: startTime" |
| Missing endTime | "Missing required field: endTime" |
| startTime >= endTime | "Start time must be before end time" |
| Invalid Date objects | "Start and end times must be Date objects" |

## Implementation Details

### Time Overlap Algorithm
```
Overlaps = (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
```

Why this works:
- If new shift starts at or after existing shift ends → No overlap (valid)
- If new shift ends at or before existing shift starts → No overlap (valid)
- Otherwise → Times overlap (invalid)

### Status Filtering
Only shifts with `status: 'assigned'` are checked for conflicts. Open shifts don't prevent new assignments.

### Guard-Level Checking
A guard can only have ONE shift at a time, regardless of security post location.

### Post-Level Checking
Each security post can only have ONE guard assigned during any given time period.

## Running Tests

Execute the comprehensive test suite:
```bash
node shiftValidator.test.js
```

Test coverage includes:
- ✓ Valid shift assignments
- ✓ Guard double-booking prevention
- ✓ Security post conflict prevention
- ✓ Boundary edge cases (back-to-back shifts)
- ✓ Input validation
- ✓ Open shift handling
- ✓ Utility function operations
- ✓ Complex real-world scenarios

## Integration Example

```javascript
const {
  validateShiftAssignment,
  getGuardById,
  getPostById,
  existingShifts
} = require('./shiftValidator');

async function assignShift(newShift) {
  // Validate the shift
  const validation = validateShiftAssignment(newShift, existingShifts);
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.reason
    };
  }
  
  // Get details for confirmation
  const guard = getGuardById(newShift.guardId);
  const post = getPostById(newShift.postId);
  
  // Save to database (example)
  // await db.shifts.insert(newShift);
  
  return {
    success: true,
    message: `Assigned ${guard.name} to ${post.clientName}`,
    shift: newShift
  };
}

// Usage
const result = await assignShift({
  id: 2010,
  guardId: 4,
  postId: 103,
  startTime: new Date('2026-07-25T08:00:00'),
  endTime: new Date('2026-07-25T16:00:00'),
  status: 'assigned'
});

console.log(result);
// { success: true, message: 'Assigned Emma Wilson to Hospital Center', ... }
```

## Error Handling Best Practices

```javascript
function safeAssignShift(newShift) {
  try {
    const result = validateShiftAssignment(newShift, existingShifts);
    
    if (!result.valid) {
      return {
        code: 'CONFLICT',
        message: result.reason
      };
    }
    
    // Proceed with assignment
    return { code: 'SUCCESS' };
    
  } catch (error) {
    console.error('Validation error:', error);
    return {
      code: 'ERROR',
      message: 'Unexpected validation error'
    };
  }
}
```

## Performance Considerations

- **Time Complexity**: O(n) where n = number of existing shifts
- **Space Complexity**: O(1) excluding input
- For systems with thousands of shifts, consider:
  - Indexing shifts by guard ID and post ID
  - Caching guard/post shift lists
  - Using time-based data structures (interval trees) for large datasets

## Future Enhancements

- Support for partial/split shifts
- Break/lunch time handling
- Multi-location guards (with travel time constraints)
- Shift swap/trade logic
- Constraint satisfaction for optimal scheduling
- Integration with calendar systems

---

**Module Version**: 1.0.0  
**Last Updated**: 2026-07-18  
**Author**: Senior Backend Engineer
