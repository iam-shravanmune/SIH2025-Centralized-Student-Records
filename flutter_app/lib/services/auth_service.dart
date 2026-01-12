import 'dart:math';
import 'package:flutter/foundation.dart';
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  final Map<String, AppUser> _usersByEmail = {};
  AppUser? _current;

  AppUser? get currentUser => _current;

  Future<AppUser> register({
    required String email,
    required String password,
    required String name,
    required UserRole role,
  }) async {
    // Password is not stored in this demo; real apps must hash & store securely
    if (_usersByEmail.containsKey(email)) {
      throw Exception('User already exists');
    }
    final id = 'u_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(9999)}';
    final user = AppUser(id: id, email: email, name: name, role: role);
    _usersByEmail[email] = user;
    _current = user;
    notifyListeners();
    return user;
  }

  Future<AppUser> login({
    required String email,
    required String password,
    required UserRole role,
  }) async {
    final user = _usersByEmail[email];
    if (user == null) {
      // Auto-provision demo user on first login
      return register(email: email, password: password, name: email.split('@').first, role: role);
    }
    if (user.role != role) {
      throw Exception('Role mismatch for this account');
    }
    _current = user;
    notifyListeners();
    return user;
  }

  void logout() {
    _current = null;
    notifyListeners();
  }
}
