import 'package:flutter/material.dart';
import 'dart:math' as math;

class DigitalTwinWidget extends StatefulWidget {
  final Map<String, dynamic> faceData;
  const DigitalTwinWidget({super.key, required this.faceData});

  @override
  State<DigitalTwinWidget> createState() => _DigitalTwinWidgetState();
}

class _DigitalTwinWidgetState extends State<DigitalTwinWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        duration: const Duration(seconds: 10), vsync: this)..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          height: 250,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.2)),
            gradient: RadialGradient(
              colors: [const Color(0xFF2D1B33).withOpacity(0.5), Colors.black],
            ),
          ),
          child: CustomPaint(
            painter: Twin3DPainter(
              rotation: _controller.value * 2 * math.pi,
              faceData: widget.faceData,
            ),
            child: const Center(
              child: Text(
                "3D DIGITAL TWIN SCAN",
                style: TextStyle(color: Colors.white24, fontSize: 10, letterSpacing: 2),
              ),
            ),
          ),
        );
      },
    );
  }
}

class Twin3DPainter extends CustomPainter {
  final double rotation;
  final Map<String, dynamic> faceData;
  Twin3DPainter({required this.rotation, required this.faceData});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFFFD700).withOpacity(0.6)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    final cx = size.width / 2;
    final cy = size.height / 2;

    // Simulate 3D rotation with simple projection
    final tilt = math.cos(rotation) * 20;
    
    // Draw wireframe head
    for (int i = 0; i < 8; i++) {
      final angle = (i / 8) * 2 * math.pi;
      final x = cx + math.sin(rotation + angle) * 60;
      final y = cy + math.cos(rotation + angle) * 20;
      canvas.drawCircle(Offset(x, y), 2, paint..style = PaintingStyle.fill);
    }

    // Sanjong Indicators (Horizontal glowing lines)
    if (faceData.containsKey('sanjong')) {
      final ratios = faceData['sanjong'];
      _drawZoneLine(canvas, cx, cy - 80, "Forehead", paint..color = Colors.purpleAccent);
      _drawZoneLine(canvas, cx, cy, "Mid-face", paint..color = const Color(0xFFFFD700));
      _drawZoneLine(canvas, cx, cy + 80, "Chin", paint..color = Colors.blueAccent);
    }
  }

  void _drawZoneLine(Canvas canvas, double cx, double y, String label, Paint paint) {
    canvas.drawLine(Offset(cx - 80, y), Offset(cx + 80, y), paint);
    final textPainter = TextPainter(
      text: TextSpan(text: label, style: TextStyle(color: paint.color, fontSize: 8)),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainter.paint(canvas, Offset(cx + 85, y - 5));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
