package medisync.exception;

// [Practical 7] Custom Checked Exception
public class SlotNotAvailableException extends Exception {
    public SlotNotAvailableException(String message) {
        super(message);
    }
}
