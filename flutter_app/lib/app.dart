import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/user.dart';
import 'services/auth_service.dart';
import 'ui/login/role_login_page.dart';
import 'ui/student/student_dashboard.dart';
import 'ui/teacher/teacher_dashboard.dart';
import 'ui/admin/admin_dashboard.dart';

class HEIApp extends StatelessWidget {
  const HEIApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6B46FF)),
      useMaterial3: true,
    );

    return MaterialApp(
      title: 'HEI Activity Hub (Demo)',
      theme: theme,
      home: Consumer<AuthService>(
        builder: (context, auth, _) {
          final session = auth.currentUser;
          if (session == null) return const RoleLoginPage();
          switch (session.role) {
            case UserRole.student:
              return const StudentDashboard();
            case UserRole.teacher:
              return const TeacherDashboard();
            case UserRole.admin:
              return const AdminDashboard();
          }
        },
      ),
    );
  }
}
