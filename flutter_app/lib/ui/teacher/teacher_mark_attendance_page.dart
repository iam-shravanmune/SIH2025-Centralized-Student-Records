import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/attendance.dart';
import '../../services/data_service.dart';

class TeacherMarkAttendancePage extends StatefulWidget {
  const TeacherMarkAttendancePage({super.key});

  @override
  State<TeacherMarkAttendancePage> createState() => _TeacherMarkAttendancePageState();
}

class _TeacherMarkAttendancePageState extends State<TeacherMarkAttendancePage> {
  final _formKey = GlobalKey<FormState>();
  final _courseId = TextEditingController(text: 'CSE101');
  final _studentIds = TextEditingController(text: 'u_s1,u_s2,u_s3');
  DateTime _date = DateTime.now();
  String _status = 'present';

  @override
  void dispose() {
    _courseId.dispose();
    _studentIds.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mark Attendance')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _courseId,
                decoration: const InputDecoration(labelText: 'Course ID'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _studentIds,
                decoration: const InputDecoration(labelText: 'Student IDs (comma separated)'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _status,
                items: const [
                  DropdownMenuItem(value: 'present', child: Text('Present')),
                  DropdownMenuItem(value: 'absent', child: Text('Absent')),
                  DropdownMenuItem(value: 'late', child: Text('Late')),
                ],
                onChanged: (v) => setState(() => _status = v ?? 'present'),
                decoration: const InputDecoration(labelText: 'Default Status'),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: Text('Date: ${_date.toLocal().toString().split(' ').first}')),
                  TextButton(
                    onPressed: () async {
                      final now = DateTime.now();
                      final d = await showDatePicker(context: context, firstDate: DateTime(now.year - 5), lastDate: DateTime(now.year + 5), initialDate: _date);
                      if (d != null) setState(() => _date = d);
                    },
                    child: const Text('Pick Date'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  if (!_formKey.currentState!.validate()) return;
                  final ids = _studentIds.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty);
                  for (final id in ids) {
                    final r = AttendanceRecord(
                      id: 'att_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(9999)}',
                      studentId: id,
                      courseId: _courseId.text.trim(),
                      date: _date,
                      status: _status,
                    );
                    context.read<DataService>().addAttendance(r);
                  }
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attendance marked')));
                },
                child: const Text('Submit'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
