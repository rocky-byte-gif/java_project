package medisync.exception;

// [Practical 7] Custom Checked Exception
public class InvalidPatientException extends Exception {
    public InvalidPatientException(String message) {
        super(message);
    }
}
