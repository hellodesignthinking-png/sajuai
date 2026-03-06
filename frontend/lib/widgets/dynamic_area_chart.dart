import 'package:flutter/material.dart';

class DynamicAreaChart extends StatelessWidget {
  final List<double> scores;
  final List<String> keywords;

  const DynamicAreaChart({super.key, required this.scores, required this.keywords});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 250,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("운세 흐름 (Dynamic Timeline)", style: TextStyle(color: Colors.white70, fontSize: 12)),
          const SizedBox(height: 20),
          Expanded(
            child: CustomPaint(
              painter: AreaChartPainter(scores: scores, keywords: keywords),
              child: Container(),
            ),
          ),
        ],
      ),
    );
  }
}

class AreaChartPainter extends CustomPainter {
  final List<double> scores;
  final List<String> keywords;
  AreaChartPainter({required this.scores, required this.keywords});

  @override
  void paint(Canvas canvas, Size size) {
    if (scores.isEmpty) return;

    final paintArea = Paint()
      ..style = PaintingStyle.fill
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          const Color(0xFFFFD700).withOpacity(0.4),
          const Color(0xFFFFD700).withOpacity(0.0),
        ],
      ).createShader(Rect.fromLTRB(0, 0, size.width, size.height));

    final paintLine = Paint()
      ..color = const Color(0xFFFFD700)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final path = Path();
    final stepX = size.width / (scores.length - 1);
    
    for (int i = 0; i < scores.length; i++) {
      final y = size.height - (scores[i] / 100 * size.height);
      final x = i * stepX;
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    final fillPath = Path.from(path);
    fillPath.lineTo(size.width, size.height);
    fillPath.lineTo(0, size.height);
    fillPath.close();

    canvas.drawPath(fillPath, paintArea);
    canvas.drawPath(path, paintLine);

    // Dynamic Markers and Keywords
    for (int i = 0; i < scores.length; i++) {
       final x = i * stepX;
       final y = size.height - (scores[i] / 100 * size.height);
       
       if (scores[i] > 80) {
         canvas.drawCircle(Offset(x, y), 5, Paint()..color = const Color(0xFFFFD700));
       }
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
