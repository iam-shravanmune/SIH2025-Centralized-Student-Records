import 'package:flutter/material.dart';

class AdminUserManagementPage extends StatelessWidget {
  const AdminUserManagementPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Management')),
      body: const Center(
        child: Text('Add/Remove users is out-of-scope for demo (no backend).'),
      ),
    );
  }
}
