import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, ListTodo, Camera, CheckCircle, Package, Loader2, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../../components/NotificationsPanel';

const API = 'http://localhost:8089';

/** Parse a MySQL JSON column value back to a plain display string. */
function parseJsonField(raw: any): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
    if (Array.isArray(parsed)) return parsed.join(', ');
    if (typeof parsed === 'object') return Object.values(parsed).join(', ');
  } catch { /* legacy plain text */ }
  return String(raw);
}

export default function TechnicianConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeJob, setActiveJob] = useState<any>(null);

  const [clockInLoading, setClockInLoading] = useState(false);

  const [signOffData, setSignOffData] = useState({ findings: '', actions: 'Standard service completed' });
  const [signOffLoading, setSignOffLoading] = useState(false);
  const [signOffError, setSignOffError] = useState('');
  const [signOffSuccess, setSignOffSuccess] = useState('');

  /**
   * Clock in: transition the job card CREATED → IN_PROGRESS via the backend start endpoint.
   * If the card is already IN_PROGRESS (e.g. technician refreshed), skip the API call.
   */
  const handleClockIn = async (job: any) => {
    setClockInLoading(true);
    try {
      if (job.status === 'CREATED') {
        const res = await axios.post(`${API}/api/jobcards/${job.jobCardId}/start`);
        const updated = res.data?.data ?? res.data;
        setJobs(prev => prev.map(j => j.jobCardId === job.jobCardId ? { ...j, ...updated, jobCardId: updated.jobId ?? updated.jobCardId ?? job.jobCardId, status: 'IN_PROGRESS' } : j));
        setActiveJob({ ...job, ...updated, jobCardId: updated.jobId ?? updated.jobCardId ?? job.jobCardId, status: 'IN_PROGRESS' });
      } else {
        setActiveJob(job);
      }
      setActiveTab('tasks');
    } catch {
      // Already IN_PROGRESS or other non-fatal error — just proceed
      setActiveJob({ ...job, status: 'IN_PROGRESS' });
      setActiveTab('tasks');
    } finally {
      setClockInLoading(false);
    }
  };

  const handleSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;
    setSignOffLoading(true);
    setSignOffError('');
    setSignOffSuccess('');
    try {
      // signedOffBy is resolved from the JWT by the backend; send user.id as a hint if available
      await axios.post(`${API}/api/jobcards/${activeJob.jobCardId}/complete`, {
        ...signOffData,
        signedOffBy: user?.id ?? null,
      });
      setSignOffSuccess('Job signed off! Billing invoice sent to Finance.');
      setJobs(jobs.map(j => j.jobCardId === activeJob.jobCardId ? { ...j, status: 'COMPLETED' } : j));
      setActiveJob(null);
      setTimeout(() => { setSignOffSuccess(''); setActiveTab('jobs'); }, 2000);
    } catch {
      setSignOffError('Failed to sign off. Please try again.');
    } finally {
      setSignOffLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    if (activeTab === 'jobs' || activeTab === 'tasks') {
      // Use the /my endpoint — returns only this technician's job cards
      // Normalize: backend entity uses 'jobId' but frontend templates reference 'jobCardId'
      axios.get(`${API}/api/jobcards/my`)
        .then(res => {
          const data: any[] = res.data.data || res.data || [];
          setJobs(data.map(j => ({ ...j, jobCardId: j.jobId ?? j.jobCardId })));
        })
        .catch(() => setError('Could not load job cards.'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'parts') {
      axios.get(`${API}/api/v1/inventory/parts`)
        .then(res => setParts(res.data))
        .catch(() => setParts([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'photos') {
      axios.get(`${API}/api/service/media`)
        .then(res => setMedia(res.data))
        .catch(() => setMedia([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'jobs', name: 'My Job Cards', icon: ListTodo },
    { id: 'tasks', name: 'Current Task', icon: Wrench },
    { id: 'photos', name: 'Findings & Photos', icon: Camera },
    { id: 'parts', name: 'Parts Log', icon: Package },
    { id: 'signoff', name: 'Sign Off', icon: CheckCircle },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-gray-950 flex-shrink-0 order-2 md:order-1 border-t md:border-t-0 md:border-r border-gray-800">
        <div className="hidden md:block p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Wrench className="w-6 h-6 mr-2 text-orange-500" />
            TechBay
          </h2>
          <p className="text-xs text-gray-400 mt-2">Tech: {user?.name || 'User'}</p>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 md:p-0 md:mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start px-2 md:px-6 py-3 md:py-4 transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-500 md:border-r-4 border-orange-500 font-medium md:bg-gray-900 bg-gray-800 rounded-lg md:rounded-none'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg md:rounded-none'
              }`}
            >
              <tab.icon className="w-6 h-6 md:w-5 md:h-5 mb-1 md:mb-0 md:mr-3" />
              <span className="text-[10px] md:text-base text-center">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto order-1 md:order-2">
        <div className="max-w-4xl mx-auto">

          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white mb-6">My Assigned Jobs</h1>
              {error && (
                <div className="flex items-center p-4 bg-red-900/40 border border-red-700 rounded-lg text-red-300">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />{error}
                </div>
              )}
              {loading ? (
                <div className="text-center text-gray-500 py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
              ) : jobs.length === 0 ? (
                <div className="text-center text-gray-500 py-8 bg-gray-800 rounded-xl border border-gray-700">
                  No active jobs assigned to you.
                </div>
              ) : jobs.map((job) => (
                <div key={job.jobCardId} className={`bg-gray-800 rounded-xl p-5 border border-gray-700 ${job.status === 'COMPLETED' ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        job.status === 'IN_PROGRESS' ? 'bg-orange-500/20 text-orange-400' :
                        job.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {job.status || 'ASSIGNED'}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">JC-{job.jobCardId}: {parseJsonField(job.workOrder?.reportedIssues) || parseJsonField(job.findings) || 'Standard Service'}</h3>
                      <p className="text-gray-400 text-sm mt-1">Appointment ID: {job.appointmentId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-300">Labor Cost</p>
                      <p className="text-lg font-bold text-orange-500">${job.laborCost?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <p className="text-gray-300 text-sm"><span className="font-bold text-gray-400">Notes: </span>{parseJsonField(job.workOrder?.reportedIssues) || parseJsonField(job.findings) || '—'}</p>
                  </div>
                  {job.status !== 'COMPLETED' && (
                    <button
                      disabled={clockInLoading}
                      onClick={() => handleClockIn(job)}
                      className={`w-full font-bold py-3 rounded-lg transition-colors disabled:opacity-50 ${activeJob?.jobCardId === job.jobCardId ? 'bg-orange-800 text-orange-200' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}
                    >
                      {clockInLoading && activeJob?.jobCardId === job.jobCardId
                        ? 'Starting...'
                        : activeJob?.jobCardId === job.jobCardId
                          ? 'Currently Clocked In'
                          : 'Clock In & Update Job'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white mb-6">Current Task Tracker</h1>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                {!activeJob ? (
                  <div className="text-center py-8">
                    <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Select a job card from "My Job Cards" to clock in.</p>
                    <button onClick={() => setActiveTab('jobs')} className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-500">
                      View My Jobs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">Active: JC-{activeJob.jobCardId}</h3>
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded font-bold">CLOCKED IN</span>
                    </div>
                    <div className="space-y-3 mt-4">
                      {['Perform multi-point inspection', 'Check fluid levels', 'Inspect brake system', 'Test drive (if applicable)', 'Document all findings'].map((task, i) => (
                        <div key={i} className="flex items-center space-x-3 text-gray-300">
                          <input type="checkbox" className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 bg-gray-900 border-gray-600" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <button onClick={() => setActiveTab('signoff')} className="bg-orange-600 text-white px-4 py-2 rounded font-bold hover:bg-orange-500">
                        Proceed to Sign Off
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white mb-6">Parts Repository</h1>
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Part Number</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {loading ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-500" /></td></tr>
                    ) : parts.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No parts available.</td></tr>
                    ) : parts.map((p: any) => (
                      <tr key={p.partId} className="hover:bg-gray-750">
                        <td className="px-6 py-4 text-sm font-medium text-white">{p.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{p.partNumber}</td>
                        <td className="px-6 py-4 text-right text-sm">
                          <button className="bg-gray-700 text-orange-500 px-3 py-1 rounded text-xs font-bold uppercase hover:bg-gray-600">Request</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white mb-6">Findings & Photos</h1>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 font-medium mb-2">Upload inspection photos</p>
                  <p className="text-gray-500 text-sm">Snap photos of worn parts or damage to attach to the job card.</p>
                  <button className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700">Browse Files</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {loading ? (
                  <p className="text-gray-500 col-span-full text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></p>
                ) : media.length === 0 ? (
                  <p className="text-gray-500 col-span-full text-center py-4">No photos uploaded yet.</p>
                ) : media.map((m: any) => (
                  <div key={m.mediaId} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="bg-gray-900 aspect-video rounded flex items-center justify-center mb-2">
                      <Camera className="text-gray-700 w-8 h-8" />
                    </div>
                    <p className="text-xs text-gray-400 truncate">{m.filename || 'Image.jpg'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'signoff' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white mb-6">Job Sign Off</h1>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">
                  {activeJob ? `Complete JC-${activeJob.jobCardId}` : 'No job selected'}
                </h3>

                {signOffSuccess && (
                  <div className="mb-4 p-3 bg-green-900/40 border border-green-700 rounded-lg text-green-300">{signOffSuccess}</div>
                )}
                {signOffError && (
                  <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300">{signOffError}</div>
                )}

                {!activeJob ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-4">You need to clock into a job first.</p>
                    <button onClick={() => setActiveTab('jobs')} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-500">
                      Go to My Jobs
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignOff} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Final Notes / Work Summary</label>
                      <textarea
                        value={signOffData.findings}
                        onChange={e => setSignOffData({ ...signOffData, findings: e.target.value })}
                        required
                        rows={4}
                        placeholder="Summarize all work performed..."
                        className="block w-full border-gray-600 bg-gray-900 text-white rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-700">
                      <input type="checkbox" required className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 bg-gray-900 border-gray-600" />
                      <span className="text-gray-300 text-sm">I certify that all work meets quality standards and safety requirements.</span>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={signOffLoading}
                        className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {signOffLoading ? 'Signing off...' : 'Sign Off & Punch Out'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id ?? undefined} theme="dark" />
          )}

        </div>
      </div>
    </div>
  );
}
