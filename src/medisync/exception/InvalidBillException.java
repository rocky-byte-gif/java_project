package medisync.exception;

// [Practical 7] Custom Checked Exception
public class InvalidBillException extends Exception {
    public InvalidBillException(String message) {
        super(message);
    }
}
