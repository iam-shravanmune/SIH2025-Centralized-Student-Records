import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import 'admin_analytics_page.dart';
import 'admin_user_management_page.dart';
import 'admin_reports_page.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().currentUser!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [IconButton(onPressed: () => context.read<AuthService>().logout(), icon: const Icon(Icons.logout))],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _Tile(title: 'Analytics', icon: Icons.insights, page: AdminAnalyticsPage()),
          _Tile(title: 'User Management', icon: Icons.group, page: AdminUserManagementPage()),
          _Tile(title: 'Audit Reports', icon: Icons.assignment, page: AdminReportsPage()),
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
      height: 100,
      child: Card(
        child: ListTile(
          leading: Icon(icon),
          title: Text(title),
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => page)),
        ),
      ),
    );
  }
}
