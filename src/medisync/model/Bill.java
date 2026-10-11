package medisync.model;

import medisync.exception.InvalidBillException;
import medisync.service.Billable;

// [Practical 3] Bill Entity implementing Billable
// [Practical 4] Interface implementation
public class Bill implements Billable {
    // [Practical 6] Static counter for bill IDs
    public static int counter = 0;

    private int id;
    private String patientId;
    private double consultation;
    private double medicine;
    private double testFee;
    private double total;
    private String status; // PENDING, PAID, CANCELLED

    // Constructor from Builder pattern
    public Bill(Builder b) {
        this.id = ++counter;
        this.patientId = b.patientId;
        this.consultation = b.consultation;
        this.medicine = b.medicine;
        this.testFee = b.testFee;
        // [Practical 1] Type casting and calculation
        this.total = calculateTotal();
        this.status = "PENDING";
    }

    // Constructor for loading from DB
    public Bill(int id, String patientId, double consultation, double medicine, double testFee, double total, String status) {
        this.id = id;
        this.patientId = patientId;
        this.consultation = consultation;
        this.medicine = medicine;
        this.testFee = testFee;
        this.total = total;
        this.status = status;
    }

    // [Practical 4] Interface method implementation
    // [Practical 1] Type casting / arithmetic
    @Override
    public double calculateTotal() {
        return (double) (consultation + medicine + testFee);
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public double getConsultation() {
        return consultation;
    }

    public double getMedicine() {
        return medicine;
    }

    public double getTestFee() {
        return testFee;
    }

    public double getTotal() {
        return total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // [Practical 6] Nested static Builder class returning this
    public static class Builder {
        private String patientId = "";
        private double consultation = 0.0;
        private double medicine = 0.0;
        private double testFee = 0.0;

        public Builder patientId(String patientId) {
            this.patientId = patientId;
            return this;
        }

        public Builder consultation(double consultation) {
            this.consultation = consultation;
            return this;
        }

        public Builder medicine(double medicine) {
            this.medicine = medicine;
            return this;
        }

        public Builder testFee(double testFee) {
            this.testFee = testFee;
            return this;
        }

        // [Practical 7] Throws custom checked exception
        public Bill build() throws InvalidBillException {
            if (patientId == null || patientId.trim().length() == 0) {
                throw new InvalidBillException("Patient ID cannot be empty for bill");
            }
            if (consultation < 0 || medicine < 0 || testFee < 0) {
                throw new InvalidBillException("Bill fees cannot be negative");
            }
            if ((consultation + medicine + testFee) <= 0.0) {
                throw new InvalidBillException("Total bill amount must be greater than zero");
            }
            return new Bill(this);
        }
    }
}
