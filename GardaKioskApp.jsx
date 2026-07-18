import React, { useState } from 'react';

const GardaKioskApp = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [clockedInIds, setClockedInIds] = useState([]);
  const [claimedIds, setClaimedIds] = useState([]);

  const scheduleShifts = [
    {
      id: 1,
      client: 'North River Plaza',
      address: '2200 River Pkwy, Suite 420',
      hours: '08:00 - 16:00',
      note: 'Verify perimeter on arrival and check interior doors every hour.',
    },
    {
      id: 2,
      client: 'Downtown Transit Hub',
      address: '125 Central Ave',
      hours: '16:00 - 00:00',
      note: 'Assist with guest screening and monitor east entrance cameras.',
    },
    {
      id: 3,
      client: 'Harbor Logistics Center',
      address: '550 Marine Dr.',
      hours: '00:00 - 08:00',
      note: 'Complete nightly lock check and submit status report at 04:00.',
    },
  ];

  const availableShifts = [
    {
      id: 101,
      client: 'Westfield Commerce Park',
      address: '880 Commerce St.',
      hours: '06:00 - 14:00',
      note: 'Morning asset escort and access point coverage.',
    },
    {
      id: 102,
      client: 'Summit Medical Plaza',
      address: '33 Healthway Blvd.',
      hours: '14:00 - 22:00',
      note: 'Support visitor screening and maintain lobby security posture.',
    },
    {
      id: 103,
      client: 'Eastside Data Vault',
      address: '1900 Secure Ln.',
      hours: '22:00 - 06:00',
      note: 'Guard the main gate and review all delivery manifests.',
    },
  ];

  const profile = {
    name: 'Liam Carter',
    title: 'Senior Guard',
    badge: 'GW-2739',
    location: 'Montreal, QC',
    status: 'Active',
    qualifications: [
      { name: 'First Aid', complete: true },
      { name: 'Fire Response', complete: true },
      { name: 'Access Control', complete: true },
      { name: 'Customer Service', complete: false },
    ],
  };

  const toggleClock = (id) => {
    if (clockedInIds.includes(id)) {
      setClockedInIds((prev) => prev.filter((item) => item !== id));
    } else {
      setClockedInIds((prev) => [...prev, id]);
    }
  };

  const claimShift = (id) => {
    if (!claimedIds.includes(id)) {
      setClaimedIds((prev) => [...prev, id]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-xs rounded-[40px] border border-slate-800 bg-slate-900 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.9)] overflow-hidden">
        <div className="bg-slate-900 px-5 pt-5 pb-3 border-b border-slate-800">
          <div className="mx-auto mb-3 h-2.5 w-24 rounded-full bg-slate-700" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">GardaWorld Kiosk</p>
              <h1 className="mt-2 text-xl font-semibold text-slate-50">Guard Console</h1>
            </div>
            <div className="rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-300">Mobile</div>
          </div>
        </div>

        <div className="min-h-[520px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-5 py-5">
          <div className="mb-4 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-[inset_0_1px_0_rgba(148,163,184,0.06)]">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Today</span>
              <span>12 JUL 2026</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Shift Status</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">Ready for deployment</p>
              </div>
              <div className="rounded-3xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Secure</div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`w-full rounded-3xl border px-4 py-3 text-left text-sm font-medium transition ${
                activeTab === 'schedule'
                  ? 'border-sky-400 bg-slate-800 text-slate-100 shadow-[0_10px_30px_-20px_rgba(56,189,248,0.6)]'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              My Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('available')}
              className={`w-full rounded-3xl border px-4 py-3 text-left text-sm font-medium transition ${
                activeTab === 'available'
                  ? 'border-sky-400 bg-slate-800 text-slate-100 shadow-[0_10px_30px_-20px_rgba(56,189,248,0.6)]'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Available Shifts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full rounded-3xl border px-4 py-3 text-left text-sm font-medium transition ${
                activeTab === 'profile'
                  ? 'border-sky-400 bg-slate-800 text-slate-100 shadow-[0_10px_30px_-20px_rgba(56,189,248,0.6)]'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Profile
            </button>
          </div>

          <div className="mt-6 rounded-[32px] bg-slate-950 px-4 py-5 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.9)] border border-slate-800">
            {activeTab === 'schedule' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Upcoming shifts</p>
                    <h2 className="text-lg font-semibold text-slate-100">Assigned Today</h2>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-sky-300">3 shifts</span>
                </div>
                <div className="space-y-4">
                  {scheduleShifts.map((shift) => {
                    const isClockedIn = clockedInIds.includes(shift.id);
                    return (
                      <div key={shift.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-slate-100">{shift.client}</h3>
                            <p className="mt-1 text-sm text-slate-400">{shift.address}</p>
                          </div>
                          <span className="rounded-2xl bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.15em] text-sky-300">
                            {shift.hours}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-300">{shift.note}</p>
                        <button
                          type="button"
                          onClick={() => toggleClock(shift.id)}
                          className={`mt-5 w-full rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                            isClockedIn
                              ? 'bg-red-500 text-slate-950 hover:bg-red-400'
                              : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                          }`}
                        >
                          {isClockedIn ? 'Clock Out' : 'Clock In'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'available' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Shift pool</p>
                    <h2 className="text-lg font-semibold text-slate-100">Open Opportunities</h2>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-sky-300">{availableShifts.length} open</span>
                </div>
                <div className="space-y-4">
                  {availableShifts.map((shift) => {
                    const isClaimed = claimedIds.includes(shift.id);
                    return (
                      <div key={shift.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-slate-100">{shift.client}</h3>
                            <p className="mt-1 text-sm text-slate-400">{shift.address}</p>
                          </div>
                          <span className="rounded-2xl bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.15em] text-sky-300">
                            {shift.hours}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-300">{shift.note}</p>
                        <button
                          type="button"
                          onClick={() => claimShift(shift.id)}
                          disabled={isClaimed}
                          className={`mt-5 w-full rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                            isClaimed
                              ? 'cursor-not-allowed bg-slate-700 text-slate-400'
                              : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                          }`}
                        >
                          {isClaimed ? 'Claimed' : 'Claim Shift'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Guard</p>
                      <h2 className="text-xl font-semibold text-slate-100">{profile.name}</h2>
                      <p className="mt-1 text-sm text-slate-400">{profile.title} • Badge {profile.badge}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                      {profile.status}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                    <div className="rounded-3xl bg-slate-950 px-3 py-3 border border-slate-800">
                      <p className="text-slate-400">Base</p>
                      <p className="mt-1 font-semibold text-slate-100">{profile.location}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 px-3 py-3 border border-slate-800">
                      <p className="text-slate-400">Next Review</p>
                      <p className="mt-1 font-semibold text-slate-100">Aug 08</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Qualifications</p>
                      <h3 className="text-base font-semibold text-slate-100">Current Status</h3>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-sky-300">
                      {profile.qualifications.filter((item) => item.complete).length}/{profile.qualifications.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {profile.qualifications.map((qualification) => (
                      <div key={qualification.name} className="flex items-center justify-between rounded-3xl bg-slate-950 px-4 py-3 border border-slate-800">
                        <div>
                          <p className="font-medium text-slate-100">{qualification.name}</p>
                          <p className="text-xs text-slate-500">{qualification.complete ? 'Verified' : 'Pending'}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            qualification.complete ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {qualification.complete ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
          <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 rounded-3xl px-3 py-3 text-left transition ${
                activeTab === 'schedule' ? 'bg-slate-800 text-slate-100' : 'bg-slate-950 text-slate-500 hover:bg-slate-900'
              }`}
            >
              My Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('available')}
              className={`flex-1 rounded-3xl px-3 py-3 text-left transition ${
                activeTab === 'available' ? 'bg-slate-800 text-slate-100' : 'bg-slate-950 text-slate-500 hover:bg-slate-900'
              }`}
            >
              Available
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 rounded-3xl px-3 py-3 text-left transition ${
                activeTab === 'profile' ? 'bg-slate-800 text-slate-100' : 'bg-slate-950 text-slate-500 hover:bg-slate-900'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardaKioskApp;
