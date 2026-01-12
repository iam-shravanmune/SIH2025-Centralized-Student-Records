import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/activity.dart';
import '../../models/user.dart';
import '../../services/auth_service.dart';
import '../../services/data_service.dart';
import 'student_portfolio_page.dart';
import 'student_add_activity_page.dart';
import 'student_attendance_page.dart';

class StudentDashboard extends StatelessWidget {
  const StudentDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.currentUser!;
    final data = context.watch<DataService>();
    final acts = data.activitiesFor(user.id);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Dashboard'),
        actions: [
          IconButton(onPressed: () => context.read<AuthService>().logout(), icon: const Icon(Icons.logout)),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Welcome, ${user.name}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _Tile(
                title: 'Add Academic Activity',
                icon: Icons.school,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentAddActivityPage(type: ActivityType.academic))),
              ),
              _Tile(
                title: 'Add Non-Academic Activity',
                icon: Icons.emoji_events,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentAddActivityPage(type: ActivityType.nonAcademic))),
              ),
              _Tile(
                title: 'Portfolio',
                icon: Icons.folder_shared,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentPortfolioPage())),
              ),
              _Tile(
                title: 'Attendance',
                icon: Icons.fact_check,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentAttendancePage())),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text('Recent Activities', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          for (final a in acts)
            Card(
              child: ListTile(
                leading: Icon(a.type == ActivityType.academic ? Icons.school : Icons.emoji_events),
                title: Text(a.title),
                subtitle: Text('${a.courseOrCategory} • ${a.date.toLocal().toString().split(' ').first}'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (a.certificateId != null) const Icon(Icons.picture_as_pdf, color: Colors.green),
                    const SizedBox(width: 8),
                    Text(a.status.name),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;
  const _Tile({required this.title, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 260,
      height: 100,
      child: Card(
        child: InkWell(
          onTap: onTap,
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
