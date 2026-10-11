package medisync.web;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;
import medisync.exception.InvalidBillException;
import medisync.exception.InvalidPatientException;
import medisync.exception.PatientNotFoundException;
import medisync.exception.SlotNotAvailableException;
import medisync.model.Appointment;
import medisync.model.Bill;
import medisync.model.Doctor;
import medisync.model.MedicalRecord;
import medisync.model.Patient;
import medisync.service.BookingThread;
import medisync.service.ClinicService;

// [Practical 5] Package medisync.web
// [Practical 1] Control Flow and HTTP Server Route Handling
public class WebServer {
    private int port;
    private ClinicService service;
    private HttpServer server;

    public WebServer(int port, ClinicService service) {
        this.port = port;
        this.service = service;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/style.css", new StaticFileHandler("web/style.css", "text/css"));
        server.createContext("/", new RootHandler());
        server.createContext("/patients", new PatientsHandler());
        server.createContext("/patients/add", new AddPatientHandler());
        server.createContext("/patients/delete", new DeletePatientHandler());
        server.createContext("/patient", new PatientDetailsHandler());
        server.createContext("/records/add", new AddRecordHandler());
        server.createContext("/cancel", new CancelAppointmentHandler());
        server.createContext("/doctors", new DoctorsHandler());
        server.createContext("/book", new BookAppointmentHandler());
        server.createContext("/rush", new RushBookingHandler());
        server.createContext("/bills", new BillsHandler());
        server.createContext("/bills/add", new AddBillHandler());
        server.createContext("/bills/status", new UpdateBillStatusHandler());
        server.createContext("/concepts", new ConceptsHandler());

        server.setExecutor(null);
        server.start();
        System.out.println("MediSync Lite Server started on http://localhost:" + port);
    }

    // Read HTML template from web directory
    private static String loadTemplate(String filePath) {
        StringBuilder sb = new StringBuilder();
        try {
            File f = new File(filePath);
            if (!f.exists()) {
                return "<html><body>Template not found: " + filePath + "</body></html>";
            }
            FileInputStream fis = new FileInputStream(f);
            BufferedReader br = new BufferedReader(new InputStreamReader(fis, "UTF-8"));
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append("\n");
            }
            br.close();
            fis.close();
        } catch (Exception e) {
            return "Error reading template: " + e.getMessage();
        }
        return sb.toString();
    }

    // Helper to escape user input to prevent XSS
    public static String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    // Parse query parameters (?key=val&key2=val2)
    public static Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<String, String>();
        if (query == null || query.trim().length() == 0) {
            return map;
        }
        // [Practical 9] String split on &
        String[] pairs = query.split("&");
        for (int i = 0; i < pairs.length; i++) {
            String pair = pairs[i];
            int idx = pair.indexOf("=");
            try {
                if (idx > 0) {
                    String key = URLDecoder.decode(pair.substring(0, idx), "UTF-8");
                    String val = URLDecoder.decode(pair.substring(idx + 1), "UTF-8");
                    map.put(key, val);
                } else if (pair.length() > 0) {
                    String key = URLDecoder.decode(pair, "UTF-8");
                    map.put(key, "");
                }
            } catch (Exception ignored) {
            }
        }
        return map;
    }

    // Parse application/x-www-form-urlencoded POST body
    public static Map<String, String> parseFormData(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line);
        }
        br.close();
        return parseQueryParams(sb.toString());
    }

    // Render alert message or error bar
    private static String getAlertHtml(Map<String, String> params) {
        String msg = params.get("msg");
        String error = params.get("error");
        if (msg != null && msg.trim().length() > 0) {
            return "<div class=\"alert success\">" + escapeHtml(msg) + "</div>";
        }
        if (error != null && error.trim().length() > 0) {
            return "<div class=\"alert error\">" + escapeHtml(error) + "</div>";
        }
        return "";
    }

    // Send HTTP 302 Redirect
    private static void sendRedirect(HttpExchange exchange, String location) throws IOException {
        exchange.getResponseHeaders().set("Location", location);
        exchange.sendResponseHeaders(302, -1);
        exchange.close();
    }

    // Send HTML Response
    private static void sendHtml(HttpExchange exchange, String html) throws IOException {
        byte[] bytes = html.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    // Serve static files like style.css
    private class StaticFileHandler implements HttpHandler {
        private String path;
        private String mime;

        public StaticFileHandler(String path, String mime) {
            this.path = path;
            this.mime = mime;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            File f = new File(path);
            if (!f.exists()) {
                exchange.sendResponseHeaders(404, -1);
                exchange.close();
                return;
            }
            byte[] bytes = new byte[(int) f.length()];
            FileInputStream fis = new FileInputStream(f);
            fis.read(bytes);
            fis.close();
            exchange.getResponseHeaders().set("Content-Type", mime);
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }

    // GET / -> dashboard.html
    private class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!exchange.getRequestURI().getPath().equals("/")) {
                exchange.sendResponseHeaders(404, -1);
                exchange.close();
                return;
            }
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String html = loadTemplate("web/dashboard.html");

            int totalPatients = service.getPatients().size();
            int patientCapacity = service.getPatients().capacity();
            int totalDoctors = service.getDoctors().size();
            int totalAppointments = service.getAppointments().size();
            int waitingCount = service.getWaitingList().size();
            int[] billStats = service.getBillStatusCounts();

            // Build Doctor Slots Table
            StringBuilder docTable = new StringBuilder();
            Vector<Doctor> docs = service.getDoctors();
            for (int i = 0; i < docs.size(); i++) {
                Doctor d = docs.get(i);
                docTable.append("<tr>");
                docTable.append("<td>").append(d.getId()).append("</td>");
                docTable.append("<td>").append(escapeHtml(d.getName())).append("</td>");
                docTable.append("<td>").append(escapeHtml(d.getSpecialization())).append("</td>");
                docTable.append("<td>").append(d.getFreeCount()).append(" / ").append(Doctor.SLOTS_PER_DOCTOR).append("</td>");
                docTable.append("<td>");
                String[] times = d.getSlotTimes();
                boolean[] booked = d.getBooked();
                for (int s = 0; s < times.length; s++) {
                    docTable.append(times[s]).append(": ");
                    if (booked[s]) {
                        docTable.append("<span class=\"status-booked\">Booked</span>");
                    } else {
                        docTable.append("<span class=\"status-free\">Free</span>");
                    }
                    if (s < times.length - 1) docTable.append(" | ");
                }
                docTable.append("</td>");
                docTable.append("</tr>");
            }

            // Build Waiting List Table
            StringBuilder waitTable = new StringBuilder();
            Vector<Patient> wait = service.getWaitingList();
            if (wait.isEmpty()) {
                waitTable.append("<tr><td colspan=\"4\">No patients currently in waiting list.</td></tr>");
            } else {
                for (int i = 0; i < wait.size(); i++) {
                    Patient p = wait.get(i);
                    waitTable.append("<tr>");
                    waitTable.append("<td>").append(i + 1).append("</td>");
                    waitTable.append("<td>").append(p.getId()).append("</td>");
                    waitTable.append("<td>").append(escapeHtml(p.getDisplayName())).append("</td>");
                    waitTable.append("<td>").append(p.getPhone()).append("</td>");
                    waitTable.append("</tr>");
                }
            }

            html = html.replace("{{alert}}", getAlertHtml(params));
            html = html.replace("{{totalPatients}}", String.valueOf(totalPatients));
            html = html.replace("{{patientCapacity}}", String.valueOf(patientCapacity));
            html = html.replace("{{totalDoctors}}", String.valueOf(totalDoctors));
            html = html.replace("{{totalAppointments}}", String.valueOf(totalAppointments));
            html = html.replace("{{waitingCount}}", String.valueOf(waitingCount));
            html = html.replace("{{pendingBills}}", String.valueOf(billStats[0]));
            html = html.replace("{{paidBills}}", String.valueOf(billStats[1]));
            html = html.replace("{{cancelledBills}}", String.valueOf(billStats[2]));
            html = html.replace("{{doctorSlotsRows}}", docTable.toString());
            html = html.replace("{{waitingRows}}", waitTable.toString());

            sendHtml(exchange, html);
        }
    }

    // GET /patients -> patients.html
    private class PatientsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String searchQuery = params.get("search");
            Vector<Patient> list = service.searchPatients(searchQuery);

            StringBuilder rows = new StringBuilder();
            if (list.isEmpty()) {
                rows.append("<tr><td colspan=\"7\">No patients found.</td></tr>");
            } else {
                for (int i = 0; i < list.size(); i++) {
                    Patient p = list.get(i);
                    rows.append("<tr>");
                    rows.append("<td><a href=\"/patient?id=").append(p.getId()).append("\">").append(p.getId()).append("</a></td>");
                    rows.append("<td>").append(escapeHtml(p.getDisplayName())).append("</td>");
                    rows.append("<td>").append(p.getAge()).append("</td>");
                    rows.append("<td>").append(p.getPhone()).append("</td>");
                    rows.append("<td>").append(escapeHtml(p.getBloodGroup())).append("</td>");
                    rows.append("<td>").append(escapeHtml(p.getRole())).append("</td>");
                    rows.append("<td><a href=\"/patient?id=").append(p.getId()).append("\">View Details</a></td>");
                    rows.append("</tr>");
                }
            }

            String html = loadTemplate("web/patients.html");
            html = html.replace("{{alert}}", getAlertHtml(params));
            html = html.replace("{{searchVal}}", searchQuery != null ? escapeHtml(searchQuery) : "");
            html = html.replace("{{patientRows}}", rows.toString());

            sendHtml(exchange, html);
        }
    }

    // POST /patients/add
    private class AddPatientHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendRedirect(exchange, "/patients");
                return;
            }
            Map<String, String> form = parseFormData(exchange);
            String name = form.get("name");
            String ageStr = form.get("age");
            String phone = form.get("phone");
            String blood = form.get("blood_group");
            String allergies = form.get("allergies");

            try {
                int age = Integer.parseInt(ageStr);
                Patient p = service.addPatient(name, age, phone, blood, allergies);
                sendRedirect(exchange, "/patients?msg=Patient+" + p.getId() + "+registered+successfully");
            } catch (InvalidPatientException e) {
                sendRedirect(exchange, "/patients?error=" + e.getMessage().replace(" ", "+"));
            } catch (NumberFormatException e) {
                sendRedirect(exchange, "/patients?error=Invalid+age+number");
            } catch (Exception e) {
                sendRedirect(exchange, "/patients?error=" + e.getMessage().replace(" ", "+"));
            }
        }
    }

    // POST /patients/delete?id=
    private class DeletePatientHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String id = params.get("id");
            if (id != null && id.length() > 0) {
                boolean ok = service.removePatient(id);
                if (ok) {
                    sendRedirect(exchange, "/patients?msg=Patient+" + id + "+deleted");
                } else {
                    sendRedirect(exchange, "/patients?error=Could+not+delete+patient");
                }
            } else {
                sendRedirect(exchange, "/patients");
            }
        }
    }

    // GET /patient?id= -> patient.html
    private class PatientDetailsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String id = params.get("id");
            if (id == null || id.trim().length() == 0) {
                sendRedirect(exchange, "/patients?error=No+patient+ID+specified");
                return;
            }

            Patient p = null;
            try {
                p = service.findPatient(id);
            } catch (PatientNotFoundException e) {
                sendRedirect(exchange, "/patients?error=" + e.getMessage().replace(" ", "+"));
                return;
            }

            String html = loadTemplate("web/patient.html");

            // Appointments list
            StringBuilder apptRows = new StringBuilder();
            Vector<Appointment> appts = service.getAppointmentsForPatient(p.getId());
            if (appts.isEmpty()) {
                apptRows.append("<tr><td colspan=\"5\">No appointments on record.</td></tr>");
            } else {
                for (int i = 0; i < appts.size(); i++) {
                    Appointment a = appts.get(i);
                    Doctor doc = service.findDoctor(a.getDoctorId());
                    String docName = (doc != null) ? doc.getName() : ("Dr. #" + a.getDoctorId());
                    apptRows.append("<tr>");
                    apptRows.append("<td>").append(a.getId()).append("</td>");
                    apptRows.append("<td>").append(escapeHtml(docName)).append("</td>");
                    apptRows.append("<td>").append(a.getSlotTime()).append("</td>");
                    if ("BOOKED".equalsIgnoreCase(a.getStatus())) {
                        apptRows.append("<td><span class=\"status-booked\">BOOKED</span></td>");
                        apptRows.append("<td><form method=\"POST\" action=\"/cancel?id=").append(a.getId()).append("&patientId=").append(p.getId()).append("\"><button type=\"submit\">Cancel</button></form></td>");
                    } else {
                        apptRows.append("<td><span class=\"status-cancelled\">CANCELLED</span></td>");
                        apptRows.append("<td>-</td>");
                    }
                    apptRows.append("</tr>");
                }
            }

            // Medical records list
            StringBuilder recRows = new StringBuilder();
            Vector<MedicalRecord> recs = service.getRecords(p.getId());
            if (recs.isEmpty()) {
                recRows.append("<tr><td colspan=\"5\">No medical records available.</td></tr>");
            } else {
                for (int i = 0; i < recs.size(); i++) {
                    MedicalRecord r = recs.get(i);
                    recRows.append("<tr>");
                    recRows.append("<td>").append(r.getId()).append("</td>");
                    recRows.append("<td>").append(escapeHtml(r.getDiagnosis())).append("</td>");
                    recRows.append("<td>").append(escapeHtml(r.getPrescription())).append("</td>");
                    recRows.append("<td>").append(escapeHtml(r.getDoctorName())).append("</td>");
                    recRows.append("<td>").append(r.getDateText()).append("</td>");
                    recRows.append("</tr>");
                }
            }

            // Bills for this patient
            StringBuilder billRows = new StringBuilder();
            Vector<Bill> allBills = service.getBills();
            int patientBillCount = 0;
            for (int i = 0; i < allBills.size(); i++) {
                Bill b = allBills.get(i);
                if (b.getPatientId().equalsIgnoreCase(p.getId())) {
                    patientBillCount++;
                    billRows.append("<tr>");
                    billRows.append("<td>").append(b.getId()).append("</td>");
                    billRows.append("<td>").append(b.getConsultation()).append("</td>");
                    billRows.append("<td>").append(b.getMedicine()).append("</td>");
                    billRows.append("<td>").append(b.getTestFee()).append("</td>");
                    billRows.append("<td><b>").append(b.getTotal()).append("</b></td>");
                    if ("PAID".equalsIgnoreCase(b.getStatus())) {
                        billRows.append("<td><span class=\"status-paid\">PAID</span></td>");
                    } else if ("PENDING".equalsIgnoreCase(b.getStatus())) {
                        billRows.append("<td><span class=\"status-pending\">PENDING</span></td>");
                    } else {
                        billRows.append("<td><span class=\"status-cancelled\">CANCELLED</span></td>");
                    }
                    billRows.append("</tr>");
                }
            }
            if (patientBillCount == 0) {
                billRows.append("<tr><td colspan=\"6\">No bills generated for this patient yet.</td></tr>");
            }

            // Doctor dropdown options
            StringBuilder docOptions = new StringBuilder();
            Vector<Doctor> docs = service.getDoctors();
            for (int i = 0; i < docs.size(); i++) {
                Doctor d = docs.get(i);
                docOptions.append("<option value=\"").append(escapeHtml(d.getName())).append("\">").append(escapeHtml(d.getName())).append("</option>");
            }

            html = html.replace("{{alert}}", getAlertHtml(params));
            html = html.replace("{{patientId}}", p.getId());
            html = html.replace("{{patientName}}", escapeHtml(p.getDisplayName()));
            html = html.replace("{{patientAge}}", String.valueOf(p.getAge()));
            html = html.replace("{{patientPhone}}", p.getPhone());
            html = html.replace("{{patientBlood}}", escapeHtml(p.getBloodGroup()));
            html = html.replace("{{patientAllergies}}", escapeHtml(p.getAllergies()));
            html = html.replace("{{appointmentRows}}", apptRows.toString());
            html = html.replace("{{recordRows}}", recRows.toString());
            html = html.replace("{{billRows}}", billRows.toString());
            html = html.replace("{{doctorOptions}}", docOptions.toString());

            sendHtml(exchange, html);
        }
    }

    // POST /records/add
    private class AddRecordHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendRedirect(exchange, "/patients");
                return;
            }
            Map<String, String> form = parseFormData(exchange);
            String patientId = form.get("patient_id");
            String diagnosis = form.get("diagnosis");
            String prescription = form.get("prescription");
            String doctorName = form.get("doctor_name");
            String dateText = form.get("date_text");

            if (dateText == null || dateText.trim().length() == 0) {
                dateText = "2026-10-10";
            }

            MedicalRecord r = new MedicalRecord(0, patientId, diagnosis, prescription, doctorName, dateText);
            service.addRecord(r);
            sendRedirect(exchange, "/patient?id=" + patientId + "&msg=Medical+record+added");
        }
    }

    // POST /cancel?id=&patientId=
    private class CancelAppointmentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String idStr = params.get("id");
            String patientId = params.get("patientId");
            try {
                int id = Integer.parseInt(idStr);
                boolean ok = service.cancelAppointment(id);
                if (ok) {
                    sendRedirect(exchange, "/patient?id=" + patientId + "&msg=Appointment+cancelled+and+slot+freed");
                } else {
                    sendRedirect(exchange, "/patient?id=" + patientId + "&error=Could+not+cancel+appointment");
                }
            } catch (Exception e) {
                sendRedirect(exchange, "/patients?error=" + e.getMessage().replace(" ", "+"));
            }
        }
    }

    // GET /doctors -> doctors.html
    private class DoctorsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String html = loadTemplate("web/doctors.html");

            StringBuilder docRows = new StringBuilder();
            StringBuilder docOptions = new StringBuilder();
            Vector<Doctor> docs = service.getDoctors();

            for (int i = 0; i < docs.size(); i++) {
                Doctor d = docs.get(i);
                docOptions.append("<option value=\"").append(d.getId()).append("\">").append(escapeHtml(d.getName())).append(" (").append(escapeHtml(d.getSpecialization())).append(")</option>");

                docRows.append("<tr>");
                docRows.append("<td>").append(d.getId()).append("</td>");
                docRows.append("<td><b>").append(escapeHtml(d.getName())).append("</b></td>");
                docRows.append("<td>").append(escapeHtml(d.getSpecialization())).append("</td>");
                docRows.append("<td>").append(d.getFreeCount()).append(" of ").append(Doctor.SLOTS_PER_DOCTOR).append(" free</td>");
                docRows.append("<td>");
                String[] times = d.getSlotTimes();
                boolean[] booked = d.getBooked();
                for (int s = 0; s < times.length; s++) {
                    docRows.append(times[s]).append(": ");
                    if (booked[s]) {
                        docRows.append("<span class=\"status-booked\">Booked</span>");
                    } else {
                        docRows.append("<span class=\"status-free\">Free</span>");
                    }
                    if (s < times.length - 1) docRows.append(" | ");
                }
                docRows.append("</td>");
                docRows.append("</tr>");
            }

            html = html.replace("{{alert}}", getAlertHtml(params));
            html = html.replace("{{doctorRows}}", docRows.toString());
            html = html.replace("{{doctorOptions}}", docOptions.toString());

            sendHtml(exchange, html);
        }
    }

    // POST /book
    private class BookAppointmentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendRedirect(exchange, "/doctors");
                return;
            }
            Map<String, String> form = parseFormData(exchange);
            String patientId = form.get("patient_id");
            String doctorIdStr = form.get("doctor_id");
            boolean emergency = "on".equalsIgnoreCase(form.get("emergency")) || "true".equalsIgnoreCase(form.get("emergency"));

            try {
                int docId = Integer.parseInt(doctorIdStr);
                Appointment appt = service.bookAppointment(patientId, docId, emergency);
                sendRedirect(exchange, "/doctors?msg=Appointment+booked+successfully+at+" + appt.getSlotTime());
            } catch (SlotNotAvailableException se) {
                sendRedirect(exchange, "/doctors?error=" + se.getMessage().replace(" ", "+"));
            } catch (PatientNotFoundException pe) {
                sendRedirect(exchange, "/doctors?error=" + pe.getMessage().replace(" ", "+"));
            } catch (Exception e) {
                sendRedirect(exchange, "/doctors?error=" + e.getMessage().replace(" ", "+"));
            }
        }
    }

    // POST /rush -> rush.html
    // [Practical 8] Multithreading Rush Test: 8 concurrent patient threads
    private class RushBookingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendRedirect(exchange, "/doctors");
                return;
            }
            Map<String, String> form = parseFormData(exchange);
            String docIdStr = form.get("doctor_id");
            int docId = 1;
            try {
                docId = Integer.parseInt(docIdStr);
            } catch (Exception ignored) {
            }

            Doctor targetDoc = service.findDoctor(docId);
            String docName = (targetDoc != null) ? targetDoc.getName() : "Doctor " + docId;

            // Ensure we have at least 8 patients for the test
            Vector<Patient> testPatients = new Vector<Patient>();
            Vector<Patient> existing = service.getPatients();
            for (int i = 0; i < existing.size() && testPatients.size() < 8; i++) {
                testPatients.add(existing.get(i));
            }
            while (testPatients.size() < 8) {
                try {
                    int num = testPatients.size() + 1;
                    Patient temp = service.addPatient("Rush Test Patient " + num, 25, "900000000" + num, "O+", "None");
                    testPatients.add(temp);
                } catch (Exception ignored) {
                    break;
                }
            }

            // Shared thread-safe result list
            Vector<String> results = new Vector<String>();
            BookingThread[] threads = new BookingThread[8];

            for (int i = 0; i < 8; i++) {
                Patient p = testPatients.get(i);
                threads[i] = new BookingThread(p, docId, service, results);
            }

            // Start all 8 threads at once
            for (int i = 0; i < 8; i++) {
                threads[i].start();
            }

            // [Practical 8] Wait for all threads using join()
            for (int i = 0; i < 8; i++) {
                try {
                    threads[i].join();
                } catch (InterruptedException e) {
                    System.out.println("Thread join interrupted: " + e.getMessage());
                }
            }

            // Verify no double booking took place across slots
            Vector<Appointment> appts = service.getAppointments();
            int doubleBookings = 0;
            // Check active bookings for this doctor for duplicates
            Map<String, Integer> slotFreq = new HashMap<String, Integer>();
            for (int i = 0; i < appts.size(); i++) {
                Appointment a = appts.get(i);
                if (a.getDoctorId() == docId && "BOOKED".equalsIgnoreCase(a.getStatus())) {
                    Integer count = slotFreq.get(a.getSlotTime());
                    if (count == null) {
                        slotFreq.put(a.getSlotTime(), 1);
                    } else {
                        slotFreq.put(a.getSlotTime(), count + 1);
                        doubleBookings++;
                    }
                }
            }

            StringBuilder resultRows = new StringBuilder();
            for (int i = 0; i < results.size(); i++) {
                resultRows.append("<tr><td>").append(i + 1).append("</td><td>").append(escapeHtml(results.get(i))).append("</td></tr>");
            }

            String html = loadTemplate("web/rush.html");
            html = html.replace("{{doctorName}}", escapeHtml(docName));
            html = html.replace("{{resultRows}}", resultRows.toString());
            html = html.replace("{{doubleBookings}}", String.valueOf(doubleBookings));

            sendHtml(exchange, html);
        }
    }

    // GET /bills -> bills.html
    private class BillsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String filterStatus = params.get("status");
            Vector<Bill> list;

            if (filterStatus != null && filterStatus.trim().length() > 0 && !filterStatus.equalsIgnoreCase("ALL")) {
                list = service.getBillsByStatus(filterStatus.toUpperCase());
            } else {
                list = service.getBills();
            }

            StringBuilder rows = new StringBuilder();
            if (list.isEmpty()) {
                rows.append("<tr><td colspan=\"8\">No bills found.</td></tr>");
            } else {
                for (int i = 0; i < list.size(); i++) {
                    Bill b = list.get(i);
                    rows.append("<tr>");
                    rows.append("<td>").append(b.getId()).append("</td>");
                    rows.append("<td><a href=\"/patient?id=").append(b.getPatientId()).append("\">").append(b.getPatientId()).append("</a></td>");
                    rows.append("<td>").append(b.getConsultation()).append("</td>");
                    rows.append("<td>").append(b.getMedicine()).append("</td>");
                    rows.append("<td>").append(b.getTestFee()).append("</td>");
                    rows.append("<td><b>").append(b.getTotal()).append("</b></td>");

                    if ("PAID".equalsIgnoreCase(b.getStatus())) {
                        rows.append("<td><span class=\"status-paid\">PAID</span></td>");
                        rows.append("<td>-</td>");
                    } else if ("PENDING".equalsIgnoreCase(b.getStatus())) {
                        rows.append("<td><span class=\"status-pending\">PENDING</span></td>");
                        rows.append("<td>");
                        rows.append("<form method=\"POST\" action=\"/bills/status?id=").append(b.getId()).append("&status=PAID\" style=\"display:inline;\"><button type=\"submit\">Mark Paid</button></form> ");
                        rows.append("<form method=\"POST\" action=\"/bills/status?id=").append(b.getId()).append("&status=CANCELLED\" style=\"display:inline;\"><button type=\"submit\">Cancel</button></form>");
                        rows.append("</td>");
                    } else {
                        rows.append("<td><span class=\"status-cancelled\">CANCELLED</span></td>");
                        rows.append("<td>-</td>");
                    }
                    rows.append("</tr>");
                }
            }

            String html = loadTemplate("web/bills.html");
            html = html.replace("{{alert}}", getAlertHtml(params));
            html = html.replace("{{filterStatus}}", filterStatus != null ? filterStatus : "ALL");
            html = html.replace("{{billRows}}", rows.toString());

            sendHtml(exchange, html);
        }
    }

    // POST /bills/add using Bill.Builder pattern
    private class AddBillHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendRedirect(exchange, "/bills");
                return;
            }
            Map<String, String> form = parseFormData(exchange);
            String patientId = form.get("patient_id");
            String consultStr = form.get("consultation");
            String medStr = form.get("medicine");
            String testStr = form.get("test_fee");

            try {
                double consultation = consultStr != null && consultStr.length() > 0 ? Double.parseDouble(consultStr) : 0.0;
                double medicine = medStr != null && medStr.length() > 0 ? Double.parseDouble(medStr) : 0.0;
                double testFee = testStr != null && testStr.length() > 0 ? Double.parseDouble(testStr) : 0.0;

                // [Practical 6] Builder pattern instantiation and method chaining
                Bill bill = new Bill.Builder()
                    .patientId(patientId)
                    .consultation(consultation)
                    .medicine(medicine)
                    .testFee(testFee)
                    .build();

                service.addBill(bill);
                sendRedirect(exchange, "/bills?msg=Bill+" + bill.getId() + "+generated+successfully");
            } catch (InvalidBillException ibe) {
                sendRedirect(exchange, "/bills?error=" + ibe.getMessage().replace(" ", "+"));
            } catch (NumberFormatException nfe) {
                sendRedirect(exchange, "/bills?error=Invalid+fee+values");
            } catch (Exception e) {
                sendRedirect(exchange, "/bills?error=" + e.getMessage().replace(" ", "+"));
            }
        }
    }

    // POST /bills/status?id=&status=
    private class UpdateBillStatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String idStr = params.get("id");
            String status = params.get("status");

            try {
                int id = Integer.parseInt(idStr);
                service.updateBillStatus(id, status);
                sendRedirect(exchange, "/bills?msg=Bill+" + id + "+updated+to+" + status);
            } catch (Exception e) {
                sendRedirect(exchange, "/bills?error=" + e.getMessage().replace(" ", "+"));
            }
        }
    }

    // GET /concepts -> concepts.html
    private class ConceptsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String html = loadTemplate("web/concepts.html");
            sendHtml(exchange, html);
        }
    }
}
