import React, { useMemo, useState } from 'react';

const AdminDashboard = () => {
  const guardOptions = ['Alex Mercer', 'Naomi Fox', 'Rico Hayes', 'Sara Knight'];
  const postOptions = ['Gate 1', 'Control Tower', 'Main Lobby', 'West Perimeter'];

  const [shifts, setShifts] = useState([
    {
      id: 1,
      guard: 'Alex Mercer',
      post: 'Main Lobby',
      date: '2026-07-14',
      start: '07:00',
      end: '15:00',
    },
    {
      id: 2,
      guard: 'Naomi Fox',
      post: 'Gate 1',
      date: '2026-07-14',
      start: '10:00',
      end: '18:00',
    },
    {
      id: 3,
      guard: 'Rico Hayes',
      post: 'Control Tower',
      date: '2026-07-15',
      start: '08:00',
      end: '16:00',
    },
    {
      id: 4,
      guard: 'Sara Knight',
      post: 'West Perimeter',
      date: '2026-07-16',
      start: '12:00',
      end: '20:00',
    },
  ]);

  const [formData, setFormData] = useState({
    guard: guardOptions[0],
    post: postOptions[0],
    date: '2026-07-14',
    start: '08:00',
    end: '16:00',
  });

  const [validationError, setValidationError] = useState('');
  const [conflictsAvoided, setConflictsAvoided] = useState(0);

  const totalPostsActive = useMemo(() => new Set(shifts.map((shift) => shift.post)).size, [shifts]);
  const totalGuardsScheduled = useMemo(() => new Set(shifts.map((shift) => shift.guard)).size, [shifts]);

  const sortedWeekShifts = useMemo(() => {
    return [...shifts].sort((a, b) => {
      if (a.date === b.date) {
        return a.start.localeCompare(b.start);
      }
      return a.date.localeCompare(b.date);
    });
  }, [shifts]);

  const toMinutes = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };

  const hasOverlap = (a, b) => {
    return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const candidate = {
      guard: formData.guard,
      post: formData.post,
      date: formData.date,
      start: formData.start,
      end: formData.end,
    };

    if (candidate.start >= candidate.end) {
      setValidationError('End time must be after start time. Please adjust the schedule.');
      return;
    }

    const conflict = shifts.find((shift) => {
      if (shift.date !== candidate.date) return false;
      if (shift.guard === candidate.guard || shift.post === candidate.post) {
        return hasOverlap(shift, candidate);
      }
      return false;
    });

    if (conflict) {
      const subject = conflict.guard === candidate.guard ? 'Guard' : 'Security post';
      const identity = conflict.guard === candidate.guard ? candidate.guard : candidate.post;
      const details = conflict.guard === candidate.guard
        ? `${candidate.guard} is already assigned to ${conflict.post} on ${conflict.date} from ${conflict.start} to ${conflict.end}.`
        : `${candidate.post} is already booked by ${conflict.guard} on ${conflict.date} from ${conflict.start} to ${conflict.end}.`;

      setValidationError(
        `Schedule conflict detected: ${subject} double-booked. ${details}`,
      );
      setConflictsAvoided((count) => count + 1);
      return;
    }

    setShifts((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...candidate,
      },
    ]);
    setValidationError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Manager Dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-100">Guard Schedule Planning</h1>
              <p className="mt-2 max-w-2xl text-slate-400">Track active posts, guard assignments, and avoid booking conflicts in real time.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950 px-5 py-4 text-right">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Active planning window</p>
              <p className="mt-1 text-2xl font-semibold text-sky-300">Week of July 14–20</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.6fr_1.4fr]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">Quick Metrics</h2>
                <p className="mt-2 text-slate-400">Immediate visibility into schedule health and capacity.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Posts Active</p>
                <p className="mt-3 text-4xl font-semibold text-slate-100">{totalPostsActive}</p>
                <p className="mt-2 text-sm text-slate-400">Unique posts with confirmed staffing.</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Guards Scheduled</p>
                <p className="mt-3 text-4xl font-semibold text-slate-100">{totalGuardsScheduled}</p>
                <p className="mt-2 text-sm text-slate-400">Distinct guards assigned for the week.</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Conflicts Avoided</p>
                <p className="mt-3 text-4xl font-semibold text-emerald-400">{conflictsAvoided}</p>
                <p className="mt-2 text-sm text-slate-400">Blocked double-bookings during scheduling.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-100">Create New Shift</h2>
              <p className="mt-2 text-slate-400">Use the form below to add a shift and safeguard against booking conflicts.</p>
            </div>
            {validationError && (
              <div className="mb-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                <p className="font-semibold text-red-100">Validation error</p>
                <p className="mt-2 leading-6">{validationError}</p>
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Guard
                  <select
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                    value={formData.guard}
                    onChange={(event) => setFormData((prev) => ({ ...prev, guard: event.target.value }))}
                  >
                    {guardOptions.map((guard) => (
                      <option key={guard} value={guard}>{guard}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Security Post
                  <select
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                    value={formData.post}
                    onChange={(event) => setFormData((prev) => ({ ...prev, post: event.target.value }))}
                  >
                    {postOptions.map((post) => (
                      <option key={post} value={post}>{post}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-slate-300">
                  Date
                  <input
                    type="date"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                    value={formData.date}
                    onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Start Time
                  <input
                    type="time"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                    value={formData.start}
                    onChange={(event) => setFormData((prev) => ({ ...prev, start: event.target.value }))}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  End Time
                  <input
                    type="time"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                    value={formData.end}
                    onChange={(event) => setFormData((prev) => ({ ...prev, end: event.target.value }))}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="rounded-3xl bg-slate-950 px-4 py-3 text-sm text-slate-400 shadow-inner shadow-slate-950/20">
                  Scheduled shifts: <span className="font-semibold text-slate-200">{shifts.length}</span>
                </div>
                <button
                  type="submit"
                  className="rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  Add Shift
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Weekly Schedule Matrix</h2>
              <p className="mt-2 text-slate-400">Review guard coverage and open conflict exposure at a glance.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 px-4 py-3 text-sm text-slate-300">
              {sortedWeekShifts.length} shifts this week
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {sortedWeekShifts.map((shift) => (
              <div key={shift.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.7)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{shift.date}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-100">{shift.guard}</h3>
                    <p className="mt-1 text-sm text-slate-400">{shift.post}</p>
                  </div>
                  <span className="rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-sky-300">{shift.start} – {shift.end}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Post</p>
                    <p className="mt-2 font-medium text-slate-100">{shift.post}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Guard</p>
                    <p className="mt-2 font-medium text-slate-100">{shift.guard}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
