import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/activity.dart';
import '../../services/data_service.dart';

class TeacherValidateActivitiesPage extends StatefulWidget {
  const TeacherValidateActivitiesPage({super.key});

  @override
  State<TeacherValidateActivitiesPage> createState() => _TeacherValidateActivitiesPageState();
}

class _TeacherValidateActivitiesPageState extends State<TeacherValidateActivitiesPage> {
  final _studentId = TextEditingController();

  @override
  void dispose() {
    _studentId.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final data = context.watch<DataService>();
    final items = _studentId.text.isEmpty
        ? <Activity>[]
        : data
            .activitiesFor(_studentId.text.trim())
            .where((a) => a.status == ActivityStatus.pending)
            .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Validate Activities')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _studentId,
                    decoration: const InputDecoration(labelText: 'Student ID', hintText: 'e.g., u_s1'),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: items.isEmpty
                  ? const Center(child: Text('Enter a Student ID to review pending activities'))
                  : ListView(
                      children: [
                        for (final a in items)
                          Card(
                            child: ListTile(
                              title: Text(a.title),
                              subtitle: Text('${a.type.name} • ${a.date.toLocal().toString().split(' ').first}'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.close, color: Colors.red),
                                    onPressed: () {
                                      context.read<DataService>().updateActivityStatus(a.userId, a.id, ActivityStatus.rejected);
                                    },
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.check, color: Colors.green),
                                    onPressed: () {
                                      context.read<DataService>().updateActivityStatus(a.userId, a.id, ActivityStatus.approved);
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
