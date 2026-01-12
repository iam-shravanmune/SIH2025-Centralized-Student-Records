import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/data_service.dart';

class StudentAttendancePage extends StatelessWidget {
  const StudentAttendancePage({super.key});

  @override
  Widget build(BuildContext context) {
    final userId = context.read<AuthService>().currentUser!.id;
    final data = context.watch<DataService>();
    final recs = data.attendanceFor(userId);

    return Scaffold(
      appBar: AppBar(title: const Text('Attendance')),
      body: ListView(
        children: [
          for (final r in recs)
            Card(
              child: ListTile(
                leading: const Icon(Icons.fact_check),
                title: Text(r.courseId),
                subtitle: Text(r.date.toLocal().toString().split(' ').first),
                trailing: Text(r.status),
              ),
            ),
        ],
      ),
    );
  }
}
