package medisync.web;

import medisync.db.ClinicDao;
import medisync.service.ClinicService;
import medisync.service.WaitlistTask;

// [Practical 1] Main method and project entry point
// [Practical 5] Package medisync.web
public class Main {
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("MediSync Lite - Clinic Management System");
        System.out.println("Third Year B.Tech CSE Mini Project");
        System.out.println("Team Members:");
        System.out.println("1) Sanskar Shinde (PRN: 202401103145)");
        System.out.println("2) Sarvesh Ghodke (PRN: 202401103158)");
        System.out.println("3) Aamer Sayed    (PRN: 202401103150)");
        System.out.println("4) Rohan Tarke    (PRN: 202401103149)");
        System.out.println("=================================================");

        try {
            // [Practical 10] Initialize DAO and load database records
            ClinicDao dao = new ClinicDao();

            // [Practical 2] Initialize service layer with Vectors
            ClinicService service = new ClinicService(dao);

            // [Practical 8] Start background waitlist promotion daemon thread
            WaitlistTask task = new WaitlistTask(service);
            Thread waitlistThread = new Thread(task);
            waitlistThread.setDaemon(true);
            waitlistThread.setName("WaitlistBackgroundThread");
            waitlistThread.start();
            System.out.println("Started waitlist background daemon thread.");

            // [Practical 1] Start HTTP server on port 8080
            int port = 8080;
            WebServer server = new WebServer(port, service);
            server.start();

            System.out.println("Open http://localhost:8080 in your browser.");
        } catch (Exception e) {
            System.out.println("Error starting MediSync Lite: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
