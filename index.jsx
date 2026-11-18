import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  collection
} from 'firebase/firestore';
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Upload,
  Download,
  Trash2,
  Users,
  BookOpen,
  Lock,
  LogOut,
  ChevronRight,
  Search,
  Award,
  EyeOff,
  Sparkles,
  KeyRound,
  RefreshCw,
  DoorOpen,
  Timer,
  Eye,
  Mail,
  UserCheck,
  X,
  Crown,
  UserPlus,
  UserX,
  Key
} from 'lucide-react';

// ==========================================
// 1. FIREBASE INITIALIZATION (STRICT RULES)
// ==========================================
const firebaseConfig =
  typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : { apiKey: 'demo-key', authDomain: 'demo.firebaseapp.com', projectId: 'demo-project' };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'nims-exam-portal';

// ==========================================
// 2. INITIAL SAMPLE DATA (FOR INSTANT PREVIEW)
// ==========================================
const INITIAL_TEST_ROOMS = [
  {
    id: 'room-db-01',
    testId: 'BSIT-DB-01',
    testPassword: 'NIMS#DB2026',
    topic: 'Database Systems',
    questionsPerStudent: 5,
    durationMinutes: 5,
    passingPercentage: 80,
    createdAt: Date.now()
  },
  {
    id: 'room-oop-01',
    testId: 'BSIT-OOP-01',
    testPassword: 'NIMS#OOP2026',
    topic: 'Object-Oriented Programming',
    questionsPerStudent: 5,
    durationMinutes: 5,
    passingPercentage: 80,
    createdAt: Date.now()
  }
];

const INITIAL_QUESTIONS = [
  // Topic 1: Database Systems
  {
    id: 'db-1',
    topic: 'Database Systems',
    question: 'Which normal form eliminates transitive functional dependencies?',
    options: [
      'First Normal Form (1NF)',
      'Second Normal Form (2NF)',
      'Third Normal Form (3NF)',
      'Boyce-Codd Normal Form (BCNF)'
    ],
    correctIndex: 2
  },
  {
    id: 'db-2',
    topic: 'Database Systems',
    question:
      'Which SQL command removes all records from a table without logging individual row deletions?',
    options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'],
    correctIndex: 2
  },
  {
    id: 'db-3',
    topic: 'Database Systems',
    question: 'What does the "I" in ACID properties of database transactions stand for?',
    options: ['Integrity', 'Isolation', 'Indexing', 'Immutability'],
    correctIndex: 1
  },
  {
    id: 'db-4',
    topic: 'Database Systems',
    question:
      'Which key uniquely identifies each tuple in a relation and cannot contain NULL values?',
    options: ['Foreign Key', 'Candidate Key', 'Primary Key', 'Alternate Key'],
    correctIndex: 2
  },
  {
    id: 'db-5',
    topic: 'Database Systems',
    question:
      'Which type of JOIN returns all rows from the left table and matched rows from the right table?',
    options: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'CROSS JOIN'],
    correctIndex: 1
  },
  {
    id: 'db-6',
    topic: 'Database Systems',
    question: 'An Entity-Relationship (ER) diagram represents which level of database schema?',
    options: ['Physical Schema', 'Conceptual Schema', 'Internal Schema', 'Storage Schema'],
    correctIndex: 1
  },

  // Topic 2: Object-Oriented Programming
  {
    id: 'oop-1',
    topic: 'Object-Oriented Programming',
    question:
      'Which OOP principle allows a subclass to provide a specific implementation of a method already defined in its superclass?',
    options: ['Method Overloading', 'Method Overriding', 'Encapsulation', 'Data Abstraction'],
    correctIndex: 1
  },
  {
    id: 'oop-2',
    topic: 'Object-Oriented Programming',
    question: 'Binding data and the methods that manipulate that data into a single unit is known as:',
    options: ['Polymorphism', 'Inheritance', 'Encapsulation', 'Association'],
    correctIndex: 2
  },
  {
    id: 'oop-3',
    topic: 'Object-Oriented Programming',
    question:
      'Which type of constructor is called when a new object is initialized from an existing object of the same class?',
    options: [
      'Default Constructor',
      'Parameterized Constructor',
      'Copy Constructor',
      'Static Constructor'
    ],
    correctIndex: 2
  },
  {
    id: 'oop-4',
    topic: 'Object-Oriented Programming',
    question:
      'In C++ and Java, a class that cannot be instantiated directly and is meant to be inherited is called:',
    options: ['Final Class', 'Static Class', 'Abstract Class', 'Friend Class'],
    correctIndex: 2
  },
  {
    id: 'oop-5',
    topic: 'Object-Oriented Programming',
    question: 'Runtime polymorphism is typically achieved through:',
    options: [
      'Function Overloading',
      'Operator Overloading',
      'Virtual Functions / Dynamic Dispatch',
      'Templates'
    ],
    correctIndex: 2
  },
  {
    id: 'oop-6',
    topic: 'Object-Oriented Programming',
    question: 'Which access modifier restricts member access strictly within the same class?',
    options: ['public', 'protected', 'private', 'internal'],
    correctIndex: 2
  },

  // Topic 3: Computer Networks
  {
    id: 'cn-1',
    topic: 'Computer Networks',
    question:
      'Which layer of the OSI model is responsible for logical addressing and routing packets across networks?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
    correctIndex: 1
  },
  {
    id: 'cn-2',
    topic: 'Computer Networks',
    question:
      'Which protocol is connection-oriented and guarantees reliable, ordered delivery of data packets?',
    options: ['UDP', 'IP', 'TCP', 'ICMP'],
    correctIndex: 2
  },
  {
    id: 'cn-3',
    topic: 'Computer Networks',
    question: 'What is the default subnet mask for a Class C IPv4 address?',
    options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'],
    correctIndex: 2
  },
  {
    id: 'cn-4',
    topic: 'Computer Networks',
    question: 'Which protocol translates human-readable domain names into IP addresses?',
    options: ['DHCP', 'ARP', 'DNS', 'SNMP'],
    correctIndex: 2
  },
  {
    id: 'cn-5',
    topic: 'Computer Networks',
    question: 'A MAC address is how many bits long?',
    options: ['32 bits', '48 bits', '64 bits', '128 bits'],
    correctIndex: 1
  },
  {
    id: 'cn-6',
    topic: 'Computer Networks',
    question: 'Which port number is standard for HTTPS traffic?',
    options: ['80', '21', '22', '443'],
    correctIndex: 3
  }
];

// ==========================================
// 3. HELPER UTILITIES & SMART AI PARSER
// ==========================================
const COOLDOWN_MS = 60 * 60 * 1000; // Strict 60-minute (1-hour) lock per student per Test ID

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.max(0, totalSeconds) % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Smart AI Paste Parser:
 * Parses MCQs copied directly from ChatGPT, Gemini, or plain text lists.
 */
function parseAiMcqText(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const parsedQuestions = [];
  let currentQ = null;

  const optionRegex = /^(?:[-*•]\s*)?(?:\*\*)?([A-Da-d])[\)\.\:\-]\s*(.+)$/;
  const answerRegex =
    /^(?:\*\*)?(?:Answer|Correct(?:\s+Answer)?|Ans|Key)[\s\:\-]+(?:\*\*)?([A-Da-d1-4])/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check Answer Line
    const ansMatch = line.match(answerRegex);
    if (ansMatch && currentQ) {
      const token = ansMatch[1].toUpperCase();
      const map = { A: 0, B: 1, C: 2, D: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      if (map[token] !== undefined) {
        currentQ.correctIndex = map[token];
      }
      continue;
    }

    // Check Option Line (A., B), C:, etc.)
    const optMatch = line.match(optionRegex);
    if (optMatch && currentQ && currentQ.options.length < 4) {
      let optText = optMatch[2].replace(/\*\*/g, '').trim();
      if (/\*\s*$|\(correct\)/i.test(optText)) {
        currentQ.correctIndex = currentQ.options.length;
        optText = optText.replace(/\*\s*$|\(correct\)/gi, '').trim();
      }
      currentQ.options.push(optText);
      continue;
    }

    // Pipe-delimited fallback: Question | A | B | C | D | 1-4
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 6) {
        const rawAns = parts[5].toUpperCase();
        const map = { A: 0, B: 1, C: 2, D: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
        parsedQuestions.push({
          question: parts[0],
          options: [parts[1], parts[2], parts[3], parts[4]],
          correctIndex: map[rawAns] ?? 0
        });
        currentQ = null;
        continue;
      }
    }

    // Save completed previous question before starting a new one
    if (currentQ && currentQ.options.length === 4) {
      parsedQuestions.push(currentQ);
      currentQ = null;
    }

    const cleanedQuestion = line
      .replace(/^(?:Q(?:uestion)?\s*)?\d+[\)\.\:\-]\s*/i, '')
      .replace(/\*\*/g, '')
      .trim();

    if (cleanedQuestion.length > 3) {
      currentQ = {
        question: cleanedQuestion,
        options: [],
        correctIndex: 0
      };
    }
  }

  if (currentQ && currentQ.options.length === 4) {
    parsedQuestions.push(currentQ);
  }

  return parsedQuestions;
}

// ==========================================
// 4. MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  // Firebase Auth & Firestore Sync States
  const [user, setUser] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [testRooms, setTestRooms] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Role-Based Admin Hierarchy State (stored in Firestore public/data/nims_config/power_admin)
  const [powerAdminConfig, setPowerAdminConfig] = useState(null);
  const [facultyAdmins, setFacultyAdmins] = useState([]);
  const [isAdminConfigLoaded, setIsAdminConfigLoaded] = useState(false);

  // Navigation & View Mode ('student' | 'adminLogin' | 'adminDashboard')
  const [viewMode, setViewMode] = useState('student');
  const [toastMessage, setToastMessage] = useState(null);

  // Student Portal Flow ('login' | 'registration' | 'cooldown' | 'testing' | 'result')
  const [studentStep, setStudentStep] = useState('login');
  const [studentAuthMode, setStudentAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [isAuthenticatingStudent, setIsAuthenticatingStudent] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [enteredTestId, setEnteredTestId] = useState('');
  const [enteredTestPassword, setEnteredTestPassword] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [formError, setFormError] = useState('');

  // 1-Hour Cooldown Lock States
  const [cooldownEndsAt, setCooldownEndsAt] = useState(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const [lockedPreviousResult, setLockedPreviousResult] = useState(null);

  // Active Exam Engine States
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showCheatingModal, setShowCheatingModal] = useState(false);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [activeResult, setActiveResult] = useState(null);

  // Refs for Anti-Cheating & Timer Closures
  const isTestActiveRef = useRef(false);
  const warningsRef = useRef(0);
  const testStateRef = useRef({});

  // Admin Portal States
  const [loggedInAdmin, setLoggedInAdmin] = useState(null); // { role: 'power' | 'faculty', id?, name, email, department? }
  const [initPowerName, setInitPowerName] = useState('');
  const [initPowerEmail, setInitPowerEmail] = useState('');
  const [initPowerPass, setInitPowerPass] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminTab, setAdminTab] = useState('results'); // 'results' | 'rooms' | 'questions' | 'admins'
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState(null);

  // Power Admin: Manage Faculty Admins
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubPass, setNewSubPass] = useState('');
  const [newSubDept, setNewSubDept] = useState('');
  const [resetSubId, setResetSubId] = useState(null);
  const [resetSubNewPass, setResetSubNewPass] = useState('');
  const [powerNewPassInput, setPowerNewPassInput] = useState('');

  // Admin: Create Test Room Form
  const [newRoomId, setNewRoomId] = useState('');
  const [newRoomPass, setNewRoomPass] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomQCount, setNewRoomQCount] = useState(5);
  const [newRoomDuration, setNewRoomDuration] = useState(5);
  const [newRoomPassPct, setNewRoomPassPct] = useState(80);

  // Admin: Results Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTestId, setFilterTestId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Admin: Question Bank & Smart AI Paste
  const [qEntryMode, setQEntryMode] = useState('ai'); // 'ai' | 'single'
  const [targetTopic, setTargetTopic] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [aiPasteText, setAiPasteText] = useState('');
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ==========================================
  // 5. FIREBASE AUTHENTICATION (RULE 3)
  // ==========================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Firebase Auth initialization error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 6. FIRESTORE REALTIME SYNC (RULES 1 & 2)
  // ==========================================
  useEffect(() => {
    if (!user) return;

    // 1. Sync Power Admin Config (artifacts/{appId}/public/data/nims_config/power_admin)
    const powerDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'nims_config', 'power_admin');
    const unsubPower = onSnapshot(
      powerDocRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data()?.email) {
          setPowerAdminConfig(docSnap.data());
        } else {
          setPowerAdminConfig(null);
        }
        setIsAdminConfigLoaded(true);
      },
      (err) => {
        console.error('Power Admin config sync error:', err);
        setIsAdminConfigLoaded(true);
      }
    );

    // 2. Sync Faculty Admins (artifacts/{appId}/public/data/faculty_admins)
    const facultyColRef = collection(db, 'artifacts', appId, 'public', 'data', 'faculty_admins');
    const unsubFaculty = onSnapshot(
      facultyColRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setFacultyAdmins(list);
      },
      (err) => console.error('Faculty admins sync error:', err)
    );

    // 3. Sync Test Rooms (artifacts/{appId}/public/data/testRooms)
    const roomsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'testRooms');
    const unsubRooms = onSnapshot(
      roomsColRef,
      async (snapshot) => {
        if (snapshot.empty) {
          for (const room of INITIAL_TEST_ROOMS) {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testRooms', room.id), room);
          }
        } else {
          const loadedRooms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          loadedRooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setTestRooms(loadedRooms);
        }
      },
      (err) => {
        console.error('Test rooms sync error:', err);
        setTestRooms(INITIAL_TEST_ROOMS);
      }
    );

    // 4. Sync Question Bank (artifacts/{appId}/public/data/questions)
    const questionsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
    const unsubQuestions = onSnapshot(
      questionsColRef,
      async (snapshot) => {
        if (snapshot.empty) {
          for (const q of INITIAL_QUESTIONS) {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', q.id), q);
          }
        } else {
          const loadedQs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setQuestions(loadedQs);
        }
        setIsLoadingData(false);
      },
      (err) => {
        console.error('Questions sync error:', err);
        setQuestions(INITIAL_QUESTIONS);
        setIsLoadingData(false);
      }
    );

    // 5. Sync Student Submissions (artifacts/{appId}/public/data/results)
    const submissionsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'results');
    const unsubSubmissions = onSnapshot(
      submissionsColRef,
      (snapshot) => {
        const loadedSubs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        loadedSubs.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
        setSubmissions(loadedSubs);
      },
      (err) => console.error('Results sync error:', err)
    );

    return () => {
      unsubPower();
      unsubFaculty();
      unsubRooms();
      unsubQuestions();
      unsubSubmissions();
    };
  }, [user]);

  // Derived Topics List
  const availableTopics = useMemo(() => {
    const topicSet = new Set(questions.map((q) => q.topic).filter(Boolean));
    return Array.from(topicSet);
  }, [questions]);

  useEffect(() => {
    if (availableTopics.length > 0 && !newRoomTopic) {
      setNewRoomTopic(availableTopics[0]);
    }
    if (availableTopics.length > 0 && !targetTopic) {
      setTargetTopic(availableTopics[0]);
    }
  }, [availableTopics, newRoomTopic, targetTopic]);

  // Live Preview of Smart AI Parsed Questions
  const aiParsedPreview = useMemo(() => parseAiMcqText(aiPasteText), [aiPasteText]);

  // Sync Refs for Anti-Cheating & Timer Closures
  useEffect(() => {
    isTestActiveRef.current = viewMode === 'student' && studentStep === 'testing';
    warningsRef.current = tabWarnings;
    testStateRef.current = {
      studentEmail,
      studentName,
      studentRollNo,
      activeRoom,
      testQuestions,
      userAnswers,
      selectedOptionIdx,
      currentQuestionIdx,
      testStartTime
    };
  }, [
    viewMode,
    studentStep,
    tabWarnings,
    studentEmail,
    studentName,
    studentRollNo,
    activeRoom,
    testQuestions,
    userAnswers,
    selectedOptionIdx,
    currentQuestionIdx,
    testStartTime
  ]);

  // ==========================================
  // 7. 1-HOUR COOLDOWN COUNTDOWN TIMER
  // ==========================================
  useEffect(() => {
    if (studentStep !== 'cooldown' || !cooldownEndsAt) return;

    const updateCooldown = () => {
      const diffSec = Math.ceil((cooldownEndsAt - Date.now()) / 1000);
      if (diffSec <= 0) {
        setCooldownSecondsLeft(0);
        setCooldownEndsAt(null);
        setStudentStep('registration');
        showToast('1-hour cooldown finished! You may now attempt the exam.', 'success');
      } else {
        setCooldownSecondsLeft(diffSec);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [studentStep, cooldownEndsAt]);

  // ==========================================
  // 8. LIVE EXAM TIMER & ANTI-CHEATING PROCTOR
  // ==========================================
  useEffect(() => {
    if (studentStep !== 'testing' || viewMode !== 'student') return;

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          finishAndSubmitTest(null, 'Time Expired (Auto-Submitted)');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.hidden && isTestActiveRef.current) {
        triggerCheatingViolation();
      }
    };

    const handleWindowBlur = () => {
      if (isTestActiveRef.current) {
        triggerCheatingViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      clearInterval(timerInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [studentStep, viewMode]);

  const triggerCheatingViolation = () => {
    const nextWarnings = warningsRef.current + 1;
    warningsRef.current = nextWarnings;
    setTabWarnings(nextWarnings);

    if (nextWarnings === 1) {
      setShowCheatingModal(true);
    } else if (nextWarnings >= 2) {
      finishAndSubmitTest(null, 'Auto-Submitted: Multiple Tab/Window Switches Detected');
    }
  };

  // ==========================================
  // 9. STUDENT AUTHENTICATION & EXAM ENTRY
  // ==========================================
  const handleStudentEmailAuth = async (e) => {
    e.preventDefault();
    setFormError('');
    const cleanEmail = studentEmail.trim().toLowerCase();
    const cleanPass = studentPasswordInput.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid student Email ID.');
      return;
    }
    if (cleanPass.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsAuthenticatingStudent(true);
    try {
      if (studentAuthMode === 'signup') {
        await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        showToast('Student account created & signed in!', 'success');
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        showToast('Signed in successfully!', 'success');
      }
      setStudentEmail(cleanEmail);
      setStudentStep('registration');
    } catch (err) {
      // Fallback if Email/Password provider is disabled in sandbox Firebase project
      if (err?.code === 'auth/operation-not-allowed') {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        setStudentEmail(cleanEmail);
        setStudentStep('registration');
      } else if (err?.code === 'auth/email-already-in-use') {
        setFormError('This Email ID is already registered. Please switch to Sign In.');
      } else if (
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential'
      ) {
        setFormError(
          'Invalid Email or Password. If this is your first time, click "Create Student Account" below.'
        );
      } else {
        setFormError(err?.message || 'Unable to authenticate student account.');
      }
    } finally {
      setIsAuthenticatingStudent(false);
    }
  };

  const handleJoinTestRoomSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const cleanName = studentName.trim();
    const cleanRoll = studentRollNo.trim().toUpperCase();
    const cleanTestId = enteredTestId.trim().toUpperCase();
    const cleanPass = enteredTestPassword.trim();

    if (!cleanName || !cleanRoll || !cleanTestId || !cleanPass) {
      setFormError('All fields (Full Name, Roll Number, Test ID, and Test Password) are required.');
      return;
    }

    const matchedRoom = testRooms.find(
      (r) => r.testId.toUpperCase() === cleanTestId && r.testPassword === cleanPass
    );

    if (!matchedRoom) {
      setFormError('Invalid Test ID or Test Password. Please verify with your NIMS instructor.');
      return;
    }

    // Strict 60-Minute (1-Hour) Cooldown Check per student (Email OR Roll No) for this Test ID
    const nowTs = Date.now();
    const recentAttempt = submissions.find((sub) => {
      const sameRoom = (sub.testId || '').toUpperCase() === cleanTestId;
      const sameStudent =
        sub.studentEmail?.toLowerCase() === studentEmail.toLowerCase() ||
        sub.studentRollNo?.toUpperCase() === cleanRoll;
      const attemptTime = sub.startedAt || sub.submittedAt || 0;
      return sameRoom && sameStudent && nowTs - attemptTime < COOLDOWN_MS;
    });

    if (recentAttempt) {
      const attemptStart = recentAttempt.startedAt || recentAttempt.submittedAt;
      setLockedPreviousResult(recentAttempt);
      setCooldownEndsAt(attemptStart + COOLDOWN_MS);
      setStudentStep('cooldown');
      return;
    }

    // Filter Question Bank for the Room's Topic
    const topicPool = questions.filter((q) => q.topic === matchedRoom.topic);
    if (topicPool.length === 0) {
      setFormError(
        `No questions are currently available for "${matchedRoom.topic}". Contact your instructor.`
      );
      return;
    }

    // Double Randomization: Random subset of questions + Shuffled options (A, B, C, D)
    const count = Math.min(matchedRoom.questionsPerStudent || 5, topicPool.length);
    const selectedQs = shuffleArray(topicPool)
      .slice(0, count)
      .map((q) => {
        const indexedOptions = q.options.map((text, idx) => ({
          text,
          isCorrect: idx === q.correctIndex
        }));
        const shuffled = shuffleArray(indexedOptions);
        return {
          ...q,
          shuffledOptions: shuffled.map((o) => o.text),
          shuffledCorrectIndex: shuffled.findIndex((o) => o.isCorrect)
        };
      });

    setActiveRoom(matchedRoom);
    setTestQuestions(selectedQs);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setUserAnswers([]);
    setTabWarnings(0);
    warningsRef.current = 0;
    setTimeRemaining((matchedRoom.durationMinutes || 5) * 60);
    setTestStartTime(Date.now());
    setStudentStep('testing');
  };

  const handleNextQuestion = () => {
    if (selectedOptionIdx === null) return;
    const updatedAnswers = [...userAnswers, selectedOptionIdx];
    setUserAnswers(updatedAnswers);
    setSelectedOptionIdx(null);

    if (currentQuestionIdx + 1 < testQuestions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      finishAndSubmitTest(updatedAnswers, 'Completed');
    }
  };

  const resetStudentPortal = () => {
    isTestActiveRef.current = false;
    setStudentStep('login');
    setStudentPasswordInput('');
    setEnteredTestId('');
    setEnteredTestPassword('');
    setActiveRoom(null);
    setTestQuestions([]);
    setUserAnswers([]);
    setSelectedOptionIdx(null);
    setActiveResult(null);
    setLockedPreviousResult(null);
    setCooldownEndsAt(null);
    setFormError('');
  };

  // ==========================================
  // 10. TEST SUBMISSION & SCORING LOGIC
  // ==========================================
  const finishAndSubmitTest = async (overrideAnswers = null, autoReason = null) => {
    if (isSubmittingTest) return;
    setIsSubmittingTest(true);

    const state = testStateRef.current;
    const room = state.activeRoom;
    const finalAnswers = overrideAnswers || [...state.userAnswers];

    if (
      !overrideAnswers &&
      state.selectedOptionIdx !== null &&
      finalAnswers.length <= state.currentQuestionIdx
    ) {
      finalAnswers.push(state.selectedOptionIdx);
    }

    const totalQs = state.testQuestions.length;
    let correctCount = 0;
    const answerBreakdown = [];

    state.testQuestions.forEach((q, idx) => {
      const chosenIdx = finalAnswers[idx] !== undefined ? finalAnswers[idx] : -1;
      const isCorrect = chosenIdx === q.shuffledCorrectIndex;
      if (isCorrect) {
        correctCount++;
      }
      answerBreakdown.push({
        question: q.question,
        selectedOption: chosenIdx >= 0 ? q.shuffledOptions[chosenIdx] : 'Not Answered',
        correctOption: q.shuffledOptions[q.shuffledCorrectIndex],
        isCorrect
      });
    });

    const maxDurationSec = (room?.durationMinutes || 5) * 60;
    const elapsedSeconds = Math.max(
      1,
      Math.min(maxDurationSec, Math.round((Date.now() - (state.testStartTime || Date.now())) / 1000))
    );

    const percentage = totalQs > 0 ? Math.round((correctCount / totalQs) * 100) : 0;
    const passThreshold = room?.passingPercentage || 80;
    const isPassed = percentage >= passThreshold;
    const nowTs = Date.now();

    const resultRecord = {
      studentName: state.studentName.trim(),
      studentEmail: state.studentEmail.trim().toLowerCase(),
      studentRollNo: state.studentRollNo.trim().toUpperCase(),
      testId: room?.testId || 'NIMS-EXAM',
      topic: room?.topic || 'General',
      passingPercentage: passThreshold,
      totalQuestions: totalQs,
      correctAnswers: correctCount,
      percentage,
      passed: isPassed,
      timeTakenSeconds: elapsedSeconds,
      tabWarnings: warningsRef.current,
      autoSubmittedReason: autoReason || 'Completed',
      answerBreakdown,
      startedAt: state.testStartTime || nowTs,
      submittedAt: nowTs
    };

    try {
      if (user) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'results'), resultRecord);
      }
    } catch (err) {
      console.error('Error saving exam result:', err);
    }

    isTestActiveRef.current = false;
    setShowCheatingModal(false);
    setActiveResult(resultRecord);
    setStudentStep('result');
    setIsSubmittingTest(false);
  };

  // ==========================================
  // 11. ROLE-BASED ADMIN HIERARCHY HANDLERS
  // ==========================================
  const handleInitializePowerAdmin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    const cleanName = initPowerName.trim();
    const cleanEmail = initPowerEmail.trim().toLowerCase();
    const cleanPass = initPowerPass.trim();

    if (!cleanName || !cleanEmail.includes('@') || cleanPass.length < 6) {
      setAdminLoginError('Enter Full Name, valid Email, and Master Password (minimum 6 characters).');
      return;
    }

    if (powerAdminConfig?.email) {
      setAdminLoginError('Power Admin account is already initialized and permanently locked.');
      return;
    }

    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'nims_config', 'power_admin'), payload);
      setPowerAdminConfig(payload);
      setLoggedInAdmin({ role: 'power', name: cleanName, email: cleanEmail });
      setInitPowerName('');
      setInitPowerEmail('');
      setInitPowerPass('');
      setAdminTab('results');
      setViewMode('adminDashboard');
      showToast('Power Admin account initialized & locked!', 'success');
    } catch (err) {
      console.error('Power Admin init error:', err);
      setAdminLoginError('Failed to initialize Power Admin account.');
    }
  };

  const handleUnifiedAdminLogin = (e) => {
    e.preventDefault();
    setAdminLoginError('');
    const cleanEmail = adminEmailInput.trim().toLowerCase();
    const cleanPass = adminPassInput.trim();

    if (!cleanEmail || !cleanPass) {
      setAdminLoginError('Please enter your Admin Email and Password.');
      return;
    }

    // 1. Check Power Admin credentials
    if (
      powerAdminConfig &&
      cleanEmail === powerAdminConfig.email.toLowerCase() &&
      cleanPass === powerAdminConfig.password
    ) {
      setLoggedInAdmin({
        role: 'power',
        name: powerAdminConfig.name,
        email: powerAdminConfig.email
      });
      setAdminEmailInput('');
      setAdminPassInput('');
      setAdminTab('results');
      setViewMode('adminDashboard');
      showToast(`Welcome, Power Admin ${powerAdminConfig.name}!`, 'success');
      return;
    }

    // 2. Check Faculty Admin credentials
    const matchedFaculty = facultyAdmins.find(
      (f) => f.email.toLowerCase() === cleanEmail && f.password === cleanPass
    );

    if (matchedFaculty) {
      if (matchedFaculty.status === 'suspended') {
        setAdminLoginError('Your Faculty Admin account has been suspended by the Power Admin.');
        return;
      }
      setLoggedInAdmin({
        role: 'faculty',
        id: matchedFaculty.id,
        name: matchedFaculty.name,
        email: matchedFaculty.email,
        department: matchedFaculty.department || ''
      });
      setAdminEmailInput('');
      setAdminPassInput('');
      setAdminTab('results');
      setViewMode('adminDashboard');
      showToast(`Welcome, ${matchedFaculty.name}!`, 'success');
      return;
    }

    setAdminLoginError('Invalid Admin Email or Password.');
  };

  const handleCreateFacultyAdmin = async (e) => {
    e.preventDefault();
    if (loggedInAdmin?.role !== 'power' || !powerAdminConfig) return;

    const cleanName = newSubName.trim();
    const cleanEmail = newSubEmail.trim().toLowerCase();
    const cleanPass = newSubPass.trim();
    const cleanDept = newSubDept.trim();

    if (!cleanName || !cleanEmail.includes('@') || cleanPass.length < 4) {
      showToast('Enter Name, valid Email, and Password (min 4 characters).', 'error');
      return;
    }

    if (cleanEmail === powerAdminConfig.email.toLowerCase()) {
      showToast('This email belongs to the Power Admin.', 'error');
      return;
    }

    if (facultyAdmins.some((f) => f.email.toLowerCase() === cleanEmail)) {
      showToast('A Faculty Admin with this email already exists.', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'faculty_admins'), {
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        department: cleanDept || 'BSIT Department',
        status: 'active',
        createdAt: Date.now()
      });
      setNewSubName('');
      setNewSubEmail('');
      setNewSubPass('');
      setNewSubDept('');
      showToast(`Faculty Admin account created for ${cleanName}!`, 'success');
    } catch (err) {
      console.error('Create faculty admin error:', err);
      showToast('Failed to create Faculty Admin.', 'error');
    }
  };

  const handleToggleFacultyStatus = async (faculty) => {
    if (loggedInAdmin?.role !== 'power') return;
    try {
      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'faculty_admins', faculty.id),
        {
          ...faculty,
          status: faculty.status === 'suspended' ? 'active' : 'suspended'
        }
      );
      showToast('Faculty Admin status updated.', 'info');
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleResetFacultyPassword = async (faculty) => {
    if (loggedInAdmin?.role !== 'power') return;
    const cleanPass = resetSubNewPass.trim();
    if (cleanPass.length < 4) {
      showToast('New password must be at least 4 characters.', 'error');
      return;
    }
    try {
      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'faculty_admins', faculty.id),
        {
          ...faculty,
          password: cleanPass
        }
      );
      setResetSubId(null);
      setResetSubNewPass('');
      showToast('Faculty Admin password reset successfully!', 'success');
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };

  const handleDeleteFacultyAdmin = async (facultyId) => {
    if (loggedInAdmin?.role !== 'power') return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'faculty_admins', facultyId));
      showToast('Faculty Admin account removed.', 'info');
    } catch (err) {
      console.error('Delete faculty admin error:', err);
    }
  };

  const handleChangePowerAdminPassword = async (e) => {
    e.preventDefault();
    if (loggedInAdmin?.role !== 'power' || !powerAdminConfig) return;
    const cleanPass = powerNewPassInput.trim();
    if (cleanPass.length < 6) {
      showToast('Master password must be at least 6 characters.', 'error');
      return;
    }
    try {
      const updated = { ...powerAdminConfig, password: cleanPass };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'nims_config', 'power_admin'), updated);
      setPowerAdminConfig(updated);
      setPowerNewPassInput('');
      showToast('Power Admin master password updated!', 'success');
    } catch (err) {
      console.error('Change power password error:', err);
    }
  };

  // ==========================================
  // 12. TEST ROOMS, QUESTION BANK & CSV EXPORT
  // ==========================================
  const handleDeleteQuestion = async (qId) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', qId));
      showToast('Question removed from Question Bank.', 'info');
    } catch (err) {
      console.error('Delete question error:', err);
    }
  };

  const handleCreateTestRoom = async (e) => {
    e.preventDefault();
    const cleanId = newRoomId.trim().toUpperCase();
    const cleanPass = newRoomPass.trim();

    if (!cleanId || !cleanPass || !newRoomTopic) {
      showToast('Please enter Test ID, Test Password, and Subject/Topic.', 'error');
      return;
    }

    if (testRooms.some((r) => r.testId.toUpperCase() === cleanId)) {
      showToast('This Test ID already exists. Choose a unique Test ID.', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'testRooms'), {
        testId: cleanId,
        testPassword: cleanPass,
        topic: newRoomTopic,
        questionsPerStudent: Math.max(1, Number(newRoomQCount) || 5),
        durationMinutes: Math.max(1, Number(newRoomDuration) || 5),
        passingPercentage: Math.min(100, Math.max(1, Number(newRoomPassPct) || 80)),
        createdAt: Date.now()
      });
      setNewRoomId('');
      setNewRoomPass('');
      showToast(`Test Room "${cleanId}" created & active!`, 'success');
    } catch (err) {
      console.error('Create room error:', err);
      showToast('Failed to create Test Room.', 'error');
    }
  };

  const handleDeleteTestRoom = async (roomId) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testRooms', roomId));
      showToast('Test Room deleted.', 'info');
    } catch (err) {
      console.error('Delete room error:', err);
    }
  };

  const handleImportAiQuestions = async (e) => {
    e.preventDefault();
    const chosenTopic = targetTopic === '__NEW__' ? customTopicInput.trim() : targetTopic;
    if (!chosenTopic) {
      showToast('Please select or enter a Subject Topic.', 'error');
      return;
    }
    if (aiParsedPreview.length === 0) {
      showToast('No valid MCQs detected. Check the pasted format.', 'error');
      return;
    }

    try {
      for (const item of aiParsedPreview) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), {
          topic: chosenTopic,
          question: item.question,
          options: item.options,
          correctIndex: item.correctIndex,
          createdAt: Date.now()
        });
      }
      setAiPasteText('');
      if (targetTopic === '__NEW__') {
        setTargetTopic(chosenTopic);
        setCustomTopicInput('');
      }
      showToast(`Imported ${aiParsedPreview.length} MCQs into "${chosenTopic}"!`, 'success');
    } catch (err) {
      console.error('AI import error:', err);
      showToast('Failed to import MCQs.', 'error');
    }
  };

  const handleAddSingleQuestion = async (e) => {
    e.preventDefault();
    const chosenTopic = targetTopic === '__NEW__' ? customTopicInput.trim() : targetTopic;
    if (!chosenTopic || !newQText.trim() || newQOptions.some((o) => !o.trim())) {
      showToast('Please fill out the topic, question, and all 4 options.', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), {
        topic: chosenTopic,
        question: newQText.trim(),
        options: newQOptions.map((o) => o.trim()),
        correctIndex: Number(newQCorrect),
        createdAt: Date.now()
      });
      setNewQText('');
      setNewQOptions(['', '', '', '']);
      setNewQCorrect(0);
      if (targetTopic === '__NEW__') {
        setTargetTopic(chosenTopic);
        setCustomTopicInput('');
      }
      showToast('Question added to NIMS Question Bank!', 'success');
    } catch (err) {
      console.error('Add single question error:', err);
      showToast('Failed to save question.', 'error');
    }
  };

  const handleExportResultsCsv = () => {
    if (filteredSubmissions.length === 0) {
      showToast('No results available to export.', 'warning');
      return;
    }

    const headers = [
      'Student Name',
      'Roll Number',
      'Email ID',
      'Test ID',
      'Topic',
      'Correct Answers',
      'Total Questions',
      'Percentage (%)',
      'Status',
      'Time Taken',
      'Tab Warnings',
      'Submission Note',
      'Date & Time'
    ];

    const rows = filteredSubmissions.map((sub) => [
      `"${sub.studentName}"`,
      `"${sub.studentRollNo}"`,
      `"${sub.studentEmail}"`,
      `"${sub.testId || 'N/A'}"`,
      `"${sub.topic}"`,
      sub.correctAnswers,
      sub.totalQuestions,
      `${sub.percentage}%`,
      sub.passed ? 'PASSED' : 'FAILED',
      formatTime(sub.timeTakenSeconds),
      sub.tabWarnings || 0,
      `"${sub.autoSubmittedReason || 'Completed'}"`,
      `"${new Date(sub.submittedAt).toLocaleString()}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NIMS_Exam_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('NIMS Exam Results CSV downloaded!', 'success');
  };

  // Filtered Student Results
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        sub.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.studentRollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTest = filterTestId === 'ALL' || sub.testId === filterTestId;
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'PASS' && sub.passed) ||
        (filterStatus === 'FAIL' && !sub.passed);

      return matchesSearch && matchesTest && matchesStatus;
    });
  }, [submissions, searchQuery, filterTestId, filterStatus]);

  // ==========================================
  // 13. RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : toastMessage.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* ANTI-CHEATING PROCTORING WARNING MODAL */}
      {showCheatingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeOff className="w-8 h-8" />
            </div>
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-full mb-2">
              NIMS Proctoring Alert • Warning 1 / 2
            </span>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tab Switching Detected!</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Leaving the NIMS Exam Portal window or switching tabs is strictly prohibited.
              <strong className="text-rose-600 block mt-1">
                One more violation will automatically submit your exam immediately!
              </strong>
            </p>
            <button
              onClick={() => setShowCheatingModal(false)}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md transition"
            >
              I Understand, Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => {
              if (studentStep !== 'testing') {
                setViewMode('student');
              }
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                NIMS Exam Portal
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Online Assessment &amp; Examination System
              </p>
            </div>
          </div>

          {viewMode === 'student' && studentStep === 'testing' ? (
            <div className="flex items-center gap-3">
              {tabWarnings > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Warnings: {tabWarnings}/2
                </span>
              )}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-base border ${
                  timeRemaining <= 30
                    ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {viewMode === 'student' ? (
                <button
                  onClick={() => setViewMode(loggedInAdmin ? 'adminDashboard' : 'adminLogin')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Admin Panel</span>
                </button>
              ) : (
                <>
                  {viewMode === 'adminDashboard' && loggedInAdmin && (
                    <button
                      onClick={() => {
                        setLoggedInAdmin(null);
                        setViewMode('adminLogin');
                        showToast('Logged out of NIMS Admin Portal.', 'info');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin Logout</span>
                    </button>
                  )}
                  <button
                    onClick={() => setViewMode('student')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student Portal</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-medium">Loading NIMS Exam Portal...</p>
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* VIEW 1: STUDENT PORTAL                                         */}
            {/* ============================================================== */}
            {viewMode === 'student' && (
              <div className="max-w-xl mx-auto">
                {/* STEP 1: STUDENT EMAIL & PASSWORD AUTHENTICATION */}
                {studentStep === 'login' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {studentAuthMode === 'signin'
                          ? 'NIMS Student Sign In'
                          : 'Create Student Account'}
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">
                        {studentAuthMode === 'signin'
                          ? 'Sign in with your Email ID & Password to join your scheduled NIMS exam'
                          : 'Register your Email ID & Password to access NIMS Exam Portal'}
                      </p>
                    </div>

                    {formError && (
                      <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleStudentEmailAuth} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Student Email ID
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="Enter your student email"
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Account Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Enter your password"
                          value={studentPasswordInput}
                          onChange={(e) => setStudentPasswordInput(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticatingStudent}
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
                      >
                        <span>
                          {isAuthenticatingStudent
                            ? 'Verifying...'
                            : studentAuthMode === 'signin'
                            ? 'Sign In & Continue'
                            : 'Register & Continue'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                      {studentAuthMode === 'signin' ? (
                        <p className="text-xs text-slate-600">
                          New student?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setStudentAuthMode('signup');
                              setFormError('');
                            }}
                            className="font-bold text-indigo-600 hover:underline"
                          >
                            Create Student Account
                          </button>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-600">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setStudentAuthMode('signin');
                              setFormError('');
                            }}
                            className="font-bold text-indigo-600 hover:underline"
                          >
                            Sign In Instead
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: STUDENT EXAM ENTRY FORM (NAME, ROLL NO, TEST ID & PASSWORD) */}
                {studentStep === 'registration' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">NIMS Exam Entry Form</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Logged in as{' '}
                          <span className="font-semibold text-indigo-600">{studentEmail}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setStudentStep('login')}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
                      >
                        Change Email
                      </button>
                    </div>

                    {formError && (
                      <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleJoinTestRoomSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            BSIT Roll Number / ID
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Enter roll number"
                            value={studentRollNo}
                            onChange={(e) => setStudentRollNo(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Test ID
                          </label>
                          <div className="relative">
                            <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                              type="text"
                              required
                              placeholder="Enter Class Test ID"
                              value={enteredTestId}
                              onChange={(e) => setEnteredTestId(e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Test Password
                          </label>
                          <div className="relative">
                            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                              type="password"
                              required
                              placeholder="Enter Test Password"
                              value={enteredTestPassword}
                              onChange={(e) => setEnteredTestPassword(e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5 text-amber-950">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          NIMS Exam Portal Guidelines:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Timer begins immediately when Question 1 appears on your screen.
                          </li>
                          <li>
                            <strong>1-Hour Attempt Lock:</strong> Once attempted, you cannot re-enter this Test ID for <strong>60 minutes</strong>.
                          </li>
                          <li>
                            <strong>Anti-Cheating Active:</strong> Switching tabs or minimizing the window triggers a warning and auto-submits on the 2nd violation.
                          </li>
                        </ul>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                      >
                        <span>Verify &amp; Start Exam</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                )}

                {/* STEP 2.5: 1-HOUR COOLDOWN LOCK SCREEN */}
                {studentStep === 'cooldown' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-amber-300 overflow-hidden">
                    <div className="bg-amber-600 text-white p-6 text-center">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Timer className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">1-Hour Re-Attempt Lock Active</h2>
                      <p className="text-amber-100 text-xs mt-1">
                        NIMS Exam Portal • Test ID:{' '}
                        <strong className="font-mono">{enteredTestId.toUpperCase()}</strong>
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 text-center">
                      <p className="text-sm text-slate-600 mb-4">
                        You have already attempted this test within the last hour. You cannot re-login to this Test ID until the 60-minute cooldown completes:
                      </p>

                      <div className="inline-block bg-slate-900 text-white px-6 py-4 rounded-2xl mb-6 shadow-inner">
                        <span className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1">
                          Time Remaining to Unlock
                        </span>
                        <span className="text-3xl font-mono font-extrabold text-amber-400">
                          {formatTime(cooldownSecondsLeft)}
                        </span>
                      </div>

                      {lockedPreviousResult && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left text-sm">
                          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                            <span className="font-bold text-slate-800">Your Recorded Scorecard</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                lockedPreviousResult.passed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {lockedPreviousResult.passed ? 'PASSED' : 'FAILED'} (
                              {lockedPreviousResult.percentage}%)
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div>
                              Score:{' '}
                              <strong>
                                {lockedPreviousResult.correctAnswers}/
                                {lockedPreviousResult.totalQuestions}
                              </strong>
                            </div>
                            <div>
                              Time Taken:{' '}
                              <strong>{formatTime(lockedPreviousResult.timeTakenSeconds)}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={resetStudentPortal}
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition"
                      >
                        Return to NIMS Login
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: ONE-BY-ONE MCQ TEST ENGINE */}
                {studentStep === 'testing' && testQuestions.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 text-white px-6 py-4">
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                        <span className="font-semibold text-indigo-300">
                          {activeRoom?.testId} • {activeRoom?.topic}
                        </span>
                        <span>
                          Question <strong>{currentQuestionIdx + 1}</strong> of{' '}
                          <strong>{testQuestions.length}</strong>
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-300"
                          style={{
                            width: `${((currentQuestionIdx + 1) / testQuestions.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="mb-6">
                        <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-3">
                          Question #{currentQuestionIdx + 1}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                          {testQuestions[currentQuestionIdx].question}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {testQuestions[currentQuestionIdx].shuffledOptions.map((optionText, idx) => {
                          const isSelected = selectedOptionIdx === idx;
                          const optionLetters = ['A', 'B', 'C', 'D'];

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedOptionIdx(idx)}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {optionLetters[idx]}
                              </span>
                              <span className="font-medium text-sm sm:text-base">{optionText}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Candidate: {studentRollNo}</span>
                        <button
                          type="button"
                          disabled={selectedOptionIdx === null || isSubmittingTest}
                          onClick={handleNextQuestion}
                          className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
                            selectedOptionIdx === null
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : currentQuestionIdx + 1 === testQuestions.length
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                          }`}
                        >
                          <span>
                            {currentQuestionIdx + 1 === testQuestions.length
                              ? 'Finish & Submit Exam'
                              : 'Next Question'}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: OFFICIAL NIMS RESULT SCORECARD */}
                {studentStep === 'result' && activeResult && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div
                      className={`p-6 sm:p-8 text-center text-white ${
                        activeResult.passed
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                          : 'bg-gradient-to-br from-rose-600 to-red-700'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">
                        NIMS Exam Portal • Official Result Scorecard
                      </p>
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto mb-3">
                        {activeResult.passed ? (
                          <Award className="w-9 h-9 text-white" />
                        ) : (
                          <XCircle className="w-9 h-9 text-white" />
                        )}
                      </div>
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                        {activeResult.passed ? 'PASSED ASSESSMENT' : 'FAILED ASSESSMENT'}
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold">
                        {activeResult.percentage}% Score
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        {activeResult.passed
                          ? `Congratulations ${activeResult.studentName}! You cleared the ${
                              activeResult.passingPercentage || 80
                            }% passing criteria.`
                          : `Minimum ${
                              activeResult.passingPercentage || 80
                            }% is required to pass this NIMS exam.`}
                      </p>
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500 block text-xs">Student Name</span>
                          <span className="font-bold text-slate-900">
                            {activeResult.studentName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs">Roll Number</span>
                          <span className="font-bold font-mono text-indigo-600">
                            {activeResult.studentRollNo}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs">Test ID</span>
                          <span className="font-bold font-mono text-slate-800">
                            {activeResult.testId}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs">Subject</span>
                          <span className="font-bold text-slate-900">{activeResult.topic}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 text-center">
                        <div className="p-4 rounded-xl border border-slate-200 bg-white">
                          <span className="text-xs text-slate-500 block mb-1">Correct Answers</span>
                          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                            {activeResult.correctAnswers} / {activeResult.totalQuestions}
                          </span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white">
                          <span className="text-xs text-slate-500 block mb-1">Time Taken</span>
                          <span className="text-xl sm:text-2xl font-extrabold text-slate-800 font-mono">
                            {formatTime(activeResult.timeTakenSeconds)}
                          </span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white">
                          <span className="text-xs text-slate-500 block mb-1">Result Status</span>
                          <span
                            className={`text-lg sm:text-xl font-extrabold ${
                              activeResult.passed ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {activeResult.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      </div>

                      {activeResult.autoSubmittedReason &&
                        activeResult.autoSubmittedReason !== 'Completed' && (
                          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              <strong>Submission Note:</strong> {activeResult.autoSubmittedReason}
                            </span>
                          </div>
                        )}

                      <button
                        onClick={resetStudentPortal}
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Exit NIMS Exam Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW 2: POWER ADMIN INIT OR UNIFIED ADMIN LOGIN                */}
            {/* ============================================================== */}
            {viewMode === 'adminLogin' && (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                {isAdminConfigLoaded && !powerAdminConfig ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Crown className="w-7 h-7" />
                      </div>
                      <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider rounded-full mb-1.5">
                        One-Time System Setup
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Initialize Power Admin Account
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">
                        Create the sole master Power Admin account for NIMS Exam Portal. Once initialized, Power Admin registration is permanently locked.
                      </p>
                    </div>

                    {adminLoginError && (
                      <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{adminLoginError}</span>
                      </div>
                    )}

                    <form onSubmit={handleInitializePowerAdmin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Power Admin Full Name
                        </label>
                        <div className="relative">
                          <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            required
                            placeholder="Enter full name"
                            value={initPowerName}
                            onChange={(e) => setInitPowerName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Power Admin Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            placeholder="Enter master admin email"
                            value={initPowerEmail}
                            onChange={(e) => setInitPowerEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Master Password
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="password"
                            required
                            placeholder="Create strong master password"
                            value={initPowerPass}
                            onChange={(e) => setInitPowerPass(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Initialize &amp; Lock Power Admin</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-7 h-7" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">NIMS Admin Portal Login</h2>
                      <p className="text-slate-500 text-sm mt-1">
                        Sign in with your Power Admin or Faculty Admin credentials
                      </p>
                    </div>

                    {adminLoginError && (
                      <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{adminLoginError}</span>
                      </div>
                    )}

                    <form onSubmit={handleUnifiedAdminLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Admin Email ID
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            placeholder="Enter admin email"
                            value={adminEmailInput}
                            onChange={(e) => setAdminEmailInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Admin Password
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="password"
                            required
                            placeholder="Enter admin password"
                            value={adminPassInput}
                            onChange={(e) => setAdminPassInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In to Admin Portal</span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW 3: NIMS ADMIN DASHBOARD                                   */}
            {/* ============================================================== */}
            {viewMode === 'adminDashboard' && loggedInAdmin && (
              <div className="space-y-6">
                {/* STUDENT ANSWER SHEET BREAKDOWN MODAL */}
                {selectedSubmissionModal && (
                  <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                      <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">
                            NIMS Exam Answer Sheet
                          </span>
                          <h3 className="text-lg font-bold">
                            {selectedSubmissionModal.studentName} (
                            {selectedSubmissionModal.studentRollNo})
                          </h3>
                          <p className="text-xs text-slate-300">
                            Email: {selectedSubmissionModal.studentEmail} • Test:{' '}
                            {selectedSubmissionModal.testId}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedSubmissionModal(null)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-5 overflow-y-auto space-y-3 flex-1">
                        <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                          <div>
                            <span className="text-slate-500 block">Score</span>
                            <strong className="text-sm text-slate-900">
                              {selectedSubmissionModal.correctAnswers} /{' '}
                              {selectedSubmissionModal.totalQuestions}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Percentage</span>
                            <strong className="text-sm text-indigo-600">
                              {selectedSubmissionModal.percentage}%
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Status</span>
                            <strong
                              className={`text-sm ${
                                selectedSubmissionModal.passed ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {selectedSubmissionModal.passed ? 'PASSED' : 'FAILED'}
                            </strong>
                          </div>
                        </div>

                        {selectedSubmissionModal.answerBreakdown &&
                        selectedSubmissionModal.answerBreakdown.length > 0 ? (
                          selectedSubmissionModal.answerBreakdown.map((item, i) => (
                            <div
                              key={i}
                              className={`p-3.5 rounded-xl border text-sm ${
                                item.isCorrect
                                  ? 'bg-emerald-50/60 border-emerald-200'
                                  : 'bg-rose-50/60 border-rose-200'
                              }`}
                            >
                              <p className="font-bold text-slate-900 mb-1.5">
                                Q{i + 1}. {item.question}
                              </p>
                              <p className="text-xs text-slate-700">
                                Student Answer:{' '}
                                <strong
                                  className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}
                                >
                                  {item.selectedOption}
                                </strong>
                              </p>
                              {!item.isCorrect && (
                                <p className="text-xs text-emerald-800 mt-0.5">
                                  Correct Answer: <strong>{item.correctOption}</strong>
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 text-center py-6">
                            Detailed question breakdown is available for newly submitted exams.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TOP DASHBOARD BAR */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {loggedInAdmin.role === 'power' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            POWER ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            FACULTY ADMIN
                          </span>
                        )}
                        <span className="text-xs font-medium text-slate-500">
                          {loggedInAdmin.name} ({loggedInAdmin.email})
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">NIMS Exam Portal Dashboard</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setAdminTab('results')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                          adminTab === 'results'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Student Results ({submissions.length})</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('rooms')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                          adminTab === 'rooms'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <DoorOpen className="w-4 h-4" />
                        <span>Test Rooms ({testRooms.length})</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('questions')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                          adminTab === 'questions'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Question Bank ({questions.length})</span>
                      </button>
                      {loggedInAdmin.role === 'power' && (
                        <button
                          onClick={() => setAdminTab('admins')}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                            adminTab === 'admins'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <Crown className="w-4 h-4" />
                          <span>Manage Admins ({facultyAdmins.length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SUMMARY METRICS */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                      <span className="text-xs text-indigo-700 font-medium">Active Test Rooms</span>
                      <p className="text-2xl font-extrabold text-indigo-700 mt-1">
                        {testRooms.length}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-medium">
                        Total Student Attempts
                      </span>
                      <p className="text-2xl font-extrabold text-slate-900 mt-1">
                        {submissions.length}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                      <span className="text-xs text-emerald-700 font-medium">Passed Students</span>
                      <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                        {submissions.filter((s) => s.passed).length}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80">
                      <span className="text-xs text-rose-700 font-medium">Failed Students</span>
                      <p className="text-2xl font-extrabold text-rose-700 mt-1">
                        {submissions.filter((s) => !s.passed).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ========================================================== */}
                {/* TAB 1: STUDENT RESULTS & CSV EXPORT                        */}
                {/* ========================================================== */}
                {adminTab === 'results' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1 max-w-xs">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            placeholder="Search Name, Roll No, Email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>

                        <select
                          value={filterTestId}
                          onChange={(e) => setFilterTestId(e.target.value)}
                          className="px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white outline-none font-mono"
                        >
                          <option value="ALL">All Test IDs</option>
                          {testRooms.map((r) => (
                            <option key={r.id} value={r.testId}>
                              {r.testId}
                            </option>
                          ))}
                        </select>

                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white outline-none"
                        >
                          <option value="ALL">All Status</option>
                          <option value="PASS">Passed Only</option>
                          <option value="FAIL">Failed Only</option>
                        </select>
                      </div>

                      <button
                        onClick={handleExportResultsCsv}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export NIMS Results (CSV)</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                            <th className="py-3.5 px-4">Student Name &amp; Roll No</th>
                            <th className="py-3.5 px-4">Login Email</th>
                            <th className="py-3.5 px-4">Test ID / Subject</th>
                            <th className="py-3.5 px-4">Score</th>
                            <th className="py-3.5 px-4">Percentage</th>
                            <th className="py-3.5 px-4">Time &amp; Warnings</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Answer Sheet</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredSubmissions.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="py-12 text-center text-slate-400">
                                No NIMS student exam submissions recorded yet.
                              </td>
                            </tr>
                          ) : (
                            filteredSubmissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-900">{sub.studentName}</div>
                                  <div className="text-xs font-mono font-semibold text-indigo-600">
                                    ID: {sub.studentRollNo}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                    {sub.studentEmail}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="inline-block font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                                    {sub.testId || 'N/A'}
                                  </span>
                                  <div className="text-xs text-slate-600 mt-1">{sub.topic}</div>
                                </td>
                                <td className="py-3.5 px-4 font-semibold">
                                  {sub.correctAnswers} / {sub.totalQuestions}
                                </td>
                                <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                  {sub.percentage}%
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-mono text-xs text-slate-700">
                                    {formatTime(sub.timeTakenSeconds)}
                                  </div>
                                  {sub.tabWarnings > 0 ? (
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold">
                                      <AlertTriangle className="w-3 h-3" />
                                      {sub.tabWarnings} Warning{sub.tabWarnings > 1 ? 's' : ''}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 block mt-0.5">
                                      Clean
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4">
                                  {sub.passed ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      PASSED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                                      <XCircle className="w-3.5 h-3.5" />
                                      FAILED
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedSubmissionModal(sub)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ========================================================== */}
                {/* TAB 2: TEST ROOMS (TEST ID + PASSWORD)                     */}
                {/* ========================================================== */}
                {adminTab === 'rooms' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs h-fit">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        Create Class Test Room
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Share the Test ID &amp; Password with your BSIT class. Each student gets a strict 1-hour lock after attempting.
                      </p>

                      <form onSubmit={handleCreateTestRoom} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Test ID
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., BSIT-OOP-01"
                              value={newRoomId}
                              onChange={(e) => setNewRoomId(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Test Password
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Set room password"
                              value={newRoomPass}
                              onChange={(e) => setNewRoomPass(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                            Subject / Topic
                          </label>
                          <select
                            value={newRoomTopic}
                            onChange={(e) => setNewRoomTopic(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white outline-none"
                          >
                            {availableTopics.map((t) => (
                              <option key={t} value={t}>
                                {t} ({questions.filter((q) => q.topic === t).length} MCQs)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                              Questions
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              required
                              value={newRoomQCount}
                              onChange={(e) => setNewRoomQCount(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                              Minutes
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="180"
                              required
                              value={newRoomDuration}
                              onChange={(e) => setNewRoomDuration(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                              Pass %
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              required
                              value={newRoomPassPct}
                              onChange={(e) => setNewRoomPassPct(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create Test Room</span>
                        </button>
                      </form>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      {testRooms.map((room) => (
                        <div
                          key={room.id}
                          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2.5 mb-1">
                              <span className="px-3 py-1 bg-indigo-600 text-white font-mono font-bold text-sm rounded-lg">
                                {room.testId}
                              </span>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-xs rounded-lg border border-slate-200">
                                Password: <strong>{room.testPassword}</strong>
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-base mt-2">
                              {room.topic}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {room.questionsPerStudent} Random MCQs • {room.durationMinutes} Mins •
                              Pass Criteria: {room.passingPercentage}%
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteTestRoom(room.id)}
                            className="self-end sm:self-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Delete Test Room"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================== */}
                {/* TAB 3: QUESTION BANK & SMART AI PASTE IMPORTER             */}
                {/* ========================================================== */}
                {adminTab === 'questions' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs h-fit">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Add Questions</h3>
                        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setQEntryMode('ai')}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                              qEntryMode === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Smart AI Paste</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQEntryMode('single')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                              qEntryMode === 'single'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600'
                            }`}
                          >
                            Single MCQ
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                          Subject / Topic
                        </label>
                        <select
                          value={targetTopic}
                          onChange={(e) => setTargetTopic(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white outline-none"
                        >
                          {availableTopics.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                          <option value="__NEW__">+ Create New Topic...</option>
                        </select>

                        {targetTopic === '__NEW__' && (
                          <input
                            type="text"
                            required
                            placeholder="Enter New Subject Name..."
                            value={customTopicInput}
                            onChange={(e) => setCustomTopicInput(e.target.value)}
                            className="w-full mt-2 px-3 py-2.5 text-sm rounded-xl border border-indigo-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        )}
                      </div>

                      {qEntryMode === 'ai' ? (
                        <form onSubmit={handleImportAiQuestions} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Paste Directly from ChatGPT or Gemini
                            </label>
                            <p className="text-[11px] text-slate-500 mb-2">
                              Copy MCQs with options (A, B, C, D) and{' '}
                              <code className="bg-slate-100 px-1 rounded">Answer: B</code> directly
                              from AI and paste below:
                            </p>
                            <textarea
                              rows="7"
                              required
                              placeholder={`1. Which protocol is used to send emails?\nA) HTTP\nB) SMTP\nC) FTP\nD) SNMP\nAnswer: B\n\n2. What does RAM stand for?\nA) Read Access Memory\nB) Random Access Memory\nC) Run Accept Memory\nD) None\nAnswer: B`}
                              value={aiPasteText}
                              onChange={(e) => setAiPasteText(e.target.value)}
                              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          {aiParsedPreview.length > 0 && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                              <p className="font-bold flex items-center gap-1.5 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Detected {aiParsedPreview.length} Valid MCQ
                                {aiParsedPreview.length > 1 ? 's' : ''}!
                              </p>
                              <p className="text-[11px] text-emerald-700 truncate">
                                Sample: {aiParsedPreview[0].question} (Ans:{' '}
                                {['A', 'B', 'C', 'D'][aiParsedPreview[0].correctIndex]})
                              </p>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Import {aiParsedPreview.length || ''} AI Questions</span>
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleAddSingleQuestion} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Question Statement
                            </label>
                            <textarea
                              rows="2"
                              required
                              placeholder="Type your MCQ question here..."
                              value={newQText}
                              onChange={(e) => setNewQText(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div className="space-y-2.5">
                            <label className="block text-xs font-bold uppercase text-slate-600">
                              Options (Select Radio for Correct Answer)
                            </label>
                            {newQOptions.map((optVal, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="correctOptionRadio"
                                  checked={newQCorrect === idx}
                                  onChange={() => setNewQCorrect(idx)}
                                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <input
                                  type="text"
                                  required
                                  placeholder={`Option ${['A', 'B', 'C', 'D'][idx]}`}
                                  value={optVal}
                                  onChange={(e) => {
                                    const copy = [...newQOptions];
                                    copy[idx] = e.target.value;
                                    setNewQOptions(copy);
                                  }}
                                  className={`flex-1 px-3 py-2 text-sm rounded-xl border outline-none ${
                                    newQCorrect === idx
                                      ? 'border-emerald-500 bg-emerald-50/40'
                                      : 'border-slate-300'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Save Question to Bank</span>
                          </button>
                        </form>
                      )}
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      {availableTopics.map((topicName) => {
                        const topicQs = questions.filter((q) => q.topic === topicName);
                        return (
                          <div
                            key={topicName}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"
                          >
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-600" />
                                <span>{topicName}</span>
                              </h4>
                              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                                {topicQs.length} MCQs
                              </span>
                            </div>

                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                              {topicQs.map((q, idx) => (
                                <div
                                  key={q.id}
                                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                                >
                                  <div className="text-sm">
                                    <p className="font-semibold text-slate-900 mb-1.5">
                                      {idx + 1}. {q.question}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                                      {q.options.map((opt, oIdx) => (
                                        <span
                                          key={oIdx}
                                          className={`px-2 py-1 rounded ${
                                            oIdx === q.correctIndex
                                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                                              : 'text-slate-600'
                                          }`}
                                        >
                                          {['A', 'B', 'C', 'D'][oIdx]}: {opt}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    title="Delete Question"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ========================================================== */}
                {/* TAB 4: MANAGE ADMINS (POWER ADMIN EXCLUSIVE)               */}
                {/* ========================================================== */}
                {adminTab === 'admins' && loggedInAdmin.role === 'power' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <UserPlus className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-lg font-bold text-slate-900">
                            Create Faculty Admin Account
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                          Create login credentials for instructors so they can manage Test Rooms, Question Banks, and view NIMS Student Results.
                        </p>

                        <form onSubmit={handleCreateFacultyAdmin} className="space-y-3.5">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Faculty Full Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Enter instructor name"
                              value={newSubName}
                              onChange={(e) => setNewSubName(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Login Email ID
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="Enter faculty email"
                              value={newSubEmail}
                              onChange={(e) => setNewSubEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Assigned Password
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="Set login password"
                              value={newSubPass}
                              onChange={(e) => setNewSubPass(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Department (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., BSIT Department"
                              value={newSubDept}
                              onChange={(e) => setNewSubDept(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Create Faculty Admin</span>
                          </button>
                        </form>
                      </div>

                      <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-6 shadow-xs">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-5 h-5 text-amber-600" />
                          <h3 className="text-base font-bold text-slate-900">
                            Power Admin Master Account
                          </h3>
                        </div>
                        <div className="text-xs text-slate-700 space-y-1 mb-4 bg-white p-3 rounded-xl border border-amber-200/80">
                          <div>
                            Name: <strong>{powerAdminConfig?.name}</strong>
                          </div>
                          <div>
                            Email: <strong className="font-mono">{powerAdminConfig?.email}</strong>
                          </div>
                        </div>

                        <form onSubmit={handleChangePowerAdminPassword} className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                              Update Master Password
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="New master password (min 6 chars)"
                              value={powerNewPassInput}
                              onChange={(e) => setPowerNewPassInput(e.target.value)}
                              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
                          >
                            Update Power Admin Password
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                          <h3 className="font-bold text-slate-900">
                            Created Faculty Admin Accounts ({facultyAdmins.length})
                          </h3>
                        </div>

                        {facultyAdmins.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-sm">
                            No Faculty Admin accounts created yet. Use the form on the left to add an instructor admin.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {facultyAdmins.map((faculty) => (
                              <div
                                key={faculty.id}
                                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col gap-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-900">{faculty.name}</h4>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                          faculty.status === 'suspended'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                      >
                                        {faculty.status === 'suspended' ? 'Suspended' : 'Active'}
                                      </span>
                                    </div>
                                    <p className="text-xs font-mono text-slate-600 mt-0.5">
                                      {faculty.email}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {faculty.department || 'Faculty'} • Created{' '}
                                      {new Date(faculty.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setResetSubId(
                                          resetSubId === faculty.id ? null : faculty.id
                                        );
                                        setResetSubNewPass('');
                                      }}
                                      className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1 transition"
                                    >
                                      <Key className="w-3.5 h-3.5" />
                                      <span>Reset Pass</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleFacultyStatus(faculty)}
                                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition ${
                                        faculty.status === 'suspended'
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                          : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                      }`}
                                    >
                                      {faculty.status === 'suspended' ? (
                                        <>
                                          <UserCheck className="w-3.5 h-3.5" />
                                          <span>Activate</span>
                                        </>
                                      ) : (
                                        <>
                                          <UserX className="w-3.5 h-3.5" />
                                          <span>Suspend</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFacultyAdmin(faculty.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                      title="Delete Faculty Admin"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {resetSubId === faculty.id && (
                                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                                    <input
                                      type="password"
                                      placeholder="Enter new password"
                                      value={resetSubNewPass}
                                      onChange={(e) => setResetSubNewPass(e.target.value)}
                                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleResetFacultyPassword(faculty)}
                                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                                    >
                                      Save
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}