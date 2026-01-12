class Certificate {
  final String id;
  final String studentId;
  final String activityId;
  final String title;
  final DateTime issueDate;
  final List<int> pdfBytes; // generated in app

  const Certificate({
    required this.id,
    required this.studentId,
    required this.activityId,
    required this.title,
    required this.issueDate,
    required this.pdfBytes,
  });
}
