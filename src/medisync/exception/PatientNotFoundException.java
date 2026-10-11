package medisync.exception;

// [Practical 7] Custom Checked Exception
public class PatientNotFoundException extends Exception {
    public PatientNotFoundException(String message) {
        super(message);
    }
}
