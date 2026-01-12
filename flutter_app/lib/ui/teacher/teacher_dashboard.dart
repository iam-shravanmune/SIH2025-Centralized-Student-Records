import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/data_service.dart';
import 'teacher_mark_attendance_page.dart';
import 'teacher_issue_certificate_page.dart';
import 'teacher_validate_activities_page.dart';

class TeacherDashboard extends StatelessWidget {
  const TeacherDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().currentUser!;
    final data = context.watch<DataService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Teacher Dashboard'),
        actions: [IconButton(onPressed: () => context.read<AuthService>().logout(), icon: const Icon(Icons.logout))],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Welcome, ${user.name}'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: const [
              _Tile(title: 'Mark Attendance', icon: Icons.checklist, page: TeacherMarkAttendancePage()),
              _Tile(title: 'Issue Certificate', icon: Icons.picture_as_pdf, page: TeacherIssueCertificatePage()),
              _Tile(title: 'Validate Activities', icon: Icons.verified, page: TeacherValidateActivitiesPage()),
            ],
          ),
          const SizedBox(height: 24),
          const Text('System Snapshot (Demo)'),
          const SizedBox(height: 8),
          Text('Students with activities: ${data.activitiesFor(user.id).length} (teacher scoped demo)'),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget page;
  const _Tile({required this.title, required this.icon, required this.page});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 260,
      height: 100,
      child: Card(
        child: InkWell(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => page)),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [Icon(icon), const SizedBox(height: 8), Text(title, textAlign: TextAlign.center)],
            ),
          ),
        ),
      ),
    );
  }
}
