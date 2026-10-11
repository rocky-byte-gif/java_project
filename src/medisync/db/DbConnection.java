package medisync.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

// [Practical 5] Package medisync.db
// [Practical 10] JDBC Connection
public class DbConnection {
    // Edit MySQL credentials here:
    public static final String URL = "jdbc:mysql://localhost:3306/medisync?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    public static final String USER = "root";
    public static final String PASSWORD = "password";

    private static boolean driverLoaded = false;

    // Returns a fresh connection
    public static Connection getConnection() throws SQLException {
        if (!driverLoaded) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                driverLoaded = true;
            } catch (ClassNotFoundException e) {
                // If driver class is not found, fallback to standard DriverManager registration
                System.out.println("Note: MySQL JDBC driver class loading: " + e.getMessage());
            }
        }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
