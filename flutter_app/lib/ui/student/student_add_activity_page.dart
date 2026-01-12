import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/activity.dart';
import '../../services/auth_service.dart';
import '../../services/data_service.dart';

class StudentAddActivityPage extends StatefulWidget {
  final ActivityType type;
  const StudentAddActivityPage({super.key, required this.type});

  @override
  State<StudentAddActivityPage> createState() => _StudentAddActivityPageState();
}

class _StudentAddActivityPageState extends State<StudentAddActivityPage> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _course = TextEditingController();
  final _desc = TextEditingController();
  DateTime _date = DateTime.now();

  @override
  void dispose() {
    _title.dispose();
    _course.dispose();
    _desc.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isAcademic = widget.type == ActivityType.academic;
    return Scaffold(
      appBar: AppBar(title: Text(isAcademic ? 'Add Academic Activity' : 'Add Non-Academic Activity')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _title,
                decoration: const InputDecoration(labelText: 'Title'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _course,
                decoration: InputDecoration(labelText: isAcademic ? 'Course' : 'Category'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _desc,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Description'),
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
                  final userId = context.read<AuthService>().currentUser!.id;
                  final a = Activity(
                    id: 'act_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(9999)}',
                    userId: userId,
                    type: widget.type,
                    title: _title.text.trim(),
                    courseOrCategory: _course.text.trim(),
                    description: _desc.text.trim(),
                    date: _date,
                  );
                  context.read<DataService>().addActivity(a);
                  Navigator.pop(context);
                },
                child: const Text('Save'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
