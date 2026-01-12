enum ActivityType { academic, nonAcademic }

enum ActivityStatus { pending, approved, rejected }

class Activity {
  final String id;
  final String userId;
  final ActivityType type;
  final String title;
  final String courseOrCategory;
  final String description;
  final DateTime date;
  ActivityStatus status;
  String? certificateId;

  Activity({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.courseOrCategory,
    required this.description,
    required this.date,
    this.status = ActivityStatus.pending,
    this.certificateId,
  });
}
