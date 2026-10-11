package medisync.model;

import medisync.exception.SlotNotAvailableException;
import medisync.service.Bookable;
import medisync.service.Reportable;

// [Practical 3] Inheritance: Doctor extends Person
// [Practical 4] Multiple Interface Implementation: implements Bookable, Reportable
public class Doctor extends Person implements Bookable, Reportable {
    private int id;
    private String specialization;

    // [Practical 6] final static constant
    public static final int SLOTS_PER_DOCTOR = 6;

    // [Practical 2] Arrays for booked status and slot timing
    private boolean[] booked;
    private String[] slotTimes = {"10:00", "10:30", "11:00", "11:30", "12:00", "12:30"};

    public Doctor(int id, String name, String specialization) {
        // [Practical 6] super(...) call to Person
        super(name, 40, "9999999999");
        this.id = id;
        this.specialization = specialization;
        // [Practical 2] Array initialization
        this.booked = new boolean[SLOTS_PER_DOCTOR];
        for (int i = 0; i < SLOTS_PER_DOCTOR; i++) {
            this.booked[i] = false;
        }
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String[] getSlotTimes() {
        return slotTimes;
    }

    public boolean[] getBooked() {
        return booked;
    }

    // [Practical 4] Overriding getRole()
    @Override
    public String getRole() {
        return "Doctor";
    }

    // [Practical 4] Interface method implementation
    // [Practical 8] Thread-safe synchronized method for booking first available slot
    @Override
    public synchronized Appointment bookSlot(Patient p) throws SlotNotAvailableException {
        // [Practical 1] Loop through array to find first free slot
        for (int i = 0; i < SLOTS_PER_DOCTOR; i++) {
            if (!booked[i]) {
                booked[i] = true;
                Appointment appt = new Appointment(0, p.getId(), this.id, slotTimes[i], "BOOKED");
                return appt;
            }
        }
        // [Practical 7] Throw custom checked exception when doctor is full
        throw new SlotNotAvailableException("No slots available for " + getName());
    }

    // [Practical 4] Overloaded bookSlot method for specific slot number
    // [Practical 8] Thread-safe synchronized method
    public synchronized Appointment bookSlot(Patient p, int slotNo) throws SlotNotAvailableException {
        if (slotNo < 0 || slotNo >= SLOTS_PER_DOCTOR) {
            throw new SlotNotAvailableException("Invalid slot number: " + slotNo);
        }
        if (booked[slotNo]) {
            throw new SlotNotAvailableException("Slot " + slotTimes[slotNo] + " is already booked.");
        }
        booked[slotNo] = true;
        Appointment appt = new Appointment(0, p.getId(), this.id, slotTimes[slotNo], "BOOKED");
        return appt;
    }

    // [Practical 8] Synchronized method to free a slot
    public synchronized void freeSlot(int slotNo) {
        if (slotNo >= 0 && slotNo < SLOTS_PER_DOCTOR) {
            booked[slotNo] = false;
        }
    }

    // Free slot by slot time string
    public synchronized boolean freeSlotByTime(String time) {
        for (int i = 0; i < SLOTS_PER_DOCTOR; i++) {
            // [Practical 9] String equalsIgnoreCase comparison
            if (slotTimes[i].equalsIgnoreCase(time)) {
                booked[i] = false;
                return true;
            }
        }
        return false;
    }

    // Mark slot booked by time (used during DB startup loading)
    public synchronized void markSlotBooked(String time) {
        for (int i = 0; i < SLOTS_PER_DOCTOR; i++) {
            if (slotTimes[i].equalsIgnoreCase(time)) {
                booked[i] = true;
                break;
            }
        }
    }

    // [Practical 1] Loop and count
    public synchronized int getFreeCount() {
        int count = 0;
        for (int i = 0; i < SLOTS_PER_DOCTOR; i++) {
            if (!booked[i]) {
                count++;
            }
        }
        return count;
    }

    // [Practical 4] Reportable interface method
    @Override
    public String getSummary() {
        return getName() + " (" + specialization + "): " + getFreeCount() + " of " + SLOTS_PER_DOCTOR + " slots free";
    }
}
