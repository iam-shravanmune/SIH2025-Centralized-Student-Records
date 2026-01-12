import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/certificate.dart';
import '../../services/data_service.dart';
import '../../utils/pdf_generator.dart';

class TeacherIssueCertificatePage extends StatefulWidget {
  const TeacherIssueCertificatePage({super.key});

  @override
  State<TeacherIssueCertificatePage> createState() => _TeacherIssueCertificatePageState();
}

class _TeacherIssueCertificatePageState extends State<TeacherIssueCertificatePage> {
  final _formKey = GlobalKey<FormState>();
  final _studentId = TextEditingController();
  final _activityId = TextEditingController();
  final _title = TextEditingController(text: 'Certificate of Achievement');

  @override
  void dispose() {
    _studentId.dispose();
    _activityId.dispose();
    _title.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Issue Certificate')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _studentId,
                decoration: const InputDecoration(labelText: 'Student ID'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _activityId,
                decoration: const InputDecoration(labelText: 'Activity ID'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _title,
                decoration: const InputDecoration(labelText: 'Certificate Title'),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () async {
                  if (!_formKey.currentState!.validate()) return;
                  final bytes = await generateCertificatePdf(title: _title.text.trim(), studentId: _studentId.text.trim(), activityId: _activityId.text.trim());
                  final cert = Certificate(
                    id: 'cer_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(9999)}',
                    studentId: _studentId.text.trim(),
                    activityId: _activityId.text.trim(),
                    title: _title.text.trim(),
                    issueDate: DateTime.now(),
                    pdfBytes: bytes,
                  );
                  // Store certificate
                  // ignore: use_build_context_synchronously
                  context.read<DataService>().addCertificate(cert);
                  // ignore: use_build_context_synchronously
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Certificate issued (in-memory)')));
                },
                child: const Text('Issue'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
