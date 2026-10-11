package medisync.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Vector;
import medisync.model.Appointment;
import medisync.model.Bill;
import medisync.model.Doctor;
import medisync.model.MedicalRecord;
import medisync.model.Patient;

// [Practical 5] Package medisync.db
// [Practical 10] JDBC Data Access Object using PreparedStatement and ResultSet
public class ClinicDao {

    public ClinicDao() {
        checkAndSeedInitialData();
    }

    // Seed 3 doctors and 3 patients if tables are empty
    private void checkAndSeedInitialData() {
        Connection con = null;
        Statement stmt = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            stmt = con.createStatement();

            // Check doctor count
            rs = stmt.executeQuery("SELECT COUNT(*) FROM doctor");
            if (rs.next() && rs.getInt(1) == 0) {
                stmt.executeUpdate("INSERT INTO doctor (id, name, specialization) VALUES (1, 'Dr. Mehta', 'General')");
                stmt.executeUpdate("INSERT INTO doctor (id, name, specialization) VALUES (2, 'Dr. Rao', 'Cardiology')");
                stmt.executeUpdate("INSERT INTO doctor (id, name, specialization) VALUES (3, 'Dr. Khan', 'Pediatrics')");
            }
            if (rs != null) rs.close();

            // Check patient count
            rs = stmt.executeQuery("SELECT COUNT(*) FROM patient");
            if (rs.next() && rs.getInt(1) == 0) {
                stmt.executeUpdate("INSERT INTO patient (id, name, age, phone, blood_group, allergies) VALUES ('MS-2026-0001', 'Rahul Sharma', 28, '9876543210', 'B+', 'Penicillin')");
                stmt.executeUpdate("INSERT INTO patient (id, name, age, phone, blood_group, allergies) VALUES ('MS-2026-0002', 'Pooja Patel', 34, '9822012345', 'O+', 'None')");
                stmt.executeUpdate("INSERT INTO patient (id, name, age, phone, blood_group, allergies) VALUES ('MS-2026-0003', 'Amit Kulkarni', 45, '9890098900', 'A+', 'Dust')");
            }
        } catch (SQLException e) {
            System.out.println("Seed check note: " + e.getMessage());
        } finally {
            // [Practical 7] Closing resources in finally block
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (con != null) con.close();
            } catch (SQLException ignored) {
            }
        }
    }

    // [Practical 10] PreparedStatement for Patient insertion
    public boolean savePatient(Patient p) {
        Connection con = null;
        PreparedStatement ps = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("INSERT INTO patient (id, name, age, phone, blood_group, allergies) VALUES (?, ?, ?, ?, ?, ?)");
            ps.setString(1, p.getId());
            ps.setString(2, p.getName());
            ps.setInt(3, p.getAge());
            ps.setString(4, p.getPhone());
            ps.setString(5, p.getBloodGroup());
            ps.setString(6, p.getAllergies());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("savePatient error: " + e.getMessage());
            return false;
        } finally {
            close(con, ps, null);
        }
    }

    public boolean deletePatient(String id) {
        Connection con = null;
        PreparedStatement ps = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("DELETE FROM patient WHERE id = ?");
            ps.setString(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("deletePatient error: " + e.getMessage());
            return false;
        } finally {
            close(con, ps, null);
        }
    }

    // [Practical 2] Vector of Patients loaded from DB
    public Vector<Patient> loadPatients() {
        Vector<Patient> list = new Vector<Patient>();
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("SELECT id, name, age, phone, blood_group, allergies FROM patient ORDER BY id ASC");
            rs = ps.executeQuery();
            while (rs.next()) {
                Patient p = new Patient(
                    rs.getString("id"),
                    rs.getString("name"),
                    rs.getInt("age"),
                    rs.getString("phone"),
                    rs.getString("blood_group"),
                    rs.getString("allergies")
                );
                list.add(p);
            }
        } catch (SQLException e) {
            System.out.println("loadPatients error: " + e.getMessage());
        } finally {
            close(con, ps, rs);
        }
        return list;
    }

    public Vector<Doctor> loadDoctors() {
        Vector<Doctor> list = new Vector<Doctor>();
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("SELECT id, name, specialization FROM doctor ORDER BY id ASC");
            rs = ps.executeQuery();
            while (rs.next()) {
                Doctor d = new Doctor(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("specialization")
                );
                list.add(d);
            }
        } catch (SQLException e) {
            System.out.println("loadDoctors error: " + e.getMessage());
        } finally {
            close(con, ps, rs);
        }
        return list;
    }

    public int saveAppointment(Appointment a) {
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        int generatedId = -1;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("INSERT INTO appointment (patient_id, doctor_id, slot_time, status) VALUES (?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, a.getPatientId());
            ps.setInt(2, a.getDoctorId());
            ps.setString(3, a.getSlotTime());
            ps.setString(4, a.getStatus());
            ps.executeUpdate();
            rs = ps.getGeneratedKeys();
            if (rs.next()) {
                generatedId = rs.getInt(1);
                a.setId(generatedId);
            }
        } catch (SQLException e) {
            System.out.println("saveAppointment error: " + e.getMessage());
        } finally {
            close(con, ps, rs);
        }
        return generatedId;
    }

    public boolean updateAppointmentStatus(int id, String status) {
        Connection con = null;
        PreparedStatement ps = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("UPDATE appointment SET status = ? WHERE id = ?");
            ps.setString(1, status);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("updateAppointmentStatus error: " + e.getMessage());
            return false;
        } finally {
            close(con, ps, null);
        }
    }

    public Vector<Appointment> loadAppointments() {
        Vector<Appointment> list = new Vector<Appointment>();
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("SELECT id, patient_id, doctor_id, slot_time, status FROM appointment");
            rs = ps.executeQuery();
            while (rs.next()) {
                Appointment a = new Appointment(
                    rs.getInt("id"),
                    rs.getString("patient_id"),
                    rs.getInt("doctor_id"),
                    rs.getString("slot_time"),
                    rs.getString("status")
                );
                list.add(a);
            }
        } catch (SQLException e) {
            System.out.println("loadAppointments error: " + e.getMessage());
        } finally {
            close(con, ps, rs);
        }
        return list;
    }

    public boolean saveRecord(MedicalRecord r) {
        Connection con = null;
        PreparedStatement ps = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("INSERT INTO record (patient_id, diagnosis, prescription, doctor_name, date_text) VALUES (?, ?, ?, ?, ?)");
            ps.setString(1, r.getPatientId());
            ps.setString(2, r.getDiagnosis());
            ps.setString(3, r.getPrescription());
            ps.setString(4, r.getDoctorName());
            ps.setString(5, r.getDateText());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("saveRecord error: " + e.getMessage());
            return false;
        } finally {
            close(con, ps, null);
        }
    }

    public Vector<MedicalRecord> getRecords(String patientId) {
        Vector<MedicalRecord> list = new Vector<MedicalRecord>();
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("SELECT id, patient_id, diagnosis, prescription, doctor_name, date_text FROM record WHERE patient_id = ? ORDER BY id DESC");
            ps.setString(1, patientId);
            rs = ps.executeQuery();
            while (rs.next()) {
                MedicalRecord r = new MedicalRecord(
                    rs.getInt("id"),
                    rs.getString("patient_id"),
                    rs.getString("diagnosis"),
                    rs.getString("prescription"),
                    rs.getString("doctor_name"),
                    rs.getString("date_text")
                );
                list.add(r);
            }
        } catch (SQLException e) {
            System.out.println("getRecords error: " + e.getMessage());
        } finally {
            close(con, ps, rs);
        }
        return list;
    }

    public boolean saveBill(Bill b) {
        Connection con = null;
        PreparedStatement ps = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("INSERT INTO bill (id, patient_id, consultation, medicine, test_fee, total, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            ps.setInt(1, b.getId());
            ps.setString(2, b.getPatientId());
            ps.setDouble(3, b.getConsultation());
            ps.setDouble(4, b.getMedicine());
            ps.setDouble(5, b.getTestFee());
            ps.setDouble(6, b.getTotal());
            ps.setString(7, b.getStatus());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("saveBill error: " + e.getMessage());
            return false;
        } finally {
            close(con, ps, null);
        }
    }

    public boolean updateBillStatus(int id, String status) {
        Connection con = null;
        PreparedStatement ps = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("UPDATE bill SET status = ? WHERE id = ?");
            ps.setString(1, status);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("updateBillStatus error: " + e.getMessage());
            return false;
        } finally {
            close(con, ps, null);
        }
    }

    public Vector<Bill> getBills() {
        Vector<Bill> list = new Vector<Bill>();
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("SELECT id, patient_id, consultation, medicine, test_fee, total, status FROM bill ORDER BY id DESC");
            rs = ps.executeQuery();
            while (rs.next()) {
                Bill b = new Bill(
                    rs.getInt("id"),
                    rs.getString("patient_id"),
                    rs.getDouble("consultation"),
                    rs.getDouble("medicine"),
                    rs.getDouble("test_fee"),
                    rs.getDouble("total"),
                    rs.getString("status")
                );
                list.add(b);
            }
        } catch (SQLException e) {
            System.out.println("getBills error: " + e.getMessage());
        } finally {
            close(con, ps, rs);
        }
        return list;
    }

    // Filter bills by status
    public Vector<Bill> getBillsByStatus(String status) {
        Vector<Bill> list = new Vector<Bill>();
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("SELECT id, patient_id, consultation, medicine, test_fee, total, status FROM bill WHERE status = ? ORDER BY id DESC");
            ps.setString(1, status);
            rs = ps.executeQuery();
            while (rs.next()) {
                Bill b = new Bill(
                    rs.getInt("id"),
                    rs.getString("patient_id"),
                    rs.getDouble("consultation"),
                    rs.getDouble("medicine"),
                    rs.getDouble("test_fee"),
                    rs.getDouble("total"),
                    rs.getString("status")
                );
                list.add(b);
            }
        } catch (SQLException e) {
            System.out.println("getBillsByStatus error: " + e.getMessage());
        } finally {
            close(con, ps, rs);
        }
        return list;
    }

    public int getMaxPatientNumber() {
        int max = 0;
        Connection con = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            ps = con.prepareStatement("SELECT id FROM patient");
            rs = ps.executeQuery();
            while (rs.next()) {
                String id = rs.getString("id");
                String[] parts = id.split("-");
                if (parts.length == 3) {
                    try {
                        int num = Integer.parseInt(parts[2]);
                        if (num > max) {
                            max = num;
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        } catch (SQLException e) {
            System.out.println("getMaxPatientNumber error: " + e.getMessage());
        } finally {
            close(con, ps, rs);
        }
        return max;
    }

    public int getMaxBillId() {
        int max = 0;
        Connection con = null;
        Statement stmt = null;
        ResultSet rs = null;
        try {
            con = DbConnection.getConnection();
            stmt = con.createStatement();
            rs = stmt.executeQuery("SELECT MAX(id) FROM bill");
            if (rs.next()) {
                max = rs.getInt(1);
            }
        } catch (SQLException e) {
            System.out.println("getMaxBillId error: " + e.getMessage());
        } finally {
            close(con, stmt, rs);
        }
        return max;
    }

    private void close(Connection con, Statement stmt, ResultSet rs) {
        try {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (con != null) con.close();
        } catch (SQLException ignored) {
        }
    }
}
