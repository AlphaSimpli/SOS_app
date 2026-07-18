/**
 * Integration Example: Express.js API for Shift Assignment
 * 
 * Demonstrates real-world usage of the shift validator in a web application
 * with HTTP endpoints for shift management.
 * 
 * Note: This is an example - requires Express.js and a database layer
 */

// ============================================================================
// HYPOTHETICAL EXPRESS.JS INTEGRATION (Pseudo-code)
// ============================================================================

/*

const express = require('express');
const {
  validateShiftAssignment,
  getGuardById,
  getPostById,
  existingShifts
} = require('./shiftValidator');

const app = express();
app.use(express.json());

// ============================================================================
// POST /api/shifts/assign
// Assign a new shift with conflict validation
// ============================================================================

app.post('/api/shifts/assign', async (req, res) => {
  try {
    const newShift = req.body;

    // Validate required fields
    if (!newShift.guardId || !newShift.postId || !newShift.startTime || !newShift.endTime) {
      return res.status(400).json({
        error: 'Missing required fields: guardId, postId, startTime, endTime'
      });
    }

    // Convert string dates to Date objects
    newShift.startTime = new Date(newShift.startTime);
    newShift.endTime = new Date(newShift.endTime);

    // Validate the shift assignment
    const validation = validateShiftAssignment(newShift, existingShifts);

    if (!validation.valid) {
      return res.status(409).json({
        error: 'Conflict detected',
        reason: validation.reason
      });
    }

    // Get guard and post details
    const guard = getGuardById(newShift.guardId);
    const post = getPostById(newShift.postId);

    if (!guard || !post) {
      return res.status(404).json({
        error: 'Guard or post not found'
      });
    }

    // Save to database (pseudo-code)
    // const saved = await db.shifts.insert(newShift);

    return res.status(201).json({
      success: true,
      message: `Assigned ${guard.name} to ${post.clientName}`,
      shift: {
        ...newShift,
        guardName: guard.name,
        postName: post.clientName
      }
    });

  } catch (error) {
    console.error('Shift assignment error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// ============================================================================
// GET /api/guards/:guardId/shifts
// Retrieve all shifts for a specific guard
// ============================================================================

app.get('/api/guards/:guardId/shifts', (req, res) => {
  try {
    const { guardId } = req.params;
    const guard = getGuardById(parseInt(guardId));

    if (!guard) {
      return res.status(404).json({ error: 'Guard not found' });
    }

    const shifts = getGuardShifts(parseInt(guardId));

    return res.json({
      guard,
      shiftCount: shifts.length,
      shifts: shifts.map(shift => ({
        ...shift,
        post: getPostById(shift.postId)
      }))
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// GET /api/posts/:postId/shifts
// Retrieve all shifts at a specific security post
// ============================================================================

app.get('/api/posts/:postId/shifts', (req, res) => {
  try {
    const { postId } = req.params;
    const post = getPostById(parseInt(postId));

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const shifts = getPostShifts(parseInt(postId));

    return res.json({
      post,
      shiftCount: shifts.length,
      coverage: shifts.length > 0 ? 'Covered' : 'Uncovered',
      shifts: shifts.map(shift => ({
        ...shift,
        guard: getGuardById(shift.guardId)
      }))
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// POST /api/shifts/validate
// Validate a shift without assigning it
// ============================================================================

app.post('/api/shifts/validate', (req, res) => {
  try {
    const testShift = {
      guardId: req.body.guardId,
      postId: req.body.postId,
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime)
    };

    const validation = validateShiftAssignment(testShift, existingShifts);

    return res.json({
      valid: validation.valid,
      reason: validation.reason || 'Shift assignment is valid'
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Shift planning API running on port 3000');
});

*/

// ============================================================================
// PRACTICAL USAGE EXAMPLES (JavaScript/Node.js)
// ============================================================================

/**
 * Example 1: Batch Assign Multiple Guards to a Date
 */
function scheduleGuardsForDate(targetDate, assignmentPlan) {
  const { validateShiftAssignment, getGuardById, getPostById, existingShifts } = require('./shiftValidator');

  const results = [];

  for (const assignment of assignmentPlan) {
    const newShift = {
      id: assignment.id,
      guardId: assignment.guardId,
      postId: assignment.postId,
      startTime: new Date(`${targetDate}T${assignment.startTime}`),
      endTime: new Date(`${targetDate}T${assignment.endTime}`),
      status: 'assigned'
    };

    const validation = validateShiftAssignment(newShift, existingShifts);
    const guard = getGuardById(assignment.guardId);
    const post = getPostById(assignment.postId);

    results.push({
      guard: guard?.name,
      post: post?.clientName,
      time: `${assignment.startTime} - ${assignment.endTime}`,
      valid: validation.valid,
      reason: validation.reason
    });
  }

  return results;
}

/**
 * Example 2: Find Available Slots for a Guard
 */
function findAvailableSlots(guardId, date, slotDuration = 8) {
  const { getGuardShifts, isTimeOverlap } = require('./shiftValidator');

  const guardShifts = getGuardShifts(guardId);
  const businessHours = { start: 8, end: 22 }; // 8 AM to 10 PM
  const availableSlots = [];

  for (let hour = businessHours.start; hour < businessHours.end; hour += slotDuration) {
    const slotStart = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`);
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 60 * 1000);

    const isAvailable = !guardShifts.some(shift =>
      isTimeOverlap(slotStart, slotEnd, shift.startTime, shift.endTime)
    );

    if (isAvailable) {
      availableSlots.push({
        start: slotStart,
        end: slotEnd,
        duration: `${hour}:00 - ${hour + slotDuration}:00`
      });
    }
  }

  return availableSlots;
}

/**
 * Example 3: Generate Schedule Report
 */
function generateScheduleReport(date) {
  const { guards, securityPosts, existingShifts, getGuardById, getPostById } = require('./shiftValidator');

  const report = {
    date,
    coverage: {},
    unassignedGuards: [],
    uncoveredPosts: []
  };

  // Check each security post
  for (const post of securityPosts) {
    const postsShifts = existingShifts.filter(
      shift =>
        shift.postId === post.id &&
        shift.status === 'assigned' &&
        new Date(shift.startTime).toDateString() === new Date(date).toDateString()
    );

    report.coverage[post.clientName] = {
      assigned: postsShifts.length,
      guards: postsShifts.map(shift => getGuardById(shift.guardId).name)
    };

    if (postsShifts.length === 0) {
      report.uncoveredPosts.push(post.clientName);
    }
  }

  // Check each guard
  for (const guard of guards) {
    const guardShifts = existingShifts.filter(
      shift =>
        shift.guardId === guard.id &&
        shift.status === 'assigned' &&
        new Date(shift.startTime).toDateString() === new Date(date).toDateString()
    );

    if (guardShifts.length === 0) {
      report.unassignedGuards.push(guard.name);
    }
  }

  return report;
}

/**
 * Example 4: Check Guard Availability for Specific Time
 */
function isGuardAvailable(guardId, startTime, endTime) {
  const { getGuardShifts, isTimeOverlap } = require('./shiftValidator');

  const guardShifts = getGuardShifts(guardId);

  return !guardShifts.some(shift =>
    isTimeOverlap(startTime, endTime, shift.startTime, shift.endTime)
  );
}

/**
 * Example 5: Conflict Resolution - Try Alternative Assignments
 */
function findAlternativeAssignment(guardId, postId, targetStart, targetEnd) {
  const { getGuardShifts, getPostShifts, getGuardById } = require('./shiftValidator');

  const guardShifts = getGuardShifts(guardId);
  const postShifts = getPostShifts(postId);

  const alternatives = {
    alternateGuards: [],
    alternatePosts: [],
    differentTimes: []
  };

  // Find guards with no conflicts
  const { guards } = require('./shiftValidator');
  for (const guard of guards) {
    if (guard.id !== guardId && getGuardShifts(guard.id).length < 5) {
      alternatives.alternateGuards.push(guard.name);
    }
  }

  // If shift is too close to guard's schedule, suggest different times
  if (guardShifts.length > 0) {
    // Find 2-hour buffer before and after existing shifts
    const shifts = guardShifts.sort((a, b) => a.endTime - b.endTime);
    const lastShift = shifts[shifts.length - 1];
    const bufferedStart = new Date(lastShift.endTime.getTime() + 2 * 60 * 60 * 1000);

    alternatives.differentTimes.push({
      suggestion: 'Later in the day',
      startTime: bufferedStart,
      endTime: new Date(bufferedStart.getTime() + (targetEnd - targetStart))
    });
  }

  return alternatives;
}

// ============================================================================
// USAGE DEMONSTRATIONS
// ============================================================================

// Demo: Schedule guards for a specific date
const schedule = scheduleGuardsForDate('2026-07-25', [
  { id: 3001, guardId: 1, postId: 101, startTime: '08:00:00', endTime: '16:00:00' },
  { id: 3002, guardId: 2, postId: 102, startTime: '16:00:00', endTime: '00:00:00' },
  { id: 3003, guardId: 3, postId: 103, startTime: '08:00:00', endTime: '16:00:00' }
]);

console.log('\n=== SCHEDULE FOR 2026-07-25 ===\n');
schedule.forEach(result => {
  const status = result.valid ? '✓' : '✗';
  console.log(`${status} ${result.guard} → ${result.post} (${result.time})`);
  if (!result.valid) console.log(`   Reason: ${result.reason}`);
});

// Demo: Find available slots for a guard
const availableSlots = findAvailableSlots(4, '2026-07-25');
console.log('\n=== AVAILABLE SHIFTS FOR GUARD 4 ON 2026-07-25 ===\n');
availableSlots.forEach(slot => {
  console.log(`✓ ${slot.duration}`);
});

// Demo: Generate schedule report
const report = generateScheduleReport('2026-07-20');
console.log('\n=== SCHEDULE REPORT FOR 2026-07-20 ===\n');
console.log('Coverage by Post:');
Object.entries(report.coverage).forEach(([post, info]) => {
  console.log(`  ${post}: ${info.assigned} guard(s) - ${info.guards.join(', ') || 'Unassigned'}`);
});

if (report.uncoveredPosts.length > 0) {
  console.log(`\n⚠️  Uncovered Posts: ${report.uncoveredPosts.join(', ')}`);
}

if (report.unassignedGuards.length > 0) {
  console.log(`\n⚠️  Unassigned Guards: ${report.unassignedGuards.join(', ')}`);
}

module.exports = {
  scheduleGuardsForDate,
  findAvailableSlots,
  generateScheduleReport,
  isGuardAvailable,
  findAlternativeAssignment
};
