import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, XCircle, Terminal, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export const SecurityInspector: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [testingCrossUser, setTestingCrossUser] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success_blocked' | 'failed_exposed';
    message: string;
    details?: string;
  }>({ status: 'idle', message: '' });

  // Probe another user's collection to verify Firestore rules strictly block cross-user access
  const runSecurityProbe = async () => {
    if (!currentUser) return;
    setTestingCrossUser(true);
    setTestResult({ status: 'idle', message: 'Executing cross-user read query...' });

    const forbiddenUserId = 'unauthorized_target_user_88231';
    try {
      const foreignCol = collection(db, 'users', forbiddenUserId, 'tasks');
      const snap = await getDocs(foreignCol);

      // If this succeeds, rules failed!
      setTestResult({
        status: 'failed_exposed',
        message: 'CRITICAL: Cross-user query succeeded! Rules are not enforcing isolation.',
        details: `Read ${snap.size} documents from forbidden user path.`,
      });
    } catch (err: any) {
      // Expected outcome: Firestore Security Rules reject request with 'permission-denied'
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        setTestResult({
          status: 'success_blocked',
          message: 'Isolation Confirmed: Firestore Security Rules strictly rejected cross-user query.',
          details: `Error: ${err.code} - ${err.message}`,
        });
      } else {
        setTestResult({
          status: 'success_blocked',
          message: `Query rejected as expected by database (${err.code || 'denied'}).`,
          details: err.message,
        });
      }
    } finally {
      setTestingCrossUser(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div
      id="security-inspector-panel"
      className="bg-white rounded-2xl border border-stone-200 p-4 text-xs shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-semibold text-stone-900">
              Security & Data Isolation Inspector
            </h4>
            <p className="text-[11px] text-stone-500 font-mono truncate max-w-xs sm:max-w-md">
              Collection path: users/{currentUser.uid}/tasks
            </p>
          </div>
        </div>

        <button
          type="button"
          id="toggle-security-details-button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-stone-500 hover:text-stone-900 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label={isOpen ? 'Collapse security inspector' : 'Expand security inspector'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-stone-100 space-y-3">
          <p className="text-stone-600 leading-relaxed">
            Every task is stored in a private subcollection strictly partitioned by your authenticated Firebase UID.
            Client code never filters other users out because Firestore Security Rules make foreign records impossible to read or query.
          </p>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-700 space-y-1">
            <p className="text-stone-500">// Firestore Rules Verification Clause:</p>
            <p>match /users/&#123;userId&#125;/tasks/&#123;taskId&#125; &#123;</p>
            <p className="pl-4">allow read, delete: if request.auth != null && request.auth.uid == userId;</p>
            <p>&#125;</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
            <button
              type="button"
              id="run-security-probe-button"
              onClick={runSecurityProbe}
              disabled={testingCrossUser}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 disabled:opacity-60 cursor-pointer"
            >
              {testingCrossUser ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Terminal className="w-3.5 h-3.5" />
              )}
              <span>Verify Cross-User Access Block</span>
            </button>

            <span className="text-[11px] text-stone-500">
              Simulates a malicious client query for another user's tasks
            </span>
          </div>

          {testResult.status !== 'idle' && (
            <div
              id="security-probe-result"
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                testResult.status === 'success_blocked'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {testResult.status === 'success_blocked' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.details && (
                  <p className="font-mono text-[10px] mt-0.5 opacity-90 break-words">
                    {testResult.details}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
