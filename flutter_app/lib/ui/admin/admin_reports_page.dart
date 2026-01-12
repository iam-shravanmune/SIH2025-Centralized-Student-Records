import 'package:flutter/material.dart';

class AdminReportsPage extends StatelessWidget {
  const AdminReportsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Audit Reports')),
      body: const Center(
        child: Text('Report generation would run in backend; omitted in demo.'),
      ),
    );
  }
}
