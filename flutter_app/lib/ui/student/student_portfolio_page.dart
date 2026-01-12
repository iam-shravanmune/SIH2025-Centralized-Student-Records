import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/data_service.dart';

class StudentPortfolioPage extends StatelessWidget {
  const StudentPortfolioPage({super.key});

  @override
  Widget build(BuildContext context) {
    final userId = context.read<AuthService>().currentUser!.id;
    final data = context.watch<DataService>();
    final certs = data.certificatesFor(userId);

    return Scaffold(
      appBar: AppBar(title: const Text('Portfolio')),
      body: ListView.builder(
        itemCount: certs.length,
        itemBuilder: (context, i) {
          final c = certs[i];
          return Card(
            child: ListTile(
              leading: const Icon(Icons.picture_as_pdf),
              title: Text(c.title),
              subtitle: Text('Issued: ${c.issueDate.toLocal().toString().split(' ').first}'),
              onTap: () async {
                // Preview/share PDF
                // ignore: use_build_context_synchronously
                await showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: Text(c.title),
                    content: const Text('Certificate stored in-memory for this demo.'),
                    actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
