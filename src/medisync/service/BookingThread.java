package medisync.service;

import java.util.Random;
import java.util.Vector;
import medisync.exception.PatientNotFoundException;
import medisync.exception.SlotNotAvailableException;
import medisync.model.Appointment;
import medisync.model.Doctor;
import medisync.model.Patient;

// [Practical 5] Package medisync.service
// [Practical 8] Multithreading: BookingThread extends Thread
public class BookingThread extends Thread {
    private Patient patient;
    private int doctorId;
    private ClinicService service;
    private Vector<String> resultLog;

    public BookingThread(Patient patient, int doctorId, ClinicService service, Vector<String> resultLog) {
        this.patient = patient;
        this.doctorId = doctorId;
        this.service = service;
        this.resultLog = resultLog;
    }

    // [Practical 8] Thread run method with Thread.sleep
    @Override
    public void run() {
        Random rand = new Random();
        try {
            // Sleep random 0 to 200 ms to simulate concurrent arrival
            int delay = rand.nextInt(201);
            Thread.sleep(delay);

            Doctor doc = service.findDoctor(doctorId);
            String docName = (doc != null) ? doc.getName() : ("Doctor#" + doctorId);

            try {
                Appointment appt = service.bookAppointment(patient.getId(), doctorId);
                String line = patient.getId() + " (" + patient.getName() + ") -> " + docName + " " + appt.getSlotTime() + " BOOKED";
                synchronized (resultLog) {
                    resultLog.add(line);
                }
            } catch (SlotNotAvailableException se) {
                String line = patient.getId() + " (" + patient.getName() + ") -> " + docName + " WAITING LIST";
                synchronized (resultLog) {
                    resultLog.add(line);
                }
            } catch (PatientNotFoundException pe) {
                String line = patient.getId() + " -> Error: " + pe.getMessage();
                synchronized (resultLog) {
                    resultLog.add(line);
                }
            }
        } catch (InterruptedException ie) {
            synchronized (resultLog) {
                resultLog.add(patient.getId() + " -> Thread interrupted");
            }
        }
    }
}
