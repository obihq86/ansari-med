import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Users,
  Plus,
  PhoneCall,
  CheckCircle,
  Clock,
  Settings,
  Download,
  AlertCircle,
  FileSpreadsheet,
  RotateCcw,
  Volume2,
  Calendar,
  Lock,
  ChevronDown,
  Trash2,
  UserCheck,
  ShieldCheck,
  Activity,
  Layers,
  PhoneForwarded,
  UserX,
  XCircle,
  LogIn,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';

const STORAGE_PREFIX = 'scanqueue_clinic_';
const TODAY_KEY = new Date().toISOString().split('T')[0];
const AUDIT_STORAGE_KEY = `${STORAGE_PREFIX}audit_${TODAY_KEY}`;
const HISTORY_STORAGE_KEY = `${STORAGE_PREFIX}history_v4`;
const TEAM_STORAGE_KEY = `${STORAGE_PREFIX}team_members_v2`;
const AUTH_SESSION_KEY = `${STORAGE_PREFIX}device_session_v1`;
const SAVED_CREDENTIALS_KEY = `${STORAGE_PREFIX}remembered_creds_v1`;

const DEFAULT_TEAM_MEMBERS = [
  { id: 'STAFF-01', name: 'কাউন্টার ১ (Counter 1)', role: 'Receptionist', pin: '1111', color: 'bg-emerald-600', isAdmin: false },
  { id: 'STAFF-02', name: 'কাউন্টার ২ (Counter 2)', role: 'Receptionist', pin: '2222', color: 'bg-blue-600', isAdmin: false },
  { id: 'STAFF-03', name: 'সহকারী ডেস্ক (Assistant)', role: 'Coordinator', pin: '3333', color: 'bg-purple-600', isAdmin: false },
  { id: 'STAFF-04', name: 'ডক্টর সহকারী (Doctor Asst.)', role: 'Clinical Staff', pin: '4444', color: 'bg-amber-600', isAdmin: false },
  { id: 'ADMIN-01', name: 'প্রধান অ্যাডমিন (Admin)', role: 'Administrator', pin: 'Admin123', color: 'bg-rose-700', isAdmin: true }
];

const AGE_PRESETS = [
  { label: '6m', years: 0, months: 6 },
  { label: '1y', years: 1, months: 0 },
  { label: '2y', years: 2, months: 0 },
  { label: '3y', years: 3, months: 0 },
  { label: '4y', years: 4, months: 0 },
  { label: '5y', years: 5, months: 0 },
  { label: '6y', years: 6, months: 0 },
  { label: '8y', years: 8, months: 0 },
  { label: '10y', years: 10, months: 0 },
  { label: '12y', years: 12, months: 0 },
  { label: '15y', years: 15, months: 0 },
  { label: '20y', years: 20, months: 0 },
  { label: '25y', years: 25, months: 0 },
  { label: '30y', years: 30, months: 0 },
  { label: '40y', years: 40, months: 0 },
  { label: '50y', years: 50, months: 0 },
  { label: '60y', years: 60, months: 0 },
  { label: '70y', years: 70, months: 0 }
];

const TRANSLATIONS = {
  bn: {
    appTitle: 'রোগী সিরিয়াল ম্যানেজমেন্ট',
    clinicName: 'আনছারী মেডিকেল হল',
    doctorTitle: 'মোঃ উবায়দুল হক (ডিপ্লোমা ইন মেডিকেল ফ্যাকাল্টি)',
    navRegister: 'নতুন সিরিয়াল',
    navQueue: 'লাইভ সিরিয়াল তালিকা',
    navReports: 'দৈনিক রিপোর্ট',
    navTeam: 'টিম প্যানেল',
    navTests: 'সিস্টেম টেস্ট (১২টি)',
    patientName: 'রোগীর পূর্ণ নাম *',
    namePlaceholder: 'উদা: রহিমা খাতুন / তানভীর হাসান',
    ageYears: 'বছর (Years)',
    ageMonths: 'মাস (Months)',
    addBtn: 'রোগী নিবন্ধন ও সিরিয়াল ইস্যু করুন',
    quickPresets: 'দ্রুত বয়স নির্বাচন (Quick Presets):',
    serialBadgeEven: 'শিশু কোটা (< ৪ বছর)',
    serialBadgeOdd: 'সাধারণ কোটা (≥ ৪ বছর)',
    callNextBtn: 'পরবর্তী রোগী ডাকুন',
    completedBtn: 'দেখা সম্পন্ন',
    callBtn: 'ডাকুন',
    waitingTag: 'অপেক্ষমান',
    calledTag: 'ডাকা হয়েছে',
    servingTag: 'দেখা হচ্ছে',
    completedTag: 'সম্পন্ন',
    cancelledTag: 'বাতিল',
    sortSerial: 'Serial',
    sortTime: 'সময় অনুযায়ী (Time)'
  },
  en: {
    appTitle: 'Patient Serial Management',
    clinicName: 'Ansari Medical Hall',
    doctorTitle: 'Md. Obaidul Haque (Diploma in Medical Faculty)',
    navRegister: 'New Serial',
    navQueue: 'Live Queue',
    navReports: 'Daily Reports',
    navTeam: 'Team Panel',
    navTests: 'System Tests (12)',
    patientName: 'Patient Full Name *',
    namePlaceholder: 'e.g. Rahima Khatun / Tanvir Hasan',
    ageYears: 'Years',
    ageMonths: 'Months',
    addBtn: 'Register Patient & Issue Serial',
    quickPresets: 'Quick Age Presets:',
    serialBadgeEven: 'Child Queue (< 4 yrs)',
    serialBadgeOdd: 'General Queue (≥ 4 yrs)',
    callNextBtn: 'Call Next Patient',
    completedBtn: 'Mark Completed',
    callBtn: 'Call',
    waitingTag: 'Waiting',
    calledTag: 'Called',
    servingTag: 'In Consult',
    completedTag: 'Completed',
    cancelledTag: 'Cancelled',
    sortSerial: 'Serial',
    sortTime: 'By Time'
  }
};

export default function App() {
  const [lang, setLang] = useState('bn');
  const t = TRANSLATIONS[lang];

  // Team & Member Auth States
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(TEAM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(m => (m.id === 'ADMIN-01' && m.pin === '9999' ? { ...m, pin: 'Admin123' } : m));
      }
    } catch {}
    return DEFAULT_TEAM_MEMBERS;
  });

  // Saved credentials state for "Remember Me"
  const [savedCreds, setSavedCreds] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_CREDENTIALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Device session state: Requires login unless already authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const session = localStorage.getItem(AUTH_SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return !!parsed?.id;
      }
    } catch {}
    return false;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const session = localStorage.getItem(AUTH_SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.id) return parsed;
      }
    } catch {}
    return null;
  });

  // Login Form States
  const [loginUserId, setLoginUserId] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_CREDENTIALS_KEY);
      if (saved) return JSON.parse(saved).userId || 'STAFF-01';
    } catch {}
    return 'STAFF-01';
  });
  const [loginPassword, setLoginPassword] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_CREDENTIALS_KEY);
      if (saved) return JSON.parse(saved).password || '';
    } catch {}
    return '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_CREDENTIALS_KEY);
      return !!saved;
    } catch {}
    return true;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Navigation tab
  const [activeTab, setActiveTab] = useState('queue');

  const [selectedSwitchUser, setSelectedSwitchUser] = useState(DEFAULT_TEAM_MEMBERS[0]?.id || 'STAFF-01');
  const [teamPinInput, setTeamPinInput] = useState('');
  const [switchError, setSwitchError] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPin, setNewMemberPin] = useState('');

  // Modification & PIN modal states
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPin, setEditPin] = useState('');

  const [pinPromptMember, setPinPromptMember] = useState(null);
  const [modalPinInput, setModalPinInput] = useState('');
  const [modalPinError, setModalPinError] = useState('');

  // Patient Registration Form States
  const [patientName, setPatientName] = useState('');
  const [ageYears, setAgeYears] = useState(25);
  const [ageMonths, setAgeMonths] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState(null);

  // Queue Data & Daily Storage States
  const [patients, setPatients] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}patients_${TODAY_KEY}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('SERIAL');
  const [timeSortDir, setTimeSortDir] = useState('asc');
  const [avgServiceMinutes, setAvgServiceMinutes] = useState(3);
  const [currentTimeTick, setCurrentTimeTick] = useState(Date.now());
  const [selectedDate, setSelectedDate] = useState(TODAY_KEY);

  // Broadcast Channel for Multi-Mobile Sync
  const channelRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeTick(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channelRef.current = new BroadcastChannel('scanqueue_clinic_sync_channel');
        channelRef.current.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SYNC_PATIENTS') {
            setPatients(payload);
          } else if (type === 'SYNC_TEAM') {
            setTeamMembers(payload);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel not supported or restricted', err);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  // Persist patients and archive history
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}patients_${TODAY_KEY}`, JSON.stringify(patients));

      const existingHist = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '{}');
      existingHist[TODAY_KEY] = patients;
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(existingHist));
    } catch {}
  }, [patients]);

  const broadcastPatientsUpdate = (updatedList) => {
    setPatients(updatedList);
    try {
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'SYNC_PATIENTS', payload: updatedList });
      }
    } catch {}
  };

  const broadcastTeamUpdate = (updatedTeam) => {
    setTeamMembers(updatedTeam);
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updatedTeam));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'SYNC_TEAM', payload: updatedTeam });
      }
    } catch {}
  };

  const switchActiveUser = (userId, pin, isBypass = false) => {
    const member = teamMembers.find(m => m.id === userId);
    if (!member) return false;

    const isAdminActive = currentUser?.isAdmin || currentUser?.role === 'Administrator';

    if (!isAdminActive && !isBypass) {
      if (!pin || member.pin !== pin) {
        setSwitchError(lang === 'bn' ? 'সঠিক ৪-সংখ্যার লগইন কোড (PIN) দিন!' : 'Invalid login PIN entered!');
        return false;
      }
    }

    setCurrentUser(member);
    try {
      localStorage.setItem('scanqueue_active_user', JSON.stringify(member));
    } catch {}
    setSwitchError('');
    setTeamPinInput('');
    return true;
  };

  const handleAddNewMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newId = `STAFF-${String(teamMembers.length + 1).padStart(2, '0')}`;
    const newMember = {
      id: newId,
      name: newMemberName.trim(),
      role: 'Staff',
      pin: newMemberPin.trim() || '1234',
      color: 'bg-teal-600',
      isAdmin: false
    };
    const updated = [...teamMembers, newMember];
    broadcastTeamUpdate(updated);
    setNewMemberName('');
    setNewMemberPin('');
  };

  // Device Initial Login Handler
  const handleInitialLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const member = teamMembers.find(m => m.id === loginUserId);
    if (!member) {
      setLoginError(lang === 'bn' ? 'সঠিক ইউজার আইডি নির্বাচন করুন।' : 'Please select a valid User ID.');
      return;
    }

    if (member.pin !== loginPassword) {
      setLoginError(lang === 'bn' ? 'ভুল পাসওয়ার্ড / পিন কোড! সঠিক কোড দিন।' : 'Incorrect Password / PIN! Please try again.');
      return;
    }

    // Save session to device
    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(member));
      if (rememberMe) {
        localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({ userId: loginUserId, password: loginPassword }));
      } else {
        localStorage.removeItem(SAVED_CREDENTIALS_KEY);
      }
    } catch {}

    setCurrentUser(member);
    setIsAuthenticated(true);
    setLoginError('');
  };

  // Logout Handler
  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch {}
    setIsAuthenticated(false);
    setCurrentUser(null);
    if (!rememberMe) {
      setLoginPassword('');
    }
  };

  const handleStartEdit = (member) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditRole(member.role || 'Staff');
    setEditPin(member.pin || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMember || !editName.trim()) return;

    const updated = teamMembers.map(m => {
      if (m.id === editingMember.id) {
        return {
          ...m,
          name: editName.trim(),
          role: editRole.trim(),
          pin: editPin.trim() || m.pin
        };
      }
      return m;
    });

    broadcastTeamUpdate(updated);

    if (currentUser.id === editingMember.id) {
      const updatedActive = updated.find(m => m.id === currentUser.id);
      if (updatedActive) {
        setCurrentUser(updatedActive);
        try {
          localStorage.setItem('scanqueue_active_user', JSON.stringify(updatedActive));
        } catch {}
      }
    }

    setEditingMember(null);
  };

  const handleDeleteMember = (memberId) => {
    if (teamMembers.length <= 1) {
      return;
    }
    const updated = teamMembers.filter(m => m.id !== memberId);
    broadcastTeamUpdate(updated);

    if (currentUser.id === memberId) {
      setCurrentUser(updated[0]);
      try {
        localStorage.setItem('scanqueue_active_user', JSON.stringify(updated[0]));
      } catch {}
    }
    setEditingMember(null);
  };

  const handleOpenLoginModal = (member) => {
    const isAdminActive = currentUser?.isAdmin || currentUser?.role === 'Administrator';
    if (isAdminActive) {
      switchActiveUser(member.id, '', true);
      return;
    }
    setPinPromptMember(member);
    setModalPinInput('');
    setModalPinError('');
  };

  const handleConfirmModalLogin = (e) => {
    e.preventDefault();
    if (!pinPromptMember) return;
    if (modalPinInput !== pinPromptMember.pin) {
      setModalPinError(lang === 'bn' ? 'ভুল লগইন কোড! সঠিক পিন দিন।' : 'Incorrect PIN! Please try again.');
      return;
    }
    switchActiveUser(pinPromptMember.id, modalPinInput);
    setPinPromptMember(null);
    setModalPinInput('');
    setModalPinError('');
  };

  const calculateTotalAgeYears = (y, m) => {
    return Number(y) + Number(m) / 12;
  };

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!patientName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const totalAge = calculateTotalAgeYears(ageYears, ageMonths);
    const isChildUnder4 = totalAge < 4.0;

    let nextSerial = 0;
    if (isChildUnder4) {
      const existingEvenSerials = patients
        .filter(p => p.isChildUnder4)
        .map(p => p.serialNumber);
      const maxEven = existingEvenSerials.length > 0 ? Math.max(...existingEvenSerials) : 0;
      nextSerial = maxEven >= 2 ? maxEven + 2 : 2;
    } else {
      const existingOddSerials = patients
        .filter(p => !p.isChildUnder4)
        .map(p => p.serialNumber);
      const maxOdd = existingOddSerials.length > 0 ? Math.max(...existingOddSerials) : -1;
      nextSerial = maxOdd >= 1 ? maxOdd + 2 : 1;
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPatient = {
      id: `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      serialNumber: nextSerial,
      name: patientName.trim(),
      ageYears: Number(ageYears),
      ageMonths: Number(ageMonths),
      totalAge: totalAge,
      isChildUnder4: isChildUnder4,
      status: 'WAITING',
      registeredAt: timeFormatted,
      registeredTimestamp: Date.now(),
      registeredBy: currentUser.id,
      registeredByName: currentUser.name,
      lastModifiedBy: currentUser.id,
      lastModifiedByName: currentUser.name
    };

    const updated = [...patients, newPatient];
    broadcastPatientsUpdate(updated);

    setNewlyCreatedPatient(newPatient);
    setPatientName('');
    setIsSubmitting(false);
  };

  const handleCallNextPatient = () => {
    const waitingPatients = patients.filter(p => p.status === 'WAITING');
    if (waitingPatients.length === 0) return;

    // Numerical order strictly by serial number (#1, #2, #3, ...)
    const sortedWaiting = [...waitingPatients].sort((a, b) => a.serialNumber - b.serialNumber);
    const nextPatient = sortedWaiting[0];

    const updated = patients.map(p => {
      if (p.id === nextPatient.id) {
        return {
          ...p,
          status: 'CALLED',
          calledTimestamp: Date.now(),
          lastModifiedBy: currentUser.id,
          lastModifiedByName: currentUser.name
        };
      }
      return p;
    });

    broadcastPatientsUpdate(updated);
  };

  const handleUpdateStatus = (patientId, newStatus) => {
    const updated = patients.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: newStatus,
          lastModifiedBy: currentUser.id,
          lastModifiedByName: currentUser.name
        };
      }
      return p;
    });
    broadcastPatientsUpdate(updated);
  };

  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (filterStatus === 'CHILD') {
      result = result.filter(p => p.isChildUnder4);
    } else if (filterStatus === 'GENERAL') {
      result = result.filter(p => !p.isChildUnder4);
    } else if (filterStatus === 'WAITING') {
      result = result.filter(p => p.status === 'WAITING');
    } else if (filterStatus === 'CALLED') {
      result = result.filter(p => p.status === 'CALLED');
    } else if (filterStatus === 'COMPLETED') {
      result = result.filter(p => p.status === 'COMPLETED');
    }

    if (sortBy === 'SERIAL') {
      result.sort((a, b) => a.serialNumber - b.serialNumber);
    } else if (sortBy === 'TIME') {
      result.sort((a, b) => {
        if (timeSortDir === 'asc') {
          return a.registeredTimestamp - b.registeredTimestamp;
        }
        return b.registeredTimestamp - a.registeredTimestamp;
      });
    }

    return result;
  }, [patients, filterStatus, sortBy, timeSortDir]);

  // Real-time call projection calculation
  const getProjectedCallTime = (patient) => {
    if (patient.status !== 'WAITING') {
      if (patient.status === 'CALLED') return 'বর্তমানে ডাকা হচ্ছে (Now Calling)';
      if (patient.status === 'SERVING') return 'পরামর্শ নিচ্ছেন (In Consult)';
      if (patient.status === 'COMPLETED') return 'সেবা সম্পন্ন (Completed)';
      return 'স্থগিত / বাতিল (Cancelled)';
    }

    const waitingSorted = patients
      .filter(p => p.status === 'WAITING')
      .sort((a, b) => a.serialNumber - b.serialNumber);
    
    const index = waitingSorted.findIndex(p => p.id === patient.id);
    const waitMins = Math.max(0, index) * avgServiceMinutes;
    const projectedDate = new Date(Date.now() + waitMins * 60000);
    const clockStr = projectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `সম্ভাব্য ডাক: ${clockStr} (~${waitMins} মিনিট)`;
  };

  const nextEligiblePatient = useMemo(() => {
    const waiting = patients.filter(p => p.status === 'WAITING');
    if (waiting.length === 0) return null;
    return [...waiting].sort((a, b) => a.serialNumber - b.serialNumber)[0];
  }, [patients]);

  const waitingCount = patients.filter(p => p.status === 'WAITING').length;

  // -------------------------------------------------------------
  // INITIAL DEVICE LOGIN GATEWAY SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="bg-emerald-800 text-white p-6 sm:p-7 text-center relative">
            <button
              onClick={() => setLang(l => (l === 'bn' ? 'en' : 'bn'))}
              className="absolute top-4 right-4 px-2.5 py-1 text-xs font-bold rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 transition cursor-pointer"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>
            <div className="w-14 h-14 bg-emerald-700/80 rounded-2xl border border-emerald-500/40 mx-auto flex items-center justify-center shadow-inner mb-3">
              <Lock className="w-7 h-7 text-emerald-200" />
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight">{t.appTitle}</h1>
            <p className="text-xs text-emerald-100 font-medium mt-1">{t.clinicName}</p>
            <p className="text-[11px] text-emerald-200/80 mt-0.5">{t.doctorTitle}</p>
          </div>

          {/* Login Form Body */}
          <div className="p-6 sm:p-7 space-y-5">
            <div className="text-center">
              <h2 className="text-base font-black text-slate-900">
                {lang === 'bn' ? 'ডিভাইস লগইন পোর্টাল' : 'Device Authentication'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'bn'
                  ? 'সিরিয়াল ও রোগীর তথ্য অ্যাক্সেস করতে আপনার ইউজার আইডি ও পাসওয়ার্ড দিন'
                  : 'Enter your User ID and password to access the clinic system on this device'}
              </p>
            </div>

            <form onSubmit={handleInitialLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'ইউজার আইডি নির্বাচন করুন *' : 'Select User ID *'}
                </label>
                <select
                  value={loginUserId}
                  onChange={(e) => setLoginUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition cursor-pointer"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.id} — {m.name} ({m.role}) {m.isAdmin ? '★ ADMIN' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'পাসওয়ার্ড / পিন কোড *' : 'Password / PIN Code *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder={lang === 'bn' ? 'পাসওয়ার্ড অথবা পিন লিখুন' : 'Enter password or PIN'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError('');
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember User ID & Password Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    {lang === 'bn' ? 'আইডি ও পাসওয়ার্ড মনে রাখুন' : 'Remember ID & Password on this device'}
                  </span>
                </label>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'bn' ? 'লগইন করুন' : 'Log In to System'}</span>
              </button>
            </form>

            <div className="pt-2 text-center border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                {lang === 'bn'
                  ? 'সিস্টেমটি প্রতিটি আলাদা ডিভাইসে সুরক্ষিতভাবে ব্যবহারের উপযোগী'
                  : 'Secure multi-device authentication for clinic staff'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans pb-16">
      {/* Top Header */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight">{t.appTitle}</h1>
              <p className="text-xs text-emerald-100 font-medium">
                {t.clinicName} • {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right Identity & Nav controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-700/60 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${currentUser?.isAdmin ? 'bg-rose-400' : 'bg-emerald-400'} animate-pulse`}></span>
              <span className="font-bold">{currentUser?.name}</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-black">{currentUser?.id}</span>
            </div>

            <button
              onClick={() => setLang(l => l === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 transition cursor-pointer"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>

            {/* Logout button to end session on this device */}
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600/80 hover:bg-rose-600 border border-rose-400/40 text-white transition cursor-pointer flex items-center gap-1"
              title={lang === 'bn' ? 'ডিভাইস থেকে লগআউট করুন' : 'Log out from this device'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-emerald-700/50 pt-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-2 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'register' ? 'bg-slate-100 text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.navRegister}</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'queue' ? 'bg-slate-100 text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.navQueue} ({patients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-slate-100 text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.navReports}</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-2 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'team' ? 'bg-slate-100 text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.navTeam}</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 py-5 w-full flex-1">
        {}
        {activeTab === 'register' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">{t.navRegister}</h2>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'শুধুমাত্র নাম ও বয়স নির্বাচন করে নতুন সিরিয়াল তৈরি করুন' : 'Enter name and select age to issue serial'}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                {currentUser?.id}
              </span>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.patientName}</label>
                <input
                  type="text"
                  required
                  placeholder={t.namePlaceholder}
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Age Selection (Years & Months) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.ageYears}</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="110"
                      value={ageYears}
                      onChange={(e) => setAgeYears(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.ageMonths}</label>
                  <select
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    {[...Array(12).keys()].map(m => (
                      <option key={m} value={m}>{m} {lang === 'bn' ? 'মাস' : 'Month'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Age Sequence Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">{t.quickPresets}</label>
                <div className="flex flex-wrap gap-1.5">
                  {AGE_PRESETS.map((p) => {
                    const isSelected = ageYears === p.years && ageMonths === p.months;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setAgeYears(p.years);
                          setAgeMonths(p.months);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Serial Category Preview Indicator */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">
                  {lang === 'bn' ? 'বরাদ্দকৃত কোটা ক্যাটাগরি:' : 'Assigned Queue Category:'}
                </span>
                {calculateTotalAgeYears(ageYears, ageMonths) < 4.0 ? (
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">
                    {t.serialBadgeEven} (Even Serials)
                  </span>
                ) : (
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                    {t.serialBadgeOdd} (Odd Serials)
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !patientName.trim()}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addBtn}</span>
              </button>
            </form>

            {/* Token Confirmation Card */}
            {newlyCreatedPatient && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="text-xs font-bold text-emerald-800">
                    {lang === 'bn' ? 'নিবন্ধন সফল হয়েছে!' : 'Serial Issued Successfully!'}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {newlyCreatedPatient.registeredAt}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{newlyCreatedPatient.name}</h3>
                    <p className="text-xs font-semibold text-slate-600">
                      বয়স: {newlyCreatedPatient.ageYears}y {newlyCreatedPatient.ageMonths}m
                    </p>
                  </div>
                  <div className="text-center px-4 py-1.5 bg-emerald-700 text-white rounded-xl shadow-xs">
                    <span className="block text-[10px] font-semibold uppercase">Token</span>
                    <span className="text-2xl font-black">#{newlyCreatedPatient.serialNumber}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {/* Control Bar: Filters, Sort, Average Time, and Call Next Patient */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterStatus === 'ALL'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    সকল ({patients.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('WAITING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterStatus === 'WAITING'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    অপেক্ষমান ({waitingCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus('CHILD')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterStatus === 'CHILD'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    শিশু কোটা ({patients.filter(p => p.isChildUnder4).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('GENERAL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filterStatus === 'GENERAL'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    সাধারণ ({patients.filter(p => !p.isChildUnder4).length})
                  </button>
                </div>

                {/* Prominent Call Next Patient Button */}
                <button
                  onClick={handleCallNextPatient}
                  disabled={waitingCount === 0}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.callNextBtn}</span>
                  <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded-md text-[10px]">
                    {waitingCount}
                  </span>
                </button>
              </div>

              {/* Secondary Controls: Sorting & Avg Service Time Selection */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">বাছাই (Sort):</span>
                  <button
                    onClick={() => setSortBy('SERIAL')}
                    className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer transition ${
                      sortBy === 'SERIAL'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {t.sortSerial}
                  </button>
                  <button
                    onClick={() => {
                      if (sortBy === 'TIME') {
                        setTimeSortDir(d => d === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('TIME');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer transition ${
                      sortBy === 'TIME'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {t.sortTime} {sortBy === 'TIME' ? (timeSortDir === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">গড় সেবা সময়:</span>
                  <select
                    value={avgServiceMinutes}
                    onChange={(e) => setAvgServiceMinutes(parseInt(e.target.value))}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value={1}>১ মিনিট</option>
                    <option value={3}>৩ মিনিট</option>
                    <option value={4}>৪ মিনিট</option>
                    <option value={5}>৫ মিনিট</option>
                    <option value={7}>৭ মিনিট</option>
                    <option value={10}>১০ মিনিট</option>
                    <option value={15}>১৫ মিনিট</option>
                    <option value={20}>২০ মিনিট</option>
                    <option value={30}>৩০ মিনিট</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Patient Cards List */}
            {filteredPatients.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">বর্তমানে কোনো রোগীর সিরিয়াল নিবন্ধিত নেই</p>
                <p className="text-xs mt-1">"নতুন সিরিয়াল" ট্যাব থেকে রোগী যোগ করুন</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredPatients.map(patient => {
                  const isCalled = patient.status === 'CALLED';
                  const isServing = patient.status === 'SERVING';
                  const isCompleted = patient.status === 'COMPLETED';

                  return (
                    <div
                      key={patient.id}
                      className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCalled
                          ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-400'
                          : isServing
                          ? 'border-blue-400 bg-blue-50/40'
                          : isCompleted
                          ? 'border-slate-200 opacity-60 bg-slate-50/60'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Serial Badge & Name */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shrink-0 ${
                            patient.isChildUnder4
                              ? 'bg-blue-600 text-white'
                              : 'bg-emerald-700 text-white'
                          }`}
                        >
                          <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-80">
                            {patient.isChildUnder4 ? 'CHILD' : 'GEN'}
                          </span>
                          <span className="text-lg leading-tight">#{patient.serialNumber}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-black text-slate-900">{patient.name}</h3>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {patient.ageYears}y {patient.ageMonths}m
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{patient.registeredAt}</span>
                            </span>
                            <span>•</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                              নিবন্ধনে: {patient.registeredBy}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Potential Real-Time Waiting Projection */}
                      <div className="text-xs font-bold text-slate-700 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                        <span className="text-emerald-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{getProjectedCallTime(patient)}</span>
                        </span>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap justify-end">
                        {patient.status === 'WAITING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(patient.id, 'CALLED')}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                              title="রোগীকে ডাকুন"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{t.callBtn}</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(patient.id, 'ABSENT')}
                              className="px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs rounded-xl border border-orange-300 transition flex items-center gap-1 cursor-pointer"
                              title="অনুপস্থিত হিসেবে চিহ্নিত করুন"
                            >
                              <UserX className="w-3 h-3 text-orange-700" />
                              <span>Absent</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(patient.id, 'CANCELLED')}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                              title="সিরিয়াল বাতিল করুন"
                            >
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}

                        {patient.status === 'CALLED' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(patient.id, 'COMPLETED')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                              title="রোগী দেখা সম্পন্ন করুন"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{t.completedBtn}</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(patient.id, 'CALLED')}
                              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                              title="পুনরায় ডাকুন"
                            >
                              <PhoneForwarded className="w-3 h-3 text-amber-700" />
                              <span>Recall</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(patient.id, 'ABSENT')}
                              className="px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs rounded-xl border border-orange-300 transition flex items-center gap-1 cursor-pointer"
                              title="অনুপস্থিত হিসেবে চিহ্নিত করুন"
                            >
                              <UserX className="w-3 h-3 text-orange-700" />
                              <span>Absent</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(patient.id, 'CANCELLED')}
                              className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                              title="সিরিয়াল বাতিল করুন"
                            >
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}

                        {patient.status === 'SERVING' && (
                          <button
                            onClick={() => handleUpdateStatus(patient.id, 'COMPLETED')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t.completedBtn}</span>
                          </button>
                        )}

                        {patient.status === 'ABSENT' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-200">
                              অনুপস্থিত (Absent)
                            </span>
                            <button
                              onClick={() => handleUpdateStatus(patient.id, 'WAITING')}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="পুনরায় অপেক্ষমান তালিকায় যুক্ত করুন"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>পুনরায় অপেক্ষমান</span>
                            </button>
                          </div>
                        )}

                        {patient.status === 'CANCELLED' && (
                          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200">
                            বাতিল (Cancelled)
                          </span>
                        )}

                        {patient.status === 'COMPLETED' && (
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                            সেবা সম্পন্ন
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'reports' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">{t.navReports}</h2>
                <p className="text-xs text-slate-500">তারিখ নির্বাচন করে পূর্ববর্তী দিনের হিস্ট্রি ও রিপোর্ট দেখুন</p>
              </div>

              {/* Date Filter & Today Button */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  onClick={() => setSelectedDate(TODAY_KEY)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  আজ (Today)
                </button>
              </div>
            </div>

            {/* Summary statistics for the selected date */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">মোট রোগী</span>
                <span className="text-xl font-black text-slate-900">{patients.length}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[11px] font-bold text-blue-700 block">শিশু (&lt; ৪ বছর)</span>
                <span className="text-xl font-black text-blue-900">{patients.filter(p => p.isChildUnder4).length}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-700 block">সাধারণ (≥ ৪ বছর)</span>
                <span className="text-xl font-black text-emerald-900">{patients.filter(p => !p.isChildUnder4).length}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[11px] font-bold text-amber-700 block">সেবা সম্পন্ন</span>
                <span className="text-xl font-black text-amber-900">{patients.filter(p => p.status === 'COMPLETED').length}</span>
              </div>
            </div>

            {/* CSV Export Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  const headers = 'Serial,Name,AgeYears,AgeMonths,Category,Status,RegisteredAt,RegisteredBy\n';
                  const rows = patients
                    .map(p => `${p.serialNumber},"${p.name}",${p.ageYears},${p.ageMonths},${p.isChildUnder4 ? 'Child' : 'General'},${p.status},${p.registeredAt},${p.registeredBy}`)
                    .join('\n');
                  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `Clinic_Report_${selectedDate}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV রিপোর্ট ডাউনলোড করুন</span>
              </button>
            </div>
          </div>
        )}

        {}
        {activeTab === 'team' && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Active User Switcher Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-700" />
                    <span>{t.navTeam} ও সক্রিয় ইউজার আইডি</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    প্রতিটি নিবন্ধনে স্বয়ংক্রিয়ভাবে সক্রিয় মেম্বারের ইউজার আইডি রেকর্ড হবে
                  </p>
                </div>

                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center ${currentUser?.color || 'bg-emerald-600'}`}>
                    #{currentUser?.id?.replace('STAFF-', '')?.replace('ADMIN-', 'AD')}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 block uppercase">বর্তমান সক্রিয় মেম্বার</span>
                    <span className="text-xs font-black text-slate-900">{currentUser?.name} ({currentUser?.id})</span>
                  </div>
                </div>
              </div>

              {/* Quick Switch Dropdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">অন্য স্টাফ আইডিতে সুইচ করুন:</span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={selectedSwitchUser}
                    onChange={(e) => setSelectedSwitchUser(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.id} — {m.name} ({m.role}) {m.isAdmin ? '★ ADMIN' : ''}
                      </option>
                    ))}
                  </select>

                  <input
                    type="password"
                    maxLength="20"
                    placeholder="পাসওয়ার্ড / পিন"
                    value={teamPinInput}
                    onChange={(e) => setTeamPinInput(e.target.value)}
                    className="w-full sm:w-36 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />

                  <button
                    onClick={() => switchActiveUser(selectedSwitchUser, teamPinInput)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    সুইচ নিশ্চিত করুন
                  </button>
                </div>

                {switchError && (
                  <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{switchError}</span>
                  </p>
                )}
              </div>

              {/* Registered Team Members List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>নিবন্ধিত টিম মেম্বারদের তালিকা:</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    (মডিফাই করতে সেটিংস আইকন চাপুন • লগইন করতে পিন প্রয়োজন)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {teamMembers.map(member => {
                    const isActive = currentUser?.id === member.id;
                    return (
                      <div
                        key={member.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          isActive
                            ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${member.color || 'bg-slate-600'}`}>
                            #{member.id.replace('STAFF-', '').replace('ADMIN-', 'AD')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-slate-900">{member.name}</span>
                              {isActive && (
                                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                  ACTIVE
                                </span>
                              )}
                              {member.isAdmin && (
                                <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-rose-200">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block">
                              {member.id} • {member.role}
                            </span>
                          </div>
                        </div>

                        {/* Actions: Modify / Settings button and Login with PIN */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(member)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-slate-200 hover:border-emerald-300 cursor-pointer"
                            title="মেম্বার তথ্য ও পিন মডিফাই করুন"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>

                          {!isActive && (
                            <button
                              onClick={() => handleOpenLoginModal(member)}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200 cursor-pointer flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3 text-emerald-700" />
                              <span>লগইন</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Team Member Form */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">নতুন টিম মেম্বার যুক্ত করুন:</span>
                <form onSubmit={handleAddNewMember} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="স্টাফের নাম (যেমন: আরিফ রহমান)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <input
                    type="password"
                    maxLength="6"
                    placeholder="৪-সংখ্যার পিন"
                    value={newMemberPin}
                    onChange={(e) => setNewMemberPin(e.target.value)}
                    className="w-full sm:w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    যুক্ত করুন
                  </button>
                </form>
              </div>
            </div>

            {/* Edit / Modify Member Modal */}
            {editingMember && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {editingMember.id}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">মেম্বার তথ্য মডিফাই করুন</h3>
                        <p className="text-[11px] text-slate-500">নাম, পদবি ও লগইন পিন পরিবর্তন করুন</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingMember(null)}
                      className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">স্টাফের নাম:</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ভূমিকা / পদবি (Role):</label>
                      <input
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">লগইন পিন (PIN):</label>
                      <input
                        type="password"
                        maxLength="6"
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(editingMember.id)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                      >
                        মুছে ফেলুন
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMember(null)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          সংরক্ষণ করুন
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Secure PIN Prompt Modal for Logging in */}
            {pinPromptMember && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-xs w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900">নিরাপদ লগইন (PIN Code)</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      <strong>{pinPromptMember.name} ({pinPromptMember.id})</strong> আইডিতে প্রবেশ করতে পিন কোড দিন
                    </p>
                  </div>

                  <form onSubmit={handleConfirmModalLogin} className="space-y-3">
                    <div>
                      <input
                        type="password"
                        autoFocus
                        maxLength="20"
                        value={modalPinInput}
                        onChange={(e) => {
                          setModalPinInput(e.target.value);
                          setModalPinError('');
                        }}
                        placeholder="••••••••"
                        className="w-full text-center text-lg tracking-wider font-black py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                      {modalPinError && (
                        <p className="text-xs font-bold text-rose-600 text-center mt-1.5 flex items-center justify-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{modalPinError}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPinPromptMember(null);
                          setModalPinInput('');
                          setModalPinError('');
                        }}
                        className="w-1/2 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        লগইন করুন
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}