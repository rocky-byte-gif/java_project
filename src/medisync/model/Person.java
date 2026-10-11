package medisync.model;

// [Practical 3] Abstract Class & Encapsulation
// [Practical 5] Package medisync.model
public abstract class Person {
    private String name;
    private int age;
    private String phone;

    // [Practical 6] Default constructor using this() chaining
    public Person() {
        this("Unknown", 0, "0000000000");
    }

    // [Practical 3] Parameterized constructor
    public Person(String name, int age, String phone) {
        setName(name);
        setAge(age);
        setPhone(phone);
    }

    public String getName() {
        return name;
    }

    // [Practical 9] String validation with trim and length
    public void setName(String name) {
        if (name == null || name.trim().length() == 0) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
        this.name = name.trim();
    }

    public int getAge() {
        return age;
    }

    // [Practical 1] Validation with if-else and relational operators
    public void setAge(int age) {
        if (age < 0 || age > 120) {
            throw new IllegalArgumentException("Age must be between 0 and 120");
        }
        this.age = age;
    }

    public String getPhone() {
        return phone;
    }

    // [Practical 9] Phone check: length is 10 and each char is a digit using loop and charAt
    public void setPhone(String phone) {
        if (phone == null || phone.length() != 10) {
            throw new IllegalArgumentException("Phone must be exactly 10 digits");
        }
        for (int i = 0; i < phone.length(); i++) {
            char ch = phone.charAt(i);
            if (ch < '0' || ch > '9') {
                throw new IllegalArgumentException("Phone must contain only numbers");
            }
        }
        this.phone = phone;
    }

    // [Practical 4] Abstract method
    public abstract String getRole();

    // [Practical 6] Final method - cannot be overridden
    // [Practical 9] Proper-case names using split, charAt, toUpperCase, substring, toLowerCase
    public final String getDisplayName() {
        if (name == null || name.length() == 0) {
            return "";
        }
        String[] parts = name.split(" ");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            String word = parts[i].trim();
            if (word.length() > 0) {
                String properWord = word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
                sb.append(properWord);
                if (i < parts.length - 1) {
                    sb.append(" ");
                }
            }
        }
        return sb.toString();
    }
}
