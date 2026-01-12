class AttendanceRecord {
  final String id;
  final String studentId;
  final String courseId;
  final DateTime date;
  final String status; // present, absent, late

  const AttendanceRecord({
    required this.id,
    required this.studentId,
    required this.courseId,
    required this.date,
    required this.status,
  });
}
