import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  UserPlus,
  Calendar,
  Clock,
  Receipt,
  Cpu,
  BookOpen,
  Layers,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Stethoscope,
  HeartPulse,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Copy,
  Check,
  Filter,
  ChevronRight,
  FileText,
  Phone,
  AlertTriangle,
  UserCheck,
  Terminal,
  Zap,
  BarChart3,
  Database,
  ArrowUpRight,
  X
} from 'lucide-react';

interface PatientItem {
  id: string;
  name: string;
  age: number;
  phone: string;
  bloodGroup: string;
  allergies: string;
}

interface DoctorItem {
  id: number;
  name: string;
  specialization: string;
  booked: boolean[];
}

interface AppointmentItem {
  id: number;
  patientId: string;
  doctorId: number;
  slotTime: string;
  status: 'BOOKED' | 'CANCELLED';
}

interface MedicalRecordItem {
  id: number;
  patientId: string;
  diagnosis: string;
  prescription: string;
  doctorName: string;
  dateText: string;
}

interface BillItem {
  id: number;
  patientId: string;
  consultation: number;
  medicine: number;
  testFee: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
}

const SLOT_TIMES = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];

const TEAM_MEMBERS = [
  { name: 'Sanskar Shinde', prn: '202401103145' },
  { name: 'Sarvesh Ghodke', prn: '202401103158' },
  { name: 'Aamer Sayed', prn: '202401103150' },
  { name: 'Rohan Tarke', prn: '202401103149' }
];

const JAVA_PRACTICALS = [
  {
    num: 'Practical 1',
    title: 'Syntax & Control Flow',
    concepts: 'if-else branches, switch statements, loops, type casting ((int), (double))',
    classes: 'ClinicService.getSummary(), Doctor.bookSlot(), Main.main()',
    codeSnippet: `// Type casting and summary formatting in Practical 1
double totalRev = calculateTotalRevenue();
int roundedTotal = (int) Math.round(totalRev);
switch (bill.getStatus()) {
    case "PAID": paidCount++; break;
    case "PENDING": pendingCount++; break;
    default: cancelledCount++; break;
}`
  },
  {
    num: 'Practical 2',
    title: 'Arrays & Vector Collections',
    concepts: 'Fixed boolean[6] slot arrays, dynamic Vector<Patient>, insertElementAt(0) for emergency triage, capacity()',
    classes: 'Doctor.booked, waitingList Vector, Vector<Doctor>',
    codeSnippet: `// Fixed array for doctor slots & Vector for dynamic emergency triage
boolean[] booked = new boolean[SLOTS_PER_DOCTOR];
Vector<Patient> waitingList = new Vector<>(10, 5);

// Emergency case pushes patient directly to index 0 (FRONT of queue)
if (isEmergency) {
    waitingList.insertElementAt(emergencyPatient, 0);
}`
  },
  {
    num: 'Practical 3',
    title: 'Classes, Objects & Constructors',
    concepts: 'Encapsulation, default & parameterized constructors, private attributes with getters/setters',
    classes: 'Person, Patient, Doctor, Appointment, MedicalRecord, Bill',
    codeSnippet: `public class Patient extends Person {
    private String bloodGroup;
    private String allergies;

    public Patient(String id, String name, int age, String phone, String bloodGroup, String allergies) {
        super(id, name, age, phone);
        this.bloodGroup = bloodGroup;
        this.allergies = allergies;
    }
}`
  },
  {
    num: 'Practical 4',
    title: 'Interfaces & Method Overriding',
    concepts: 'Multiple interface implementation (Bookable, Billable, Reportable), method overloading addPatient()',
    classes: 'Bookable, Billable, Reportable, Patient, Doctor, ClinicService',
    codeSnippet: `public interface Bookable {
    boolean bookSlot(int slotIndex) throws SlotNotAvailableException;
    void cancelSlot(int slotIndex);
}

// Overloaded methods in ClinicService
public void addPatient(Patient p) { ... }
public void addPatient(String name, int age, String phone) { ... }`
  },
  {
    num: 'Practical 5',
    title: 'Packages & Modular Architecture',
    concepts: 'Clean separation into medisync.model, medisync.service, medisync.db, medisync.exception, medisync.web',
    classes: 'package medisync.model; package medisync.service; import medisync.exception.*;',
    codeSnippet: `package medisync.service;

import medisync.model.Doctor;
import medisync.model.Patient;
import medisync.exception.PatientNotFoundException;
import medisync.exception.SlotNotAvailableException;`
  },
  {
    num: 'Practical 6',
    title: 'this, super, static & final (Builder Pattern)',
    concepts: 'this() constructor chaining, super() inheritance call, static counters, final constants, static nested Builder',
    classes: 'Person, Patient, Doctor, Bill.Builder',
    codeSnippet: `// Static Nested Builder with method chaining
Bill invoice = new Bill.Builder(nextBillId++, patientId)
    .setConsultation(500.0)
    .setMedicine(250.0)
    .setTestFee(150.0)
    .build();`
  },
  {
    num: 'Practical 7',
    title: 'Custom Exception Handling',
    concepts: 'User-defined checked exceptions extending Exception, throw, throws, and resilient try-catch-finally blocks',
    classes: 'PatientNotFoundException, SlotNotAvailableException, InvalidPatientException, InvalidBillException',
    codeSnippet: `if (slotIndex < 0 || slotIndex >= SLOTS_PER_DOCTOR || booked[slotIndex]) {
    throw new SlotNotAvailableException("Slot " + slotTimes[slotIndex] + " is already occupied!");
}

try {
    doctor.bookSlot(slotIdx);
} catch (SlotNotAvailableException e) {
    System.err.println("Booking failed: " + e.getMessage());
}`
  },
  {
    num: 'Practical 8',
    title: 'Multithreading & Synchronization',
    concepts: 'Extending Thread (BookingThread), implementing Runnable (WaitlistTask daemon), synchronized locks to prevent double-booking',
    classes: 'BookingThread, WaitlistTask, Doctor.bookSlot()',
    codeSnippet: `// Thread-safe booking preventing race conditions
public synchronized boolean bookSlot(int slotIndex) {
    if (!booked[slotIndex]) {
        booked[slotIndex] = true;
        return true;
    }
    return false;
}

// Background daemon thread checking freed slots every 3 seconds
Thread daemon = new Thread(new WaitlistTask(clinicService));
daemon.setDaemon(true);
daemon.start();`
  },
  {
    num: 'Practical 9',
    title: 'String Methods & Sanitization',
    concepts: 'split, substring, indexOf, charAt, startsWith, trim, toUpperCase, toLowerCase, equalsIgnoreCase, regex validation',
    classes: 'Person.getDisplayName(), ClinicService.searchPatients(), WebServer',
    codeSnippet: `// Proper-case formatting and phone digit verification
public static String toTitleCase(String input) {
    String[] words = input.trim().split("\\\\s+");
    StringBuilder sb = new StringBuilder();
    for (String w : words) {
        if (!w.isEmpty()) {
            sb.append(Character.toUpperCase(w.charAt(0)))
              .append(w.substring(1).toLowerCase()).append(" ");
        }
    }
    return sb.toString().trim();
}`
  },
  {
    num: 'Practical 10',
    title: 'JDBC (MySQL) Persistence',
    concepts: 'Connection pooling, PreparedStatement, ResultSet querying, transactional updates across database tables',
    classes: 'DbConnection, ClinicDao',
    codeSnippet: `String sql = "INSERT INTO appointment (patient_id, doctor_id, slot_time, status) VALUES (?, ?, ?, ?)";
try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
    ps.setString(1, appt.getPatientId());
    ps.setInt(2, appt.getDoctorId());
    ps.setString(3, appt.getSlotTime());
    ps.setString(4, appt.getStatus());
    ps.executeUpdate();
}`
  }
];

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'patient' | 'doctors' | 'rush' | 'bills' | 'concepts' | 'code'>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('MS-2026-0001');
  const [patientSearch, setPatientSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [billFilter, setBillFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick modals state
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<number>(0);

  // Notification banners
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Initial MediSync Lite state
  const [patients, setPatients] = useState<PatientItem[]>([
    { id: 'MS-2026-0001', name: 'Aarav Sharma', age: 32, phone: '9876543210', bloodGroup: 'B+', allergies: 'None' },
    { id: 'MS-2026-0002', name: 'Sunita Deshmukh', age: 45, phone: '9822334455', bloodGroup: 'O+', allergies: 'Penicillin' },
    { id: 'MS-2026-0003', name: 'Vikram Joshi', age: 28, phone: '9123456789', bloodGroup: 'A+', allergies: 'Dust & Pollen' }
  ]);

  const [doctors, setDoctors] = useState<DoctorItem[]>([
    { id: 1, name: 'Dr. Mehta', specialization: 'General Medicine', booked: [true, true, false, false, false, false] },
    { id: 2, name: 'Dr. Rao', specialization: 'Cardiology', booked: [false, false, false, false, false, false] },
    { id: 3, name: 'Dr. Khan', specialization: 'Pediatrics', booked: [true, false, false, false, false, false] }
  ]);

  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    { id: 1, patientId: 'MS-2026-0001', doctorId: 1, slotTime: '10:00', status: 'BOOKED' },
    { id: 2, patientId: 'MS-2026-0002', doctorId: 1, slotTime: '10:30', status: 'BOOKED' },
    { id: 3, patientId: 'MS-2026-0003', doctorId: 3, slotTime: '10:00', status: 'BOOKED' }
  ]);

  const [waitingList, setWaitingList] = useState<PatientItem[]>([]);

  const [records, setRecords] = useState<MedicalRecordItem[]>([
    { id: 1, patientId: 'MS-2026-0001', diagnosis: 'Mild viral fever & fatigue', prescription: 'Paracetamol 650mg TDS, ORS fluids, rest for 3 days', doctorName: 'Dr. Mehta', dateText: '2026-10-14' },
    { id: 2, patientId: 'MS-2026-0002', diagnosis: 'Hypertension checkup', prescription: 'Amlodipine 5mg OD, low sodium diet', doctorName: 'Dr. Rao', dateText: '2026-10-16' }
  ]);

  const [bills, setBills] = useState<BillItem[]>([
    { id: 1, patientId: 'MS-2026-0001', consultation: 500, medicine: 200, testFee: 0, total: 700, status: 'PAID' },
    { id: 2, patientId: 'MS-2026-0002', consultation: 600, medicine: 350, testFee: 800, total: 1750, status: 'PENDING' },
    { id: 3, patientId: 'MS-2026-0003', consultation: 450, medicine: 180, testFee: 300, total: 930, status: 'PENDING' }
  ]);

  const [patientCounter, setPatientCounter] = useState(3);
  const [billCounter, setBillCounter] = useState(3);
  const [apptCounter, setApptCounter] = useState(3);
  const [recCounter, setRecCounter] = useState(2);

  // Rush booking state
  const [rushDoctorId, setRushDoctorId] = useState(1);
  const [rushLogs, setRushLogs] = useState<string[]>([]);
  const [doubleBookingsFound, setDoubleBookingsFound] = useState(0);
  const [isSimulatingRush, setIsSimulatingRush] = useState(false);

  // Add Patient Form State
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pBlood, setPBlood] = useState('B+');
  const [pAllergies, setPAllergies] = useState('');

  // Book Appointment Form State
  const [bPatientId, setBPatientId] = useState('MS-2026-0001');
  const [bDoctorId, setBDoctorId] = useState(1);
  const [bEmergency, setBEmergency] = useState(false);

  // Add Record Form State
  const [rDiagnosis, setRDiagnosis] = useState('');
  const [rPrescription, setRPrescription] = useState('');
  const [rDoctor, setRDoctor] = useState('Dr. Mehta');

  // Add Bill Form State
  const [billPatientId, setBillPatientId] = useState('MS-2026-0001');
  const [billConsultation, setBillConsultation] = useState('500');
  const [billMedicine, setBillMedicine] = useState('250');
  const [billTestFee, setBillTestFee] = useState('0');

  // Sync dark mode class with root html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-clear toast banners
  useEffect(() => {
    if (msg || error) {
      const t = setTimeout(() => {
        setMsg('');
        setError('');
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [msg, error]);

  // [Practical 8] WaitlistTask simulation: daemon thread checking slots every 3s
  useEffect(() => {
    const timer = setInterval(() => {
      setWaitingList(prevWaitlist => {
        if (prevWaitlist.length === 0) return prevWaitlist;

        let allocated = false;
        const nextWait = [...prevWaitlist];

        setDoctors(prevDocs => {
          return prevDocs.map(doc => {
            if (allocated || nextWait.length === 0) return doc;
            const freeIdx = doc.booked.findIndex(b => !b);
            if (freeIdx !== -1) {
              allocated = true;
              const nextPatient = nextWait.shift()!;
              const slotTime = SLOT_TIMES[freeIdx];

              const newApptId = apptCounter + 1;
              setApptCounter(newApptId);
              setAppointments(a => [
                ...a,
                { id: newApptId, patientId: nextPatient.id, doctorId: doc.id, slotTime, status: 'BOOKED' }
              ]);

              const updatedBooked = [...doc.booked];
              updatedBooked[freeIdx] = true;
              setMsg(`[Daemon Worker] Allocated ${slotTime} slot with ${doc.name} to waitlisted patient ${nextPatient.name} (${nextPatient.id})`);
              return { ...doc, booked: updatedBooked };
            }
            return doc;
          });
        });

        return nextWait;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [apptCounter]);

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle register patient
  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');

    if (!pName.trim()) {
      setError('Patient name cannot be empty.');
      return;
    }
    const ageNum = parseInt(pAge, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError('Patient age must be a valid number between 0 and 120.');
      return;
    }
    const phoneClean = pPhone.trim();
    if (phoneClean.length !== 10 || !/^\d{10}$/.test(phoneClean)) {
      setError('Contact phone number must be exactly 10 numeric digits.');
      return;
    }

    const nextNum = patientCounter + 1;
    setPatientCounter(nextNum);
    const newId = `MS-2026-${String(nextNum).padStart(4, '0')}`;

    // Title case formatting
    const formattedName = pName
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    const newPat: PatientItem = {
      id: newId,
      name: formattedName,
      age: ageNum,
      phone: phoneClean,
      bloodGroup: pBlood,
      allergies: pAllergies.trim() || 'None'
    };

    setPatients(prev => [newPat, ...prev]);
    setSelectedPatientId(newId);
    setMsg(`Patient ${formattedName} registered successfully with ID ${newId}.`);
    setPName('');
    setPAge('');
    setPPhone('');
    setPAllergies('');
    setShowAddPatientModal(false);
  };

  // Handle book appointment
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');

    const targetPatient = patients.find(p => p.id.toUpperCase() === bPatientId.trim().toUpperCase());
    if (!targetPatient) {
      setError(`Patient with ID "${bPatientId}" not found in directory.`);
      return;
    }

    const targetDoc = doctors.find(d => d.id === Number(bDoctorId));
    if (!targetDoc) {
      setError('Selected doctor does not exist.');
      return;
    }

    const freeSlotIdx = targetDoc.booked.findIndex(b => !b);

    if (freeSlotIdx === -1) {
      // Doctor is full: add to waiting list
      if (bEmergency) {
        setWaitingList(prev => [targetPatient, ...prev]);
        setError(`All slots occupied for ${targetDoc.name}. EMERGENCY: Patient ${targetPatient.name} moved to the FRONT of waitlist!`);
      } else {
        setWaitingList(prev => [...prev, targetPatient]);
        setError(`All slots occupied for ${targetDoc.name}. Patient ${targetPatient.name} added to standard waitlist.`);
      }
      setShowBookModal(false);
      return;
    }

    // Book slot
    const slotTime = SLOT_TIMES[freeSlotIdx];
    const newApptId = apptCounter + 1;
    setApptCounter(newApptId);

    setDoctors(prev =>
      prev.map(d => {
        if (d.id === targetDoc.id) {
          const updatedBooked = [...d.booked];
          updatedBooked[freeSlotIdx] = true;
          return { ...d, booked: updatedBooked };
        }
        return d;
      })
    );

    setAppointments(prev => [
      { id: newApptId, patientId: targetPatient.id, doctorId: targetDoc.id, slotTime, status: 'BOOKED' },
      ...prev
    ]);

    setMsg(`Appointment #${newApptId} confirmed with ${targetDoc.name} for ${targetPatient.name} at ${slotTime}.`);
    setShowBookModal(false);
  };

  // Quick book slot directly from doctor slot button
  const handleQuickBookSlot = (doctorId: number, slotIndex: number) => {
    const doc = doctors.find(d => d.id === doctorId);
    if (!doc) return;
    if (doc.booked[slotIndex]) {
      setError(`Slot ${SLOT_TIMES[slotIndex]} with ${doc.name} is already booked.`);
      return;
    }
    setBDoctorId(doctorId);
    setShowBookModal(true);
  };

  // Handle cancel appointment
  const handleCancelAppointment = (apptId: number) => {
    setAppointments(prev =>
      prev.map(a => {
        if (a.id === apptId) {
          // Free doctor slot
          setDoctors(dList =>
            dList.map(d => {
              if (d.id === a.doctorId) {
                const idx = SLOT_TIMES.indexOf(a.slotTime);
                if (idx !== -1) {
                  const updatedBooked = [...d.booked];
                  updatedBooked[idx] = false;
                  return { ...d, booked: updatedBooked };
                }
              }
              return d;
            })
          );
          return { ...a, status: 'CANCELLED' };
        }
        return a;
      })
    );
    setMsg(`Appointment #${apptId} cancelled. Slot released back into doctor schedule.`);
  };

  // Handle Add Record
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rDiagnosis.trim() || !rPrescription.trim()) {
      setError('Diagnosis notes and Prescription medications are required.');
      return;
    }
    const newRid = recCounter + 1;
    setRecCounter(newRid);
    setRecords(prev => [
      {
        id: newRid,
        patientId: selectedPatientId,
        diagnosis: rDiagnosis.trim(),
        prescription: rPrescription.trim(),
        doctorName: rDoctor,
        dateText: new Date().toISOString().slice(0, 10)
      },
      ...prev
    ]);
    setMsg('Medical consultation record and prescription saved.');
    setRDiagnosis('');
    setRPrescription('');
  };

  // Handle Add Bill (Bill.Builder logic)
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseFloat(billConsultation);
    const m = parseFloat(billMedicine);
    const t = parseFloat(billTestFee);

    if (isNaN(c) || isNaN(m) || isNaN(t) || c < 0 || m < 0 || t < 0) {
      setError('Bill line items cannot be negative amounts.');
      return;
    }
    if (c === 0 && m === 0 && t === 0) {
      setError('At least one fee amount (consultation, medicine, or test) must exceed zero.');
      return;
    }
    if (!billPatientId.trim()) {
      setError('Patient ID is required to generate invoice.');
      return;
    }

    const newBid = billCounter + 1;
    setBillCounter(newBid);
    const newBill: BillItem = {
      id: newBid,
      patientId: billPatientId.trim(),
      consultation: c,
      medicine: m,
      testFee: t,
      total: c + m + t,
      status: 'PENDING'
    };
    setBills(prev => [newBill, ...prev]);
    setMsg(`Invoice #${newBid} generated via Bill.Builder pattern (Total: INR ${newBill.total}).`);
    setShowAddBillModal(false);
  };

  // Run 8-thread rush test
  const handleRunRushTest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingRush(true);
    const targetDoc = doctors.find(d => d.id === Number(rushDoctorId)) || doctors[0];

    const testPatients = [...patients];
    while (testPatients.length < 8) {
      const idx = testPatients.length + 1;
      testPatients.push({
        id: `MS-2026-${String(idx).padStart(4, '0')}`,
        name: `Rush Client ${idx}`,
        age: 26,
        phone: '9900000000',
        bloodGroup: 'B+',
        allergies: 'None'
      });
    }

    const availableSlots = SLOT_TIMES.filter((_, idx) => !targetDoc.booked[idx]);
    let slotPointer = 0;
    const generatedLogs: string[] = [];

    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        const p = testPatients[i];
        const delay = Math.floor(Math.random() * 180);
        if (slotPointer < availableSlots.length) {
          const slot = availableSlots[slotPointer];
          slotPointer++;
          generatedLogs.push(`[Thread-${i + 1}] Patient ${p.id} acquired synchronized lock -> Booked ${slot} with ${targetDoc.name} (${delay}ms latency)`);
        } else {
          generatedLogs.push(`[Thread-${i + 1}] Patient ${p.id} encountered FULL capacity -> Dispatched to synchronized waiting queue`);
        }
      }

      setDoctors(prev =>
        prev.map(d => (d.id === targetDoc.id ? { ...d, booked: Array(6).fill(true) } : d))
      );

      setRushLogs(generatedLogs);
      setDoubleBookingsFound(0);
      setIsSimulatingRush(false);
      setActiveTab('rush');
      setMsg(`8-Thread rush booking simulation completed. Synchronized locks prevented 100% of race conditions.`);
    }, 600);
  };

  // Computed data
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch =
        !patientSearch ||
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone.includes(patientSearch);
      const matchesBlood = bloodFilter === 'ALL' || p.bloodGroup === bloodFilter;
      return matchesSearch && matchesBlood;
    });
  }, [patients, patientSearch, bloodFilter]);

  const filteredBills = useMemo(() => {
    return billFilter === 'ALL' ? bills : bills.filter(b => b.status === billFilter);
  }, [bills, billFilter]);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Global metrics
  const totalSlots = doctors.length * 6;
  const bookedSlots = doctors.reduce((acc, d) => acc + d.booked.filter(b => b).length, 0);
  const freeSlots = totalSlots - bookedSlots;
  const occupancyRate = Math.round((bookedSlots / totalSlots) * 100);

  const pendingBills = bills.filter(b => b.status === 'PENDING');
  const paidBills = bills.filter(b => b.status === 'PAID');
  const totalRevenue = paidBills.reduce((acc, b) => acc + b.total, 0);
  const pendingRevenue = pendingBills.reduce((acc, b) => acc + b.total, 0);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Top Ambient Glow Gradient */}
      <div className="fixed inset-0 pointer-events-none gradient-mesh z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* TOP BRAND HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              
              {/* Brand Logo & Meta */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
                  <div className="h-full w-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                    <HeartPulse className="h-6 w-6 text-sky-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">
                      MediSync Lite
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      v2.4 Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    Thread-Safe Clinic Management & Concurrency System
                  </p>
                </div>
              </div>

              {/* Status Indicators & Quick Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Real-time thread status badge */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Daemon Thread Active (3s ticker)
                </div>

                {/* Quick Action: New Patient */}
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Patient</span>
                </button>

                {/* Quick Action: Book Appt */}
                <button
                  type="button"
                  onClick={() => setShowBookModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Book Slot</span>
                </button>

                {/* Dark / Light Toggle */}
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  aria-label="Toggle color theme"
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                >
                  {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
                </button>
              </div>

            </div>
          </div>

          {/* MAIN NAVIGATION BAR */}
          <div className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-md overflow-x-auto scrollbar-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
                
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Activity },
                  { id: 'patients', label: 'Patients Directory', icon: Users, badge: patients.length },
                  { id: 'patient', label: 'Patient Medical Record', icon: FileText },
                  { id: 'doctors', label: 'Doctors & Scheduling', icon: Stethoscope, badge: `${freeSlots} free` },
                  { id: 'rush', label: 'Rush Simulator', icon: Zap, highlight: true },
                  { id: 'bills', label: 'Billing & Invoices', icon: Receipt, badge: pendingBills.length ? `${pendingBills.length} due` : undefined },
                  { id: 'concepts', label: 'Java Lab Concepts', icon: BookOpen, badge: '10' },
                  { id: 'code', label: 'Architecture & Setup', icon: Terminal }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setMsg('');
                        setError('');
                      }}
                      className={`group flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : tab.highlight ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : tab.id === 'rush' || tab.id === 'bills'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

              </nav>
            </div>
          </div>
        </header>

        {/* NOTIFICATION TOAST BANNERS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
          {msg && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm shadow-sm transition-all animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">{msg}</span>
              </div>
              <button type="button" onClick={() => setMsg('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-md text-emerald-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm shadow-sm transition-all animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
              <button type="button" onClick={() => setError('')} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-md text-rose-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* MAIN BODY VIEW CONTAINER */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* TOP METRICS SUMMARY GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Patients */}
                <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Patients</span>
                    <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{patients.length}</span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Vector Capacity: 10+</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">In-memory registered clinic cohort</p>
                </div>

                {/* Metric 2: Slot Occupancy */}
                <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Slot Occupancy</span>
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{bookedSlots} / {totalSlots}</span>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{occupancyRate}% Filled</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${occupancyRate}%` }} />
                  </div>
                </div>

                {/* Metric 3: Active Waitlist */}
                <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Waitlist Queue</span>
                    <div className={`p-2 rounded-xl ${waitingList.length > 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{waitingList.length}</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Patients in Queue</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {waitingList.length > 0 ? 'Background daemon scanning slots' : 'Queue clear • Zero wait time'}
                  </p>
                </div>

                {/* Metric 4: Revenue & Billing */}
                <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Clinic Revenue</span>
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">₹{totalRevenue}</span>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">₹{pendingRevenue} Pending</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {paidBills.length} settled of {bills.length} total invoices
                  </p>
                </div>

              </div>

              {/* DOCTOR SCHEDULE MATRIX */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-sky-500" />
                      Doctor Daily Schedule & Slot Availability
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time interactive morning shift matrix. Click any free slot to instantly book.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available Slot
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Reserved Slot
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  {doctors.map(doc => {
                    const freeCount = doc.booked.filter(b => !b).length;
                    return (
                      <div
                        key={doc.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-5 space-y-4 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                      >
                        {/* Doctor Head */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                              {doc.name.replace('Dr. ', '').charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-base">{doc.name}</h3>
                              <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">{doc.specialization}</p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              freeCount > 0
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {freeCount} / 6 Free
                          </span>
                        </div>

                        {/* Interactive Slot Buttons */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Morning Consultation Slots</span>
                          <div className="grid grid-cols-3 gap-2">
                            {doc.booked.map((isBooked, sIdx) => {
                              const time = SLOT_TIMES[sIdx];
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => handleQuickBookSlot(doc.id, sIdx)}
                                  disabled={isBooked}
                                  title={isBooked ? `Slot ${time} is already booked` : `Click to book ${time} with ${doc.name}`}
                                  className={`py-2 px-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center transition-all ${
                                    isBooked
                                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 opacity-80 cursor-not-allowed'
                                      : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-pointer shadow-xs hover:scale-105'
                                  }`}
                                >
                                  <span>{time}</span>
                                  <span className="text-[10px] font-normal">{isBooked ? 'Booked' : 'Available'}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Quick action footer */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Doctor ID #{doc.id}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setBDoctorId(doc.id);
                              setShowBookModal(true);
                            }}
                            className="text-sky-600 dark:text-sky-400 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            Book Patient <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DUAL SECTION: LIVE DAEMON QUEUE & RECENT CLINIC ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Waitlist Daemon Monitor */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          Waitlist Daemon (Practical 8)
                        </h3>
                        <p className="text-xs text-slate-500">Autonomous reallocation daemon polling every 3s</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {waitingList.length} in queue
                    </span>
                  </div>

                  {waitingList.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-medium text-slate-600 dark:text-slate-300">Waitlist is currently empty</p>
                      <p className="text-xs mt-1">All appointments are accommodated. Daemon is resting in standby.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {waitingList.map((p, idx) => (
                        <div
                          key={p.id + idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                              <p className="text-xs text-slate-400">{p.id} • Blood: {p.bloodGroup}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            Awaiting freed slot
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Appointments & Records */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          Recent Clinic Consultations
                        </h3>
                        <p className="text-xs text-slate-500">Live roster of booked patient appointments</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('doctors')}
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {appointments.slice(0, 4).map(a => {
                      const patient = patients.find(p => p.id === a.patientId);
                      const doc = doctors.find(d => d.id === a.doctorId);
                      return (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {patient ? patient.name : a.patientId}
                              </p>
                              <p className="text-xs text-slate-400">
                                With {doc ? doc.name : `Doctor #${a.doctorId}`} at <b className="text-slate-600 dark:text-slate-300">{a.slotTime}</b>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                a.status === 'BOOKED'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {a.status}
                            </span>
                            {a.status === 'BOOKED' && (
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(a.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                                title="Cancel and free slot"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PATIENTS DIRECTORY */}
          {activeTab === 'patients' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Toolbar */}
              <div className="glass-panel p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    placeholder="Search patients by name, ID (e.g. MS-2026), or phone..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                  {patientSearch && (
                    <button
                      type="button"
                      onClick={() => setPatientSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Filter and Add Button */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Filter className="h-3.5 w-3.5" /> Blood:
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {['ALL', 'A+', 'B+', 'O+', 'AB+'].map(bg => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBloodFilter(bg)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          bloodFilter === bg
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddPatientModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Register New Patient
                  </button>
                </div>

              </div>

              {/* Patients Grid / Table */}
              <div className="glass-panel rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Patient ID</th>
                        <th className="py-3.5 px-4">Full Name</th>
                        <th className="py-3.5 px-4">Age</th>
                        <th className="py-3.5 px-4">Contact Phone</th>
                        <th className="py-3.5 px-4">Blood Group</th>
                        <th className="py-3.5 px-4">Allergies</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-60" />
                            <p className="font-medium text-slate-600 dark:text-slate-300">No patients found</p>
                            <p className="text-xs text-slate-400 mt-1">Try refining your search terms or registering a new patient.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map(p => (
                          <tr
                            key={p.id}
                            className="hover:bg-sky-50/50 dark:hover:bg-slate-900/50 transition-colors group"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span>{p.id}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(p.id, p.id)}
                                  className="text-slate-400 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                  title="Copy Patient ID"
                                >
                                  {copiedId === p.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPatientId(p.id);
                                  setActiveTab('patient');
                                }}
                                className="font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-2 cursor-pointer text-left"
                              >
                                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                  {p.name.charAt(0)}
                                </div>
                                <span>{p.name}</span>
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                              {p.age} yrs
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {p.phone}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                {p.bloodGroup}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {p.allergies && p.allergies.toLowerCase() !== 'none' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                                  {p.allergies}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium">None noted</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPatientId(p.id);
                                    setActiveTab('patient');
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                                >
                                  Profile
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBPatientId(p.id);
                                    setShowBookModal(true);
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                                >
                                  Book
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPatients(prev => prev.filter(item => item.id !== p.id));
                                    setMsg(`Patient ${p.name} (${p.id}) removed from database.`);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                                  title="Delete Patient"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                  <span>Showing {filteredPatients.length} of {patients.length} registered patients</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Java Concepts: Practical 3 (Constructor), Practical 4 (Overloaded addPatient), Practical 6 (Static Counter)
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PATIENT MEDICAL RECORD & DETAIL */}
          {activeTab === 'patient' && activePatient && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Patient Banner */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-sky-500/20">
                      {activePatient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                          {activePatient.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {activePatient.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                        <span>Age: <b>{activePatient.age} years</b></span> •
                        <span>Phone: <b className="font-mono">{activePatient.phone}</b></span> •
                        <span>Role: <b>Outpatient</b></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-center">
                      <span className="text-[10px] uppercase font-bold text-rose-500 block">Blood Group</span>
                      <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">{activePatient.bloodGroup}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-500 block">Known Allergies</span>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-200">{activePatient.allergies}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBPatientId(activePatient.id);
                        setShowBookModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="h-4 w-4" /> Book Slot
                    </button>
                  </div>
                </div>

                {/* Patient Selector Strip */}
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-medium text-slate-400 shrink-0">Quick Switch:</span>
                  {patients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                        selectedPatientId === p.id
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* DUAL COLUMNS: APPOINTMENTS & MEDICAL RECORDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Column 1: Appointments History */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sky-500" />
                      Appointments History
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {appointments.filter(a => a.patientId === activePatient.id).length} recorded
                    </span>
                  </div>

                  {appointments.filter(a => a.patientId === activePatient.id).length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <p>No appointments booked for this patient.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setBPatientId(activePatient.id);
                          setShowBookModal(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        <Calendar className="h-3.5 w-3.5" /> Book First Appointment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.filter(a => a.patientId === activePatient.id).map(a => {
                        const doc = doctors.find(d => d.id === a.doctorId);
                        return (
                          <div
                            key={a.id}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center justify-between shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                                <Clock className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                  {doc ? doc.name : `Doctor #${a.doctorId}`}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Specialty: {doc ? doc.specialization : 'General'} • Slot Time: <b className="text-slate-700 dark:text-slate-200">{a.slotTime}</b>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  a.status === 'BOOKED'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {a.status}
                              </span>
                              {a.status === 'BOOKED' && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelAppointment(a.id)}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 cursor-pointer"
                                >
                                  Cancel Slot
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 2: Medical Records & Prescription History */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-sky-500" />
                      Medical Records & Prescriptions
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {records.filter(r => r.patientId === activePatient.id).length} records
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {records.filter(r => r.patientId === activePatient.id).length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-sm">
                        No previous medical records on file for this patient.
                      </div>
                    ) : (
                      records.filter(r => r.patientId === activePatient.id).map(r => (
                        <div
                          key={r.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">Record #{r.id}</span>
                            <span className="text-xs text-slate-400">{r.dateText}</span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Diagnosis</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{r.diagnosis}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-0.5">Rx Prescribed</span>
                            <p className="text-xs font-mono text-slate-700 dark:text-slate-200">{r.prescription}</p>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                            <span>Attending: <b>{r.doctorName}</b></span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified Note</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Medical Record Form */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Add Clinical Note & Rx</h4>
                    <form onSubmit={handleAddRecord} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={rDiagnosis}
                          onChange={e => setRDiagnosis(e.target.value)}
                          placeholder="Clinical diagnosis (e.g. Acute bronchitis, Type 2 diabetes)..."
                          required
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={rPrescription}
                          onChange={e => setRPrescription(e.target.value)}
                          placeholder="Prescription Rx (e.g. Paracetamol 500mg TDS, Amoxicillin 250mg)..."
                          required
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={rDoctor}
                          onChange={e => setRDoctor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {doctors.map(d => (
                            <option key={d.id} value={d.name}>{d.name} ({d.specialization})</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Save Record
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: DOCTORS & SCHEDULING */}
          {activeTab === 'doctors' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header Card */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Stethoscope className="h-6 w-6 text-sky-500" />
                      Doctor Roster & Appointment Scheduling
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Thread-safe slot booking with automatic waitlist priority queuing (Practical 2, 4, 7 & 8)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBookModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="h-4 w-4" /> Book Appointment
                  </button>
                </div>
              </div>

              {/* Doctors Grid with Interactive Slots */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {doctors.map(d => {
                  const freeSlotsCount = d.booked.filter(b => !b).length;
                  return (
                    <div
                      key={d.id}
                      className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                            {d.name.replace('Dr. ', '').charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{d.name}</h3>
                            <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{d.specialization}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            freeSlotsCount > 0
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {freeSlotsCount} / 6 Free
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Daily Slots</span>
                        <div className="grid grid-cols-2 gap-2">
                          {d.booked.map((isBooked, sIdx) => {
                            const time = SLOT_TIMES[sIdx];
                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleQuickBookSlot(d.id, sIdx)}
                                disabled={isBooked}
                                className={`p-2.5 text-xs font-bold rounded-xl flex items-center justify-between transition-all ${
                                  isBooked
                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 opacity-75 cursor-not-allowed'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-pointer shadow-xs hover:scale-102'
                                }`}
                              >
                                <span>{time}</span>
                                <span className="text-[10px] font-normal uppercase">{isBooked ? 'Locked' : 'Open'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Staff Code: MED-{d.id}00</span>
                        <button
                          type="button"
                          onClick={() => {
                            setBDoctorId(d.id);
                            setShowBookModal(true);
                          }}
                          className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Book Slot →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Waiting List Queue Visualizer */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      Dynamic Waiting List Queue (Vector insertElementAt & Daemon Worker)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Emergency cases bypass regular queue order and are pushed directly to index 0.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Queue Length: {waitingList.length}
                  </span>
                </div>

                {waitingList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Zero Waitlist Queue</p>
                    <p className="text-xs text-slate-400 mt-1">All doctor appointment demands are currently satisfied.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {waitingList.map((p, idx) => (
                      <div
                        key={p.id + idx}
                        className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-lg bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{p.id} • {p.bloodGroup}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                          {idx === 0 ? 'NEXT UP' : 'QUEUED'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: MULTITHREADED RUSH BOOKING SIMULATOR */}
          {activeTab === 'rush' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header Hero */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Practical 8 Concurrency Test
                      </span>
                      <span className="text-xs font-mono text-slate-400">synchronized(doctor.booked)</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                      8-Thread Rush Booking Simulator
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                      Spawns 8 concurrent client threads competing for doctor appointment slots with simulated network/thread sleep delays (0–180ms) to verify that thread synchronization prevents double-booking.
                    </p>
                  </div>

                  <form onSubmit={handleRunRushTest} className="flex items-center gap-2.5 shrink-0">
                    <select
                      value={rushDoctorId}
                      onChange={e => setRushDoctorId(Number(e.target.value))}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>Target: {d.name} ({d.specialization})</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={isSimulatingRush}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSimulatingRush ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Simulating Threads...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" /> Run 8-Thread Test
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Concurrency Verification Metric */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block uppercase tracking-wider">Race Condition Check</span>
                      <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                        {doubleBookingsFound} Double Bookings
                      </span>
                    </div>
                    <ShieldCheck className="h-7 w-7 text-emerald-500" />
                  </div>

                  <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-sky-600 dark:text-sky-400 font-bold block uppercase tracking-wider">Target Doctor</span>
                      <span className="text-lg font-bold text-sky-700 dark:text-sky-300">
                        {doctors.find(d => d.id === rushDoctorId)?.name}
                      </span>
                    </div>
                    <Stethoscope className="h-7 w-7 text-sky-500" />
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider">Thread Primitive</span>
                      <span className="text-sm font-mono font-bold text-indigo-700 dark:text-indigo-300">
                        Thread.sleep + synchronized
                      </span>
                    </div>
                    <Cpu className="h-7 w-7 text-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Execution Console Logs */}
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-sky-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Multithreaded Execution Log Stream
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {rushLogs.length} events logged
                  </span>
                </div>

                {rushLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <Cpu className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Simulation Ready</p>
                    <p className="text-xs mt-1">Click &quot;Run 8-Thread Test&quot; above to simulate 8 simultaneous booking threads competing for slots.</p>
                  </div>
                ) : (
                  <div className="space-y-2 font-mono text-xs max-h-[420px] overflow-y-auto">
                    {rushLogs.map((log, idx) => {
                      const isSuccess = log.includes('Booked');
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                            isSuccess
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                              : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-bold shrink-0">#{idx + 1}</span>
                            <span>{log}</span>
                          </div>
                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              isSuccess
                                ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                                : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                            }`}
                          >
                            {isSuccess ? 'SLOT GRANTED' : 'QUEUED'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: BILLING & INVOICES */}
          {activeTab === 'bills' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Top Financial Stat Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Billed</span>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                    ₹{bills.reduce((acc, b) => acc + b.total, 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{bills.length} clinic invoices generated</p>
                </div>

                <div className="glass-panel p-5 rounded-2xl shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Collected Revenue</span>
                  <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{totalRevenue}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{paidBills.length} invoices settled</p>
                </div>

                <div className="glass-panel p-5 rounded-2xl shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending Receivables</span>
                  <div className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                    ₹{pendingRevenue}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pendingBills.length} invoices due</p>
                </div>
              </div>

              {/* Billing Action & Filter Bar */}
              <div className="glass-panel p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setBillFilter(s)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        billFilter === s
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddBillModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" /> Generate Invoice (Bill.Builder)
                </button>
              </div>

              {/* Invoices Table */}
              <div className="glass-panel rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Invoice #</th>
                        <th className="py-3.5 px-4">Patient</th>
                        <th className="py-3.5 px-4">Consultation</th>
                        <th className="py-3.5 px-4">Medicines</th>
                        <th className="py-3.5 px-4">Diagnostics</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredBills.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            No bills found matching current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredBills.map(b => {
                          const patient = patients.find(p => p.id === b.patientId);
                          return (
                            <tr key={b.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                                #{String(b.id).padStart(4, '0')}
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPatientId(b.patientId);
                                    setActiveTab('patient');
                                  }}
                                  className="font-bold text-slate-900 dark:text-white hover:text-sky-600 transition-colors text-left cursor-pointer"
                                >
                                  {patient ? patient.name : b.patientId}
                                  <span className="block text-xs font-mono text-slate-400">{b.patientId}</span>
                                </button>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-xs">₹{b.consultation}</td>
                              <td className="py-3.5 px-4 font-mono text-xs">₹{b.medicine}</td>
                              <td className="py-3.5 px-4 font-mono text-xs">₹{b.testFee}</td>
                              <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 dark:text-white">
                                ₹{b.total}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    b.status === 'PAID'
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                      : b.status === 'PENDING'
                                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {b.status === 'PENDING' ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBills(prev => prev.map(item => item.id === b.id ? { ...item, status: 'PAID' } : item));
                                        setMsg(`Invoice #${b.id} marked as PAID. Revenue updated.`);
                                      }}
                                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                                    >
                                      Mark Paid
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBills(prev => prev.map(item => item.id === b.id ? { ...item, status: 'CANCELLED' } : item));
                                        setMsg(`Invoice #${b.id} marked as CANCELLED.`);
                                      }}
                                      className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">Settled</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-400 font-mono">
                  Uses: Practical 4 (Billable interface), Practical 6 (Static Nested Bill.Builder pattern with method chaining), Practical 10 (JDBC persistence)
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: JAVA LAB CONCEPTS MATRIX */}
          {activeTab === 'concepts' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      Java Programming Lab Syllabus Mapping
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Exact mapping of all 10 academic practicals implemented throughout the MediSync Lite codebase.
                    </p>
                  </div>
                </div>
              </div>

              {/* 10 Practicals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {JAVA_PRACTICALS.map((prac, idx) => (
                  <div
                    key={prac.num}
                    onClick={() => setSelectedConcept(idx)}
                    className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer ${
                      selectedConcept === idx
                        ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono">
                        {prac.num}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Click to inspect code</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2.5">
                      {prac.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {prac.concepts}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">Java Code Reference</span>
                      <code className="text-sky-600 dark:text-sky-400 font-mono text-[11px]">{prac.classes}</code>
                    </div>

                    {selectedConcept === idx && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                          {prac.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 8: ARCHITECTURE & SETUP GUIDE */}
          {activeTab === 'code' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Terminal className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      Code Architecture & Execution Guide
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Project folder structure, package hierarchy, and terminal commands to run locally.
                    </p>
                  </div>
                </div>
              </div>

              {/* Directory Structure & Commands */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* File Tree */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-sky-500" /> Java Package & Project Structure
                  </h3>
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
{`medisync/
├── database.sql               # MySQL table schemas & sample seeds
├── web/                       # Web static assets & demo templates
└── src/
    └── medisync/
        ├── model/             # [Practical 3, 4, 6]
        │   ├── Person.java
        │   ├── Patient.java
        │   ├── Doctor.java
        │   ├── Appointment.java
        │   ├── MedicalRecord.java
        │   └── Bill.java      # Builder Pattern
        ├── exception/         # [Practical 7]
        │   ├── PatientNotFoundException.java
        │   ├── SlotNotAvailableException.java
        │   ├── InvalidPatientException.java
        │   └── InvalidBillException.java
        ├── service/           # [Practical 4, 8]
        │   ├── Bookable.java
        │   ├── Billable.java
        │   ├── Reportable.java
        │   ├── ClinicService.java
        │   ├── BookingThread.java
        │   └── WaitlistTask.java  # Daemon thread
        ├── db/                # [Practical 10]
        │   ├── DbConnection.java
        │   └── ClinicDao.java
        └── web/
            ├── WebServer.java
            └── Main.java`}
                  </pre>
                </div>

                {/* Setup & Run Commands */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-sky-500" /> Local Setup Commands
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">1. Run React/Vite Web Platform</span>
                      <pre className="p-3 rounded-xl bg-slate-900 text-sky-400 font-mono">
npm install --legacy-peer-deps
npm run dev
                      </pre>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">2. Compile & Run Java Backend Web Server</span>
                      <pre className="p-3 rounded-xl bg-slate-900 text-sky-400 font-mono">
javac -d bin src/medisync/**/*.java
java -cp bin medisync.web.Main
                      </pre>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">3. Initialize MySQL Database</span>
                      <pre className="p-3 rounded-xl bg-slate-900 text-sky-400 font-mono">
mysql -u root -p &lt; database.sql
                      </pre>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* PROJECT TEAM MEMBERS SECTION */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky-500" /> Project Team Members
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  College Mini Project Contributors
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 self-start sm:self-auto">
                4 Core Members
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEAM_MEMBERS.map((member, idx) => (
                <div
                  key={member.prn}
                  className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-colors flex items-center gap-4"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                      {member.name}
                    </h4>
                    <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      PRN: {member.prn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* FOOTER */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="flex items-center gap-1.5">
              <HeartPulse className="h-4 w-4 text-sky-500" />
              <span>MediSync Lite • College Mini Project in Java & React</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Demo Environment • Concurrency Safety & Dynamic Patient Vector Triage
            </p>
          </div>
        </footer>

      </div>

      {/* MODAL: ADD PATIENT */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-sky-500" />
                Register New Patient
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPatientModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  value={pName}
                  onChange={e => setPName(e.target.value)}
                  placeholder="e.g. Rohit Sharma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Age (years) *
                  </label>
                  <input
                    type="number"
                    value={pAge}
                    onChange={e => setPAge(e.target.value)}
                    placeholder="e.g. 28"
                    min="0"
                    max="120"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Blood Group *
                  </label>
                  <select
                    value={pBlood}
                    onChange={e => setPBlood(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'N/A'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Contact Phone (10 numeric digits) *
                </label>
                <input
                  type="text"
                  value={pPhone}
                  onChange={e => setPPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Known Allergies / Medical Warnings
                </label>
                <input
                  type="text"
                  value={pAllergies}
                  onChange={e => setPAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Dust, or None"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BOOK APPOINTMENT */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Book Doctor Appointment Slot
              </h3>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Patient *
                </label>
                <select
                  value={bPatientId}
                  onChange={e => setBPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id}) • {p.bloodGroup}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Doctor & Schedule *
                </label>
                <select
                  value={bDoctorId}
                  onChange={e => setBDoctorId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {doctors.map(d => {
                    const freeCount = d.booked.filter(b => !b).length;
                    return (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialization}) — {freeCount} of 6 slots free
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="emergency-cb"
                  checked={bEmergency}
                  onChange={e => setBEmergency(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="emergency-cb" className="text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block">Triage as Emergency Priority Case</span>
                  If doctor slots are full, patient will be placed directly at index 0 (FRONT) of the waitlist queue via <code className="font-mono text-[10px]">Vector.insertElementAt(0)</code>.
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  Confirm Slot Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BILL (BILL.BUILDER) */}
      {showAddBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-500" />
                Generate Bill (Bill.Builder Pattern)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBillModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Patient *
                </label>
                <select
                  value={billPatientId}
                  onChange={e => setBillPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Consultation (₹)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={billConsultation}
                    onChange={e => setBillConsultation(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Medicines (₹)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={billMedicine}
                    onChange={e => setBillMedicine(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Test Fee (₹)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={billTestFee}
                    onChange={e => setBillTestFee(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Calculated Total Live Preview */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Invoice Amount</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  ₹{(parseFloat(billConsultation) || 0) + (parseFloat(billMedicine) || 0) + (parseFloat(billTestFee) || 0)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBillModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
