package medisync.service;

import medisync.exception.SlotNotAvailableException;
import medisync.model.Appointment;
import medisync.model.Patient;

// [Practical 4] Interface Definition
public interface Bookable {
    Appointment bookSlot(Patient p) throws SlotNotAvailableException;
}
