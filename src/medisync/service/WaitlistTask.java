package medisync.service;

import medisync.model.Appointment;

// [Practical 5] Package medisync.service
// [Practical 8] Multithreading: WaitlistTask implements Runnable
public class WaitlistTask implements Runnable {
    private ClinicService service;

    public WaitlistTask(ClinicService service) {
        this.service = service;
    }

    @Override
    public void run() {
        while (true) {
            try {
                // Sleep for 3 seconds
                Thread.sleep(3000);

                // Auto-process waiting list when free slot is available
                Appointment promoted = service.processNextWaitlist();
                if (promoted != null) {
                    System.out.println("[Waitlist Background Task] Promoted " + promoted.getPatientId() 
                        + " to slot " + promoted.getSlotTime() + " with Doctor #" + promoted.getDoctorId());
                }
            } catch (InterruptedException e) {
                System.out.println("[Waitlist Background Task] interrupted");
                break;
            } catch (Exception e) {
                System.out.println("[Waitlist Background Task] error: " + e.getMessage());
            }
        }
    }
}
