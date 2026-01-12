import 'package:flutter/foundation.dart';
import '../models/activity.dart';
import '../models/attendance.dart';
import '../models/certificate.dart';

class DataService extends ChangeNotifier {
  final Map<String, List<Activity>> _activitiesByUser = {};
  final Map<String, List<AttendanceRecord>> _attendanceByStudent = {};
  final Map<String, List<Certificate>> _certsByStudent = {};

  List<Activity> activitiesFor(String userId) => List.unmodifiable(_activitiesByUser[userId] ?? const []);
  List<AttendanceRecord> attendanceFor(String studentId) => List.unmodifiable(_attendanceByStudent[studentId] ?? const []);
  List<Certificate> certificatesFor(String studentId) => List.unmodifiable(_certsByStudent[studentId] ?? const []);

  void addActivity(Activity a) {
    final list = _activitiesByUser.putIfAbsent(a.userId, () => []);
    list.add(a);
    notifyListeners();
  }

  void updateActivityStatus(String userId, String activityId, ActivityStatus status) {
    final list = _activitiesByUser[userId];
    if (list == null) return;
    final idx = list.indexWhere((e) => e.id == activityId);
    if (idx == -1) return;
    list[idx].status = status;
    notifyListeners();
  }

  void addAttendance(AttendanceRecord r) {
    final list = _attendanceByStudent.putIfAbsent(r.studentId, () => []);
    list.add(r);
    notifyListeners();
  }

  void addCertificate(Certificate c) {
    final list = _certsByStudent.putIfAbsent(c.studentId, () => []);
    list.add(c);
    // Link certificate to activity if we have it
    final userActs = _activitiesByUser[c.studentId];
    if (userActs != null) {
      final idx = userActs.indexWhere((e) => e.id == c.activityId);
      if (idx != -1) {
        userActs[idx].certificateId = c.id;
      }
    }
    notifyListeners();
  }
}
