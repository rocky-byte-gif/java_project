package medisync.service;

import java.util.Vector;
import medisync.db.ClinicDao;
import medisync.exception.InvalidPatientException;
import medisync.exception.PatientNotFoundException;
import medisync.exception.SlotNotAvailableException;
import medisync.model.Appointment;
import medisync.model.Bill;
import medisync.model.Doctor;
import medisync.model.MedicalRecord;
import medisync.model.Patient;

// [Practical 4] Interface Implementation: ClinicService implements Reportable
// [Practical 5] Package medisync.service
public class ClinicService implements Reportable {

    // [Practical 2] Vector Collections
    private Vector<Patient> patients;
    private Vector<Doctor> doctors;
    private Vector<Appointment> appointments;
    private Vector<Patient> waitingList;
    private ClinicDao dao;

    public ClinicService(ClinicDao dao) {
        this.dao = dao;
        this.patients = new Vector<Patient>();
        this.doctors = new Vector<Doctor>();
        this.appointments = new Vector<Appointment>();
        this.waitingList = new Vector<Patient>();
        loadFromDao();
    }

    // Load persisted state and restore slot booking state
    public void loadFromDao() {
        synchronized (this) {
            this.patients = dao.loadPatients();
            this.doctors = dao.loadDoctors();
            this.appointments = dao.loadAppointments();

            // Set static patient counter to highest loaded number
            Patient.counter = dao.getMaxPatientNumber();
            // Set static bill counter to highest loaded id
            Bill.counter = dao.getMaxBillId();

            // Mark slots as booked for active appointments
            for (int i = 0; i < appointments.size(); i++) {
                Appointment a = appointments.get(i);
                // [Practical 9] equalsIgnoreCase comparison
                if ("BOOKED".equalsIgnoreCase(a.getStatus())) {
                    for (int j = 0; j < doctors.size(); j++) {
                        Doctor d = doctors.get(j);
                        if (d.getId() == a.getDoctorId()) {
                            d.markSlotBooked(a.getSlotTime());
                            break;
                        }
                    }
                }
            }
        }
    }

    // [Practical 4] Overloaded Method 1
    public synchronized Patient addPatient(String name, int age, String phone) throws InvalidPatientException {
        return addPatient(name, age, phone, "NA", "None");
    }

    // [Practical 4] Overloaded Method 2
    // [Practical 8] Synchronized for thread safety
    public synchronized Patient addPatient(String name, int age, String phone, String bloodGroup, String allergies) throws InvalidPatientException {
        try {
            // [Practical 7] Exception handling and validation
            Patient p = new Patient(name, age, phone, bloodGroup, allergies);
            dao.savePatient(p);
            patients.add(p);
            return p;
        } catch (IllegalArgumentException e) {
            throw new InvalidPatientException("Cannot add patient: " + e.getMessage());
        }
    }

    // [Practical 7] Throws PatientNotFoundException
    public synchronized Patient findPatient(String id) throws PatientNotFoundException {
        if (id == null) {
            throw new PatientNotFoundException("Patient ID cannot be null");
        }
        for (int i = 0; i < patients.size(); i++) {
            Patient p = patients.get(i);
            // [Practical 9] String equalsIgnoreCase
            if (p.getId().equalsIgnoreCase(id.trim())) {
                return p;
            }
        }
        throw new PatientNotFoundException("Patient with ID " + id + " not found");
    }

    // [Practical 9] Case-insensitive search using toLowerCase and contains
    public synchronized Vector<Patient> searchPatients(String text) {
        Vector<Patient> result = new Vector<Patient>();
        if (text == null || text.trim().length() == 0) {
            result.addAll(patients);
            return result;
        }
        String q = text.trim().toLowerCase();
        for (int i = 0; i < patients.size(); i++) {
            Patient p = patients.get(i);
            if (p.getName().toLowerCase().contains(q) || p.getId().toLowerCase().contains(q)) {
                result.add(p);
            }
        }
        return result;
    }

    public synchronized boolean removePatient(String id) {
        for (int i = 0; i < patients.size(); i++) {
            if (patients.get(i).getId().equalsIgnoreCase(id)) {
                patients.remove(i);
                dao.deletePatient(id);
                return true;
            }
        }
        return false;
    }

    public synchronized Doctor findDoctor(int doctorId) {
        for (int i = 0; i < doctors.size(); i++) {
            Doctor d = doctors.get(i);
            if (d.getId() == doctorId) {
                return d;
            }
        }
        return null;
    }

    // [Practical 4] Overloaded bookAppointment
    public synchronized Appointment bookAppointment(String patientId, int doctorId) throws PatientNotFoundException, SlotNotAvailableException {
        return bookAppointment(patientId, doctorId, false);
    }

    // [Practical 8] Synchronized appointment booking
    public synchronized Appointment bookAppointment(String patientId, int doctorId, boolean emergency) throws PatientNotFoundException, SlotNotAvailableException {
        Patient p = findPatient(patientId);
        Doctor d = findDoctor(doctorId);
        if (d == null) {
            throw new SlotNotAvailableException("Doctor ID " + doctorId + " not found");
        }

        try {
            // Attempt to book slot directly on doctor
            Appointment appt = d.bookSlot(p);
            int generatedId = dao.saveAppointment(appt);
            appt.setId(generatedId);
            appointments.add(appt);
            return appt;
        } catch (SlotNotAvailableException e) {
            // [Practical 2] Vector insertion at beginning or end
            addToWaitingList(p, emergency);
            throw new SlotNotAvailableException("Doctor full. Patient added to waiting list.");
        }
    }

    // [Practical 2] Waiting list management using insertElementAt and add
    public synchronized void addToWaitingList(Patient p, boolean emergency) {
        // Prevent duplicate entry of same patient in waiting list
        for (int i = 0; i < waitingList.size(); i++) {
            if (waitingList.get(i).getId().equalsIgnoreCase(p.getId())) {
                return;
            }
        }
        if (emergency) {
            // [Practical 2] Insert at head of Vector for emergency priority
            waitingList.insertElementAt(p, 0);
        } else {
            waitingList.add(p);
        }
    }

    // [Practical 8] Synchronized appointment cancellation
    public synchronized boolean cancelAppointment(int appointmentId) {
        for (int i = 0; i < appointments.size(); i++) {
            Appointment a = appointments.get(i);
            if (a.getId() == appointmentId && "BOOKED".equalsIgnoreCase(a.getStatus())) {
                a.setStatus("CANCELLED");
                dao.updateAppointmentStatus(appointmentId, "CANCELLED");

                // Free the doctor slot
                Doctor d = findDoctor(a.getDoctorId());
                if (d != null) {
                    d.freeSlotByTime(a.getSlotTime());
                }
                return true;
            }
        }
        return false;
    }

    // Check waiting list and auto-book when a slot frees up
    public synchronized Appointment processNextWaitlist() {
        if (waitingList.isEmpty()) {
            return null;
        }
        for (int i = 0; i < doctors.size(); i++) {
            Doctor d = doctors.get(i);
            if (d.getFreeCount() > 0) {
                Patient p = waitingList.remove(0);
                try {
                    Appointment appt = d.bookSlot(p);
                    int genId = dao.saveAppointment(appt);
                    appt.setId(genId);
                    appointments.add(appt);
                    return appt;
                } catch (SlotNotAvailableException e) {
                    // Doctor filled up just now, restore patient
                    waitingList.insertElementAt(p, 0);
                }
            }
        }
        return null;
    }

    public synchronized boolean addBill(Bill b) {
        boolean saved = dao.saveBill(b);
        return saved;
    }

    public synchronized boolean updateBillStatus(int id, String status) {
        return dao.updateBillStatus(id, status);
    }

    public synchronized boolean addRecord(MedicalRecord r) {
        return dao.saveRecord(r);
    }

    public synchronized Vector<MedicalRecord> getRecords(String patientId) {
        return dao.getRecords(patientId);
    }

    public synchronized Vector<Bill> getBills() {
        return dao.getBills();
    }

    public synchronized Vector<Bill> getBillsByStatus(String status) {
        return dao.getBillsByStatus(status);
    }

    public synchronized Vector<Appointment> getAppointmentsForPatient(String patientId) {
        Vector<Appointment> list = new Vector<Appointment>();
        for (int i = 0; i < appointments.size(); i++) {
            Appointment a = appointments.get(i);
            if (a.getPatientId().equalsIgnoreCase(patientId)) {
                list.add(a);
            }
        }
        return list;
    }

    // [Practical 2] Array int[3] bill status counts: [pending, paid, cancelled]
    // [Practical 1] Switch statement
    public synchronized int[] getBillStatusCounts() {
        int[] counts = new int[3]; // 0: PENDING, 1: PAID, 2: CANCELLED
        Vector<Bill> allBills = dao.getBills();
        for (int i = 0; i < allBills.size(); i++) {
            Bill b = allBills.get(i);
            String st = b.getStatus().toUpperCase();
            switch (st) {
                case "PENDING":
                    counts[0]++;
                    break;
                case "PAID":
                    counts[1]++;
                    break;
                case "CANCELLED":
                    counts[2]++;
                    break;
                default:
                    break;
            }
        }
        return counts;
    }

    // [Practical 4] Reportable interface implementation
    @Override
    public synchronized String getSummary() {
        int[] bCounts = getBillStatusCounts();
        return "Clinic Summary: " + patients.size() + " Patients, " + doctors.size() + " Doctors, " 
            + appointments.size() + " Appointments, " + waitingList.size() + " in Waitlist. "
            + "Bills -> Pending: " + bCounts[0] + ", Paid: " + bCounts[1] + ", Cancelled: " + bCounts[2];
    }

    public synchronized Vector<Patient> getPatients() {
        return patients;
    }

    public synchronized Vector<Doctor> getDoctors() {
        return doctors;
    }

    public synchronized Vector<Appointment> getAppointments() {
        return appointments;
    }

    public synchronized Vector<Patient> getWaitingList() {
        return waitingList;
    }

    public ClinicDao getDao() {
        return dao;
    }
}
