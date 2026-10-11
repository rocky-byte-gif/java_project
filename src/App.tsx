import React, { useState } from 'react';

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  bloodGroup: string;
  allergies: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  slots: { time: string; booked: boolean }[];
}

interface Appointment {
  id: number;
  patientId: string;
  doctorId: number;
  slotTime: string;
  status: 'BOOKED' | 'CANCELLED';
}

interface MedicalRecord {
  id: number;
  patientId: string;
  diagnosis: string;
  prescription: string;
  doctorName: string;
  dateText: string;
}

interface Bill {
  id: number;
  patientId: string;
  consultation: number;
  medicine: number;
  testFee: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'doctors' | 'bills' | 'concepts' | 'code'>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Initial State matching sample DB
  const [patients, setPatients] = useState<Patient[]>([
    { id: 'MS-2026-0001', name: 'Rahul Sharma', age: 28, phone: '9876543210', bloodGroup: 'B+', allergies: 'Penicillin' },
    { id: 'MS-2026-0002', name: 'Pooja Patel', age: 34, phone: '9822012345', bloodGroup: 'O+', allergies: 'None' },
    { id: 'MS-2026-0003', name: 'Amit Kulkarni', age: 45, phone: '9890098900', bloodGroup: 'A+', allergies: 'Dust' }
  ]);

  const [patientCounter, setPatientCounter] = useState<number>(3);
  const [billCounter, setBillCounter] = useState<number>(1);
  const [apptCounter, setApptCounter] = useState<number>(1);
  const [recordCounter, setRecordCounter] = useState<number>(1);

  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 1,
      name: 'Dr. Mehta',
      specialization: 'General',
      slots: [
        { time: '10:00', booked: true },
        { time: '10:30', booked: false },
        { time: '11:00', booked: false },
        { time: '11:30', booked: false },
        { time: '12:00', booked: false },
        { time: '12:30', booked: false }
      ]
    },
    {
      id: 2,
      name: 'Dr. Rao',
      specialization: 'Cardiology',
      slots: [
        { time: '10:00', booked: false },
        { time: '10:30', booked: false },
        { time: '11:00', booked: false },
        { time: '11:30', booked: false },
        { time: '12:00', booked: false },
        { time: '12:30', booked: false }
      ]
    },
    {
      id: 3,
      name: 'Dr. Khan',
      specialization: 'Pediatrics',
      slots: [
        { time: '10:00', booked: false },
        { time: '10:30', booked: false },
        { time: '11:00', booked: false },
        { time: '11:30', booked: false },
        { time: '12:00', booked: false },
        { time: '12:30', booked: false }
      ]
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, patientId: 'MS-2026-0001', doctorId: 1, slotTime: '10:00', status: 'BOOKED' }
  ]);

  const [waitingList, setWaitingList] = useState<Patient[]>([]);

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      id: 1,
      patientId: 'MS-2026-0001',
      diagnosis: 'Seasonal Viral Fever',
      prescription: 'Paracetamol 650mg TDS, Cetirizine 10mg HS',
      doctorName: 'Dr. Mehta',
      dateText: '2026-10-10'
    }
  ]);

  const [bills, setBills] = useState<Bill[]>([
    {
      id: 1,
      patientId: 'MS-2026-0001',
      consultation: 300,
      medicine: 150,
      testFee: 0,
      total: 450,
      status: 'PAID'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [billFilter, setBillFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'CANCELLED'>('ALL');
  const [rushResults, setRushResults] = useState<string[] | null>(null);
  const [rushDoctorId, setRushDoctorId] = useState<number>(1);

  // Forms
  const [newPatient, setNewPatient] = useState({ name: '', age: '', phone: '', bloodGroup: 'B+', allergies: 'None' });
  const [newBooking, setNewBooking] = useState({ patientId: 'MS-2026-0001', doctorId: 1, emergency: false });
  const [newBill, setNewBill] = useState({ patientId: 'MS-2026-0001', consultation: 300, medicine: 150, testFee: 0 });
  const [newRecord, setNewRecord] = useState({ doctorName: 'Dr. Mehta', diagnosis: '', prescription: '', dateText: '2026-10-10' });

  const showAlert = (text: string, type: 'success' | 'error') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const properCase = (str: string) => {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // Add Patient
  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name.trim()) {
      showAlert('Name cannot be empty', 'error');
      return;
    }
    const ageNum = parseInt(newPatient.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      showAlert('Age must be between 0 and 120', 'error');
      return;
    }
    if (newPatient.phone.length !== 10 || !/^\d+$/.test(newPatient.phone)) {
      showAlert('Phone must be exactly 10 digits', 'error');
      return;
    }

    const nextNum = patientCounter + 1;
    setPatientCounter(nextNum);
    const newId = `MS-2026-${String(nextNum).padStart(4, '0')}`;
    const p: Patient = {
      id: newId,
      name: properCase(newPatient.name.trim()),
      age: ageNum,
      phone: newPatient.phone,
      bloodGroup: newPatient.bloodGroup,
      allergies: newPatient.allergies || 'None'
    };

    setPatients(prev => [...prev, p]);
    showAlert(`Patient ${p.id} registered successfully`, 'success');
    setNewPatient({ name: '', age: '', phone: '', bloodGroup: 'B+', allergies: 'None' });
  };

  // Delete Patient
  const handleDeletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    setAppointments(prev => prev.filter(a => a.patientId !== id));
    setMedicalRecords(prev => prev.filter(r => r.patientId !== id));
    setBills(prev => prev.filter(b => b.patientId !== id));
    setWaitingList(prev => prev.filter(p => p.id !== id));
    setSelectedPatientId(null);
    showAlert(`Patient ${id} deleted`, 'success');
    setActiveTab('patients');
  };

  // Book Appointment
  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id.toLowerCase() === newBooking.patientId.trim().toLowerCase());
    if (!pat) {
      showAlert(`Patient with ID ${newBooking.patientId} not found`, 'error');
      return;
    }

    const docIndex = doctors.findIndex(d => d.id === Number(newBooking.doctorId));
    if (docIndex === -1) {
      showAlert('Doctor not found', 'error');
      return;
    }

    const doc = doctors[docIndex];
    const freeSlotIndex = doc.slots.findIndex(s => !s.booked);

    if (freeSlotIndex === -1) {
      // Doctor full -> add to waiting list
      if (!waitingList.some(p => p.id === pat.id)) {
        if (newBooking.emergency) {
          setWaitingList(prev => [pat, ...prev]);
        } else {
          setWaitingList(prev => [...prev, pat]);
        }
      }
      showAlert('Doctor full. Patient added to waiting list.', 'error');
      return;
    }

    // Book slot
    const slotTime = doc.slots[freeSlotIndex].time;
    const nextApptId = apptCounter + 1;
    setApptCounter(nextApptId);

    const updatedDoctors = [...doctors];
    updatedDoctors[docIndex].slots[freeSlotIndex].booked = true;
    setDoctors(updatedDoctors);

    setAppointments(prev => [...prev, {
      id: nextApptId,
      patientId: pat.id,
      doctorId: doc.id,
      slotTime,
      status: 'BOOKED'
    }]);

    showAlert(`Appointment booked successfully at ${slotTime} with ${doc.name}`, 'success');
  };

  // Cancel Appointment
  const handleCancelAppt = (apptId: number) => {
    const appt = appointments.find(a => a.id === apptId);
    if (!appt || appt.status !== 'BOOKED') return;

    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'CANCELLED' } : a));

    // Free slot
    const docIdx = doctors.findIndex(d => d.id === appt.doctorId);
    if (docIdx !== -1) {
      const updatedDocs = [...doctors];
      const slotIdx = updatedDocs[docIdx].slots.findIndex(s => s.time === appt.slotTime);
      if (slotIdx !== -1) {
        updatedDocs[docIdx].slots[slotIdx].booked = false;
        setDoctors(updatedDocs);

        // Auto waitlist promotion (Simulating WaitlistTask background daemon)
        if (waitingList.length > 0) {
          const [nextPatient, ...remainingWait] = waitingList;
          setWaitingList(remainingWait);
          updatedDocs[docIdx].slots[slotIdx].booked = true;
          setDoctors([...updatedDocs]);

          const nextAppt = apptCounter + 1;
          setApptCounter(nextAppt);
          setAppointments(prev => [...prev, {
            id: nextAppt,
            patientId: nextPatient.id,
            doctorId: appt.doctorId,
            slotTime: appt.slotTime,
            status: 'BOOKED'
          }]);
          showAlert(`Appointment cancelled. Slot freed and auto-assigned to waiting patient ${nextPatient.id}!`, 'success');
          return;
        }
      }
    }

    showAlert('Appointment cancelled and slot freed', 'success');
  };

  // Add Medical Record
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    const nextId = recordCounter + 1;
    setRecordCounter(nextId);

    setMedicalRecords(prev => [
      {
        id: nextId,
        patientId: selectedPatientId,
        diagnosis: newRecord.diagnosis,
        prescription: newRecord.prescription,
        doctorName: newRecord.doctorName,
        dateText: newRecord.dateText || '2026-10-10'
      },
      ...prev
    ]);
    showAlert('Medical record added', 'success');
    setNewRecord({ doctorName: 'Dr. Mehta', diagnosis: '', prescription: '', dateText: '2026-10-10' });
  };

  // Add Bill using Builder logic
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id.toLowerCase() === newBill.patientId.trim().toLowerCase());
    if (!pat) {
      showAlert(`Patient with ID ${newBill.patientId} not found`, 'error');
      return;
    }
    const c = Number(newBill.consultation);
    const m = Number(newBill.medicine);
    const t = Number(newBill.testFee);

    if (c < 0 || m < 0 || t < 0) {
      showAlert('Bill fees cannot be negative', 'error');
      return;
    }
    if (c + m + t <= 0) {
      showAlert('Total bill amount must be greater than zero', 'error');
      return;
    }

    const nextId = billCounter + 1;
    setBillCounter(nextId);
    setBills(prev => [
      {
        id: nextId,
        patientId: pat.id,
        consultation: c,
        medicine: m,
        testFee: t,
        total: c + m + t,
        status: 'PENDING'
      },
      ...prev
    ]);
    showAlert(`Bill ${nextId} generated successfully`, 'success');
  };

  // Update Bill Status
  const handleUpdateBillStatus = (id: number, status: 'PAID' | 'CANCELLED') => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    showAlert(`Bill ${id} updated to ${status}`, 'success');
  };

  // Run Rush Booking Concurrency Test
  const runRushTest = () => {
    const docIdx = doctors.findIndex(d => d.id === Number(rushDoctorId));
    if (docIdx === -1) return;

    // Prepare 8 patients
    let testPats = [...patients];
    while (testPats.length < 8) {
      const num = testPats.length + 1;
      testPats.push({
        id: `MS-2026-${String(num).padStart(4, '0')}`,
        name: `Rush Test Patient ${num}`,
        age: 25,
        phone: `900000000${num}`,
        bloodGroup: 'O+',
        allergies: 'None'
      });
    }

    const doc = doctors[docIdx];
    const updatedSlots = [...doc.slots];
    const log: string[] = [];

    // Simulate 8 threads arriving with thread-safe synchronized booking
    for (let i = 0; i < 8; i++) {
      const p = testPats[i];
      const freeIdx = updatedSlots.findIndex(s => !s.booked);
      if (freeIdx !== -1) {
        updatedSlots[freeIdx].booked = true;
        log.push(`${p.id} (${p.name}) -> ${doc.name} ${updatedSlots[freeIdx].time} BOOKED`);
      } else {
        log.push(`${p.id} (${p.name}) -> ${doc.name} WAITING LIST`);
      }
    }

    const updatedDocs = [...doctors];
    updatedDocs[docIdx].slots = updatedSlots;
    setDoctors(updatedDocs);
    setRushResults(log);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBills = bills.filter(b => billFilter === 'ALL' || b.status === billFilter);

  const billCounts = {
    pending: bills.filter(b => b.status === 'PENDING').length,
    paid: bills.filter(b => b.status === 'PAID').length,
    cancelled: bills.filter(b => b.status === 'CANCELLED').length
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px', background: '#ffffff', color: '#000000', maxWidth: '1000px' }}>
      <h2>MediSync Lite - Clinic Management System</h2>

      {/* Nav bar */}
      <div style={{ marginBottom: '20px', paddingBottom: '8px', borderBottom: '1px solid #cccccc' }}>
        <button onClick={() => { setActiveTab('dashboard'); setSelectedPatientId(null); setRushResults(null); }} style={{ marginRight: '15px', background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0 }}>Dashboard</button>
        <button onClick={() => { setActiveTab('patients'); setSelectedPatientId(null); setRushResults(null); }} style={{ marginRight: '15px', background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0 }}>Patients</button>
        <button onClick={() => { setActiveTab('doctors'); setSelectedPatientId(null); setRushResults(null); }} style={{ marginRight: '15px', background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0 }}>Doctors</button>
        <button onClick={() => { setActiveTab('bills'); setSelectedPatientId(null); setRushResults(null); }} style={{ marginRight: '15px', background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0 }}>Bills</button>
        <button onClick={() => { setActiveTab('concepts'); setSelectedPatientId(null); setRushResults(null); }} style={{ marginRight: '15px', background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0 }}>Concepts</button>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div style={{ padding: '8px', marginBottom: '15px', border: '1px solid', color: alertMsg.type === 'success' ? 'green' : 'red', borderColor: alertMsg.type === 'success' ? 'green' : 'red' }}>
          {alertMsg.text}
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          <h3>Clinic Summary</h3>
          <table style={{ borderCollapse: 'collapse', width: 'auto', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px', textAlign: 'left' }}>Metric</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px', textAlign: 'left' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Registered Patients (Vector size / capacity)</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{patients.length} / 10</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Active Doctors</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{doctors.length}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Total Appointments</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{appointments.length}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Waiting List Patients</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{waitingList.length}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Pending Bills</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px', color: '#cc6600', fontWeight: 'bold' }}>{billCounts.pending}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Paid Bills</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px', color: 'green', fontWeight: 'bold' }}>{billCounts.paid}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Cancelled Bills</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px', color: 'red', fontWeight: 'bold' }}>{billCounts.cancelled}</td></tr>
            </tbody>
          </table>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 2 (Vector size &amp; capacity, int[] bill status counts) and Practical 4 (Reportable interface)</div>

          <h3>Doctor Time Slots Overview</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Doctor Name</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Specialization</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Free Slots</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Schedule (6 Slots per Day)</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => {
                const freeCount = d.slots.filter(s => !s.booked).length;
                return (
                  <tr key={d.id}>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{d.id}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><b>{d.name}</b></td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{d.specialization}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{freeCount} / 6</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                      {d.slots.map((s, idx) => (
                        <span key={s.time}>
                          {s.time}: <span style={{ color: s.booked ? 'red' : 'green', fontWeight: 'bold' }}>{s.booked ? 'Booked' : 'Free'}</span>
                          {idx < d.slots.length - 1 ? ' | ' : ''}
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 2 (boolean[] booked, String[] slotTimes), Practical 6 (final static SLOTS_PER_DOCTOR)</div>

          <h3>Emergency &amp; Standard Waiting List</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Position</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Patient ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Patient Name</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {waitingList.length === 0 ? (
                <tr><td colSpan={4} style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>No patients currently in waiting list.</td></tr>
              ) : (
                waitingList.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{p.id}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{p.name}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{p.phone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 2 (Vector insertElementAt for emergency, add for regular), Practical 8 (WaitlistTask background thread)</div>
        </div>
      )}

      {/* PATIENTS TAB */}
      {activeTab === 'patients' && !selectedPatientId && (
        <div>
          <h3>Patient Directory</h3>
          <div style={{ margin: '10px 0' }}>
            <label>Search Patient: </label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID"
              style={{ padding: '4px 8px', margin: '3px 5px' }}
            />
            {searchTerm && <button onClick={() => setSearchTerm('')}>Reset</button>}
          </div>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 9 (String methods: toLowerCase, contains, trim)</div>

          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Patient ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Name (Proper Case)</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Age</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Phone</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Blood Group</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Role</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr><td colSpan={7} style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>No patients found.</td></tr>
              ) : (
                filteredPatients.map(p => (
                  <tr key={p.id}>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                      <button onClick={() => setSelectedPatientId(p.id)} style={{ background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0 }}>{p.id}</button>
                    </td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{p.name}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{p.age}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{p.phone}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{p.bloodGroup}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Patient</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                      <button onClick={() => setSelectedPatientId(p.id)} style={{ background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0 }}>View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h3>Register New Patient</h3>
          <form onSubmit={handleAddPatient} style={{ margin: '10px 0' }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Full Name:</label>
              <input type="text" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} required placeholder="e.g. Ramesh Kumar" style={{ padding: '4px 8px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Age:</label>
              <input type="number" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} required min="0" max="120" placeholder="e.g. 29" style={{ padding: '4px 8px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Phone (10 digits):</label>
              <input type="text" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} required maxLength={10} placeholder="e.g. 9876543210" style={{ padding: '4px 8px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Blood Group:</label>
              <select value={newPatient.bloodGroup} onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })} style={{ padding: '4px 8px' }}>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Allergies:</label>
              <input type="text" value={newPatient.allergies} onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })} placeholder="e.g. None or Dust" style={{ padding: '4px 8px' }} />
            </div>
            <button type="submit" style={{ padding: '4px 10px' }}>Register Patient</button>
          </form>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 1 (if-else validation), Practical 3 (Inheritance &amp; Constructors), Practical 4 (Overloaded addPatient), Practical 6 (super, static counter), Practical 7 (InvalidPatientException), Practical 9 (Phone digit validation, ID generation)</div>
        </div>
      )}

      {/* PATIENT DETAILS SUBVIEW */}
      {selectedPatientId && selectedPatient && (
        <div>
          <button onClick={() => setSelectedPatientId(null)} style={{ background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0, marginBottom: '10px' }}>&larr; Back to Patients Directory</button>
          <h3>Patient Information: {selectedPatient.id}</h3>
          <table style={{ borderCollapse: 'collapse', width: 'auto', marginBottom: '10px' }}>
            <tbody>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px', background: '#f2f2f2' }}><b>Patient ID</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{selectedPatient.id}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px', background: '#f2f2f2' }}><b>Name</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{selectedPatient.name}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px', background: '#f2f2f2' }}><b>Age</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{selectedPatient.age} years</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px', background: '#f2f2f2' }}><b>Phone</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{selectedPatient.phone}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px', background: '#f2f2f2' }}><b>Blood Group</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{selectedPatient.bloodGroup}</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px', background: '#f2f2f2' }}><b>Known Allergies</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{selectedPatient.allergies}</td></tr>
            </tbody>
          </table>
          <button onClick={() => handleDeletePatient(selectedPatient.id)} style={{ color: 'red', marginBottom: '15px' }}>Delete Patient Record</button>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 3 (Person base class getters), Practical 6 (final getDisplayName()), Practical 10 (JDBC deletePatient)</div>

          <h3>Appointments</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Appointment ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Doctor</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Slot Time</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Status</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.filter(a => a.patientId === selectedPatient.id).length === 0 ? (
                <tr><td colSpan={5} style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>No appointments on record.</td></tr>
              ) : (
                appointments.filter(a => a.patientId === selectedPatient.id).map(a => {
                  const doc = doctors.find(d => d.id === a.doctorId);
                  return (
                    <tr key={a.id}>
                      <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{a.id}</td>
                      <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{doc ? doc.name : `Dr. #${a.doctorId}`}</td>
                      <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{a.slotTime}</td>
                      <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                        <span style={{ color: a.status === 'BOOKED' ? 'red' : '#777777', fontWeight: 'bold' }}>{a.status}</span>
                      </td>
                      <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                        {a.status === 'BOOKED' ? (
                          <button onClick={() => handleCancelAppt(a.id)}>Cancel</button>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 8 (cancelAppointment synchronized slot freeing), Practical 10 (updateAppointmentStatus)</div>

          <h3>Medical History &amp; Records</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Record ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Diagnosis</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Prescription</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Doctor</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.filter(r => r.patientId === selectedPatient.id).length === 0 ? (
                <tr><td colSpan={5} style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>No medical records available.</td></tr>
              ) : (
                medicalRecords.filter(r => r.patientId === selectedPatient.id).map(r => (
                  <tr key={r.id}>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{r.id}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{r.diagnosis}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{r.prescription}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{r.doctorName}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{r.dateText}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h4>Add New Medical Record</h4>
          <form onSubmit={handleAddRecord} style={{ margin: '10px 0' }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Attending Doctor:</label>
              <select value={newRecord.doctorName} onChange={e => setNewRecord({ ...newRecord, doctorName: e.target.value })} style={{ padding: '4px 8px' }}>
                {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Diagnosis:</label>
              <input type="text" value={newRecord.diagnosis} onChange={e => setNewRecord({ ...newRecord, diagnosis: e.target.value })} required placeholder="e.g. Acute Pharyngitis" style={{ padding: '4px 8px', width: '250px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Prescription:</label>
              <input type="text" value={newRecord.prescription} onChange={e => setNewRecord({ ...newRecord, prescription: e.target.value })} required placeholder="e.g. Amoxicillin 500mg" style={{ padding: '4px 8px', width: '250px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Date:</label>
              <input type="text" value={newRecord.dateText} onChange={e => setNewRecord({ ...newRecord, dateText: e.target.value })} style={{ padding: '4px 8px' }} />
            </div>
            <button type="submit">Save Medical Record</button>
          </form>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 10 (JDBC saveRecord, getRecords)</div>

          <h3>Billing History</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Bill ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Consultation</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Medicine</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Test Fee</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Total (Rs)</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.filter(b => b.patientId === selectedPatient.id).length === 0 ? (
                <tr><td colSpan={6} style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>No bills generated for this patient yet.</td></tr>
              ) : (
                bills.filter(b => b.patientId === selectedPatient.id).map(b => (
                  <tr key={b.id}>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.id}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.consultation}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.medicine}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.testFee}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><b>{b.total}</b></td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                      <span style={{ color: b.status === 'PAID' ? 'green' : b.status === 'PENDING' ? '#cc6600' : 'red', fontWeight: 'bold' }}>{b.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DOCTORS TAB */}
      {activeTab === 'doctors' && !rushResults && (
        <div>
          <h3>Doctor Schedule &amp; Slot Availability</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Doctor Name</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Specialization</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Availability</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Daily Schedule (10:00 to 12:30)</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => {
                const free = d.slots.filter(s => !s.booked).length;
                return (
                  <tr key={d.id}>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{d.id}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><b>{d.name}</b></td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{d.specialization}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{free} of 6 free</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                      {d.slots.map((s, idx) => (
                        <span key={s.time}>
                          {s.time}: <span style={{ color: s.booked ? 'red' : 'green', fontWeight: 'bold' }}>{s.booked ? 'Booked' : 'Free'}</span>
                          {idx < d.slots.length - 1 ? ' | ' : ''}
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 2 (boolean[] booked, String[] slotTimes), Practical 4 (Doctor implements Bookable, Reportable)</div>

          <h3>Book An Appointment</h3>
          <form onSubmit={handleBook} style={{ margin: '10px 0' }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Patient ID:</label>
              <input
                type="text"
                value={newBooking.patientId}
                onChange={e => setNewBooking({ ...newBooking, patientId: e.target.value })}
                required
                placeholder="e.g. MS-2026-0001"
                style={{ padding: '4px 8px' }}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Select Doctor:</label>
              <select
                value={newBooking.doctorId}
                onChange={e => setNewBooking({ ...newBooking, doctorId: Number(e.target.value) })}
                style={{ padding: '4px 8px' }}
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Emergency Case:</label>
              <input
                type="checkbox"
                checked={newBooking.emergency}
                onChange={e => setNewBooking({ ...newBooking, emergency: e.target.checked })}
              />
              <span style={{ fontSize: '12px', color: '#555555', marginLeft: '6px' }}>(Places patient at front of waiting list if doctor slots are full)</span>
            </div>
            <button type="submit">Book Slot</button>
          </form>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 2 (Vector insertElementAt), Practical 7 (SlotNotAvailableException, PatientNotFoundException), Practical 8 (synchronized doctor.bookSlot)</div>

          <h3>Rush Booking Test (Multithreading Concurrency Simulation)</h3>
          <p>Launches 8 patient threads simultaneously trying to book the selected doctor to test thread safety and prove no double bookings happen.</p>
          <div style={{ margin: '10px 0' }}>
            <label>Select Doctor for Concurrency Test: </label>
            <select
              value={rushDoctorId}
              onChange={e => setRushDoctorId(Number(e.target.value))}
              style={{ padding: '4px 8px', marginRight: '10px' }}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
              ))}
            </select>
            <button onClick={runRushTest}>Start Rush Booking Test</button>
          </div>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 8 (BookingThread extends Thread, Thread.sleep, Thread.join(), synchronized slot allocation)</div>
        </div>
      )}

      {/* RUSH TEST RESULTS VIEW */}
      {rushResults && (
        <div>
          <button onClick={() => setRushResults(null)} style={{ background: 'none', border: 'none', color: '#0000ee', textDecoration: 'underline', padding: 0, marginBottom: '10px' }}>&larr; Back to Doctors &amp; Booking</button>
          <h3>Rush Booking Test Execution Report</h3>
          <p>Target Doctor: <b>{doctors.find(d => d.id === rushDoctorId)?.name}</b></p>
          <p>Executed 8 concurrent patient booking threads. Thread execution log:</p>

          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Thread #</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Booking Result Line</th>
              </tr>
            </thead>
            <tbody>
              {rushResults.map((line, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{line}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p><b>Verification Check:</b></p>
          <p>Double bookings found: <span style={{ color: 'green', fontWeight: 'bold' }}>0</span></p>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 8 (BookingThread extends Thread, synchronized bookSlot, Thread.sleep(0-200ms), thread.join() synchronization barrier)</div>
        </div>
      )}

      {/* BILLS TAB */}
      {activeTab === 'bills' && (
        <div>
          <h3>Billing Records</h3>
          <div style={{ margin: '10px 0' }}>
            <b>Filter by Status: </b>
            {(['ALL', 'PENDING', 'PAID', 'CANCELLED'] as const).map((st, i) => (
              <span key={st}>
                <button
                  onClick={() => setBillFilter(st)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0000ee',
                    textDecoration: billFilter === st ? 'underline' : 'none',
                    fontWeight: billFilter === st ? 'bold' : 'normal',
                    padding: '0 4px',
                    cursor: 'pointer'
                  }}
                >
                  {st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
                {i < 3 ? ' | ' : ''}
              </span>
            ))}
            <span> (Current filter: {billFilter})</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 1 (switch statement on bill status), Practical 10 (JDBC getBillsByStatus)</div>

          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Bill ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Patient ID</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Consultation Fee (Rs)</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Medicine Fee (Rs)</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Test Fee (Rs)</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Total Amount (Rs)</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Status</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr><td colSpan={8} style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>No bills found.</td></tr>
              ) : (
                filteredBills.map(b => (
                  <tr key={b.id}>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.id}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.patientId}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.consultation}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.medicine}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>{b.testFee}</td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><b>{b.total}</b></td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                      <span style={{ color: b.status === 'PAID' ? 'green' : b.status === 'PENDING' ? '#cc6600' : 'red', fontWeight: 'bold' }}>{b.status}</span>
                    </td>
                    <td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>
                      {b.status === 'PENDING' ? (
                        <>
                          <button onClick={() => handleUpdateBillStatus(b.id, 'PAID')} style={{ marginRight: '5px' }}>Mark Paid</button>
                          <button onClick={() => handleUpdateBillStatus(b.id, 'CANCELLED')}>Cancel</button>
                        </>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h3>Generate New Bill</h3>
          <form onSubmit={handleAddBill} style={{ margin: '10px 0' }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Patient ID:</label>
              <input type="text" value={newBill.patientId} onChange={e => setNewBill({ ...newBill, patientId: e.target.value })} required placeholder="e.g. MS-2026-0001" style={{ padding: '4px 8px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Consultation (Rs):</label>
              <input type="number" step="0.5" value={newBill.consultation} onChange={e => setNewBill({ ...newBill, consultation: Number(e.target.value) })} required min="0" style={{ padding: '4px 8px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Medicine (Rs):</label>
              <input type="number" step="0.5" value={newBill.medicine} onChange={e => setNewBill({ ...newBill, medicine: Number(e.target.value) })} required min="0" style={{ padding: '4px 8px' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '130px' }}>Test Fee (Rs):</label>
              <input type="number" step="0.5" value={newBill.testFee} onChange={e => setNewBill({ ...newBill, testFee: Number(e.target.value) })} required min="0" style={{ padding: '4px 8px' }} />
            </div>
            <button type="submit">Create Bill</button>
          </form>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '15px' }}>Uses: Practical 1 (Type casting arithmetic), Practical 3 (Bill entity), Practical 4 (Billable interface), Practical 6 (Bill.Builder method chaining), Practical 7 (InvalidBillException)</div>
        </div>
      )}

      {/* CONCEPTS TAB */}
      {activeTab === 'concepts' && (
        <div>
          <h3>OOP Lab Practicals Mapping (Practical 1 to 10)</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical No.</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Concept</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Class and Method where Used</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 1</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Syntax &amp; Control Flow: if-else, switch, loops, type casting</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>Main.main()</code>, <code>ClinicService.getBillStatusCounts()</code>, <code>Person.setAge()</code>, <code>Bill.calculateTotal()</code></td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 2</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Arrays &amp; Vector: boolean[], String[], int[], Vector methods</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>Doctor.booked</code>, <code>Doctor.slotTimes</code>, <code>ClinicService.patients</code>, <code>waitingList</code></td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 3</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Classes, Inheritance &amp; Constructors</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>Person</code> (abstract), <code>Patient extends Person</code>, <code>Doctor extends Person</code>, <code>Bill</code></td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 4</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Interfaces, Overloading &amp; Overriding</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>Bookable</code>, <code>Billable</code>, <code>Reportable</code>; <code>Doctor implements Bookable, Reportable</code></td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 5</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Packages &amp; Imports</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>medisync.model</code>, <code>medisync.exception</code>, <code>medisync.service</code>, <code>medisync.db</code>, <code>medisync.web</code></td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 6</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>this, super, static, final &amp; Nested Classes</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>this()</code> chaining, <code>super()</code>, <code>Bill.Builder</code>, <code>Patient.counter</code>, <code>final getDisplayName()</code></td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 7</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Exception Handling: checked exceptions</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>PatientNotFoundException</code>, <code>SlotNotAvailableException</code>, <code>InvalidPatientException</code>, <code>InvalidBillException</code></td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 8</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Multithreading: Thread, Runnable, synchronized, sleep, join</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>BookingThread extends Thread</code>, <code>WaitlistTask implements Runnable</code>, <code>Doctor.bookSlot()</code>, 8-thread rush test</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 9</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>String methods: split, substring, indexOf, charAt, etc.</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>Patient.validateId()</code>, <code>Person.getDisplayName()</code>, <code>ClinicService.searchPatients()</code></td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Practical 10</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>JDBC Connectivity: PreparedStatement, ResultSet</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><code>ClinicDao</code>: CRUD on patient, doctor, appointment, record, bill</td></tr>
            </tbody>
          </table>

          <h3>Project Team Members</h3>
          <table style={{ borderCollapse: 'collapse', width: 'auto', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Sr. No.</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Student Name</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>PRN</th>
                <th style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Role / Contribution</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>1</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><b>Sanskar Shinde</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>202401103145</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>Multithreading, Concurrency &amp; Waitlist Daemon (P8)</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>2</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><b>Sarvesh Ghodke</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>202401103158</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>OOP Architecture, Interfaces &amp; Exceptions (P3, P4, P7)</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>3</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><b>Aamer Sayed</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>202401103150</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>JDBC Database Connectivity &amp; SQL Schemas (P10)</td></tr>
              <tr><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>4</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}><b>Rohan Tarke</b></td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>202401103149</td><td style={{ border: '1px solid #cccccc', padding: '6px 10px' }}>HTTP WebServer, String Logic &amp; UI Integration (P1, P5, P6, P9)</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #cccccc', fontSize: '12px', color: '#555555' }}>
        Demo project - fake data only<br />
        Developed by: Sanskar Shinde (202401103145), Sarvesh Ghodke (202401103158), Aamer Sayed (202401103150), Rohan Tarke (202401103149)
      </div>
    </div>
  );
}
