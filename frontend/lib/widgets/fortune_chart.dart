import 'package:flutter/material.dart';

class FortuneChart extends StatelessWidget {
  final List<double> scores;

  const FortuneChart({super.key, required this.scores});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF2D1B33),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.3)),
      ),
      child: CustomPaint(
        painter: LineChartPainter(scores: scores),
      ),
    );
  }
}

class LineChartPainter extends CustomPainter {
  final List<double> scores;
  LineChartPainter({required this.scores});

  @override
  void paint(Canvas canvas, Size size) {
    if (scores.isEmpty) return;

    final paintLine = Paint()
      ..color = const Color(0xFFFFD700)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final paintPoint = Paint()
      ..color = const Color(0xFFFFD700)
      ..style = PaintingStyle.fill;

    final path = Path();
    final stepX = size.width / (scores.length - 1);
    
    for (int i = 0; i < scores.length; i++) {
      // Scale score (0-100) to height
      final y = size.height - (scores[i] / 100 * size.height);
      final x = i * stepX;
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
      canvas.drawCircle(Offset(x, y), 4, paintPoint);
    }

    // Add shadow line
    canvas.drawPath(path, paintLine..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3));
    canvas.drawPath(path, paintLine..maskFilter = null);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
