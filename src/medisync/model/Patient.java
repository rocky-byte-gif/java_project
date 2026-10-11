package medisync.model;

// [Practical 3] Inheritance: Patient extends Person
// [Practical 5] Package medisync.model
public class Patient extends Person {
    private String id;
    private String bloodGroup;
    private String allergies;

    // [Practical 6] Static counter initialized from DB
    public static int counter = 0;

    // [Practical 4] Overloaded Constructor 1
    // [Practical 6] super(...) call
    public Patient(String name, int age, String phone) {
        super(name, age, phone);
        this.id = generateNextId();
        this.bloodGroup = "NA";
        this.allergies = "None";
    }

    // [Practical 4] Overloaded Constructor 2
    public Patient(String name, int age, String phone, String bloodGroup, String allergies) {
        super(name, age, phone);
        this.id = generateNextId();
        this.bloodGroup = (bloodGroup == null || bloodGroup.trim().length() == 0) ? "NA" : bloodGroup.trim();
        this.allergies = (allergies == null || allergies.trim().length() == 0) ? "None" : allergies.trim();
    }

    // [Practical 3] Full constructor (used when loading from DB)
    public Patient(String id, String name, int age, String phone, String bloodGroup, String allergies) {
        super(name, age, phone);
        validateId(id);
        this.id = id;
        this.bloodGroup = (bloodGroup == null || bloodGroup.trim().length() == 0) ? "NA" : bloodGroup.trim();
        this.allergies = (allergies == null || allergies.trim().length() == 0) ? "None" : allergies.trim();
    }

    // [Practical 9] String methods: startsWith, split, length, substring, Integer.parseInt
    public static boolean validateId(String pid) {
        if (pid == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        if (!pid.startsWith("MS")) {
            throw new IllegalArgumentException("Patient ID must start with MS");
        }
        String[] parts = pid.split("-");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Patient ID format must be MS-YYYY-XXXX");
        }
        if (parts[1].length() != 4 || parts[2].length() != 4) {
            throw new IllegalArgumentException("Invalid year or sequence length in ID");
        }
        try {
            int year = Integer.parseInt(parts[1]);
            int num = Integer.parseInt(parts[2]);
            if (year < 2000 || num < 0) {
                throw new IllegalArgumentException("Invalid year or number");
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("ID must contain valid numeric parts");
        }
        return true;
    }

    // [Practical 9] String formatting and concat
    public static synchronized String generateNextId() {
        counter++;
        String seq = String.valueOf(counter);
        while (seq.length() < 4) {
            seq = "0".concat(seq);
        }
        return "MS-2026-" + seq;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        validateId(id);
        this.id = id;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    // [Practical 4] Overriding abstract method from Person
    @Override
    public String getRole() {
        return "Patient";
    }
}
