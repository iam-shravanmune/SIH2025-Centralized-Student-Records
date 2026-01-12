import 'dart:typed_data';
import 'package:pdf/widgets.dart' as pw;

Future<List<int>> generateCertificatePdf({
  required String title,
  required String studentId,
  required String activityId,
}) async {
  final doc = pw.Document();
  doc.addPage(
    pw.Page(
      build: (context) => pw.Center(
        child: pw.Column(
          mainAxisSize: pw.MainAxisSize.min,
          children: [
            pw.Text(title, style: pw.TextStyle(fontSize: 28, fontWeight: pw.FontWeight.bold)),
            pw.SizedBox(height: 20),
            pw.Text('Awarded to: $studentId'),
            pw.Text('For activity: $activityId'),
            pw.SizedBox(height: 20),
            pw.Text('This is a demo certificate generated in-app.'),
          ],
        ),
      ),
    ),
  );
  final bytes = await doc.save();
  return Uint8List.fromList(bytes);
}
