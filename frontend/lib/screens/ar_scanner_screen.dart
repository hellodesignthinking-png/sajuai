import 'package:flutter/material.dart';
import 'dart:math' as math;

class ARScannerScreen extends StatefulWidget {
  const ARScannerScreen({super.key});

  @override
  State<ARScannerScreen> createState() => _ARScannerScreenState();
}

class _ARScannerScreenState extends State<ARScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  bool _isAnalyzing = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background "Camera" Placeholder
          Container(
            color: Colors.black,
            child: const Center(
              child: Icon(Icons.camera_alt, color: Colors.white24, size: 100),
            ),
          ),
          
          // Neon Overlay Painter
          Positioned.fill(
            child: CustomPaint(
              painter: NeonLandmarkPainter(
                progress: _animController.value,
                isAnalyzing: _isAnalyzing,
              ),
            ),
          ),

          // Scanning UI Elements
          Positioned(
            top: 50,
            left: 20,
            child: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
          ),

          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Column(
              children: [
                if (_isAnalyzing)
                  const Text(
                    "Analyzing Divine Patterns...",
                    style: TextStyle(
                      color: Color(0xFFFFD700),
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () {
                    setState(() => _isAnalyzing = !_isAnalyzing);
                    if (_isAnalyzing) {
                      Future.delayed(const Duration(seconds: 3), () {
                        if (mounted) {
                          Navigator.pop(context, true); // Return success
                        }
                      });
                    }
                  },
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFFFD700), width: 4),
                      color: _isAnalyzing ? Colors.red.withOpacity(0.5) : Colors.transparent,
                    ),
                    child: Center(
                      child: Container(
                        width: 60,
                        height: 60,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFFFFD700),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Rotating Bagua Pattern (Loading)
          if (_isAnalyzing)
            Center(
              child: AnimatedBuilder(
                animation: _animController,
                builder: (context, child) {
                  return Transform.rotate(
                    angle: _animController.value * 2 * math.pi,
                    child: Opacity(
                      opacity: 0.3,
                      child: Image.network(
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bagua-Map.svg/512px-Bagua-Map.svg.png",
                        width: 200,
                        color: const Color(0xFFFFD700),
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}

class NeonLandmarkPainter extends CustomPainter {
  final double progress;
  final bool isAnalyzing;

  NeonLandmarkPainter({required this.progress, required this.isAnalyzing});

  @override
  void paint(Canvas canvas, Size size) {
    final paintGold = Paint()
      ..color = const Color(0xFFFFD700)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..maskFilter = const MaskFilter.blur(BlurStyle.outer, 5);

    final paintPurple = Paint()
      ..color = const Color(0xFF800080)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..maskFilter = const MaskFilter.blur(BlurStyle.outer, 3);

    final centerX = size.width / 2;
    final centerY = size.height / 2;

    // Draw Mock Face Landmarks
    if (!isAnalyzing) {
      _drawMockFace(canvas, centerX, centerY, paintGold);
    } else {
      // Animated "Scanning" lines
      final scanY = (progress * size.height);
      canvas.drawLine(
        Offset(0, scanY),
        Offset(size.width, scanY),
        paintGold..strokeWidth = 3,
      );
      
      // Add multiple flickering points
      final random = math.Random(42);
      for(int i=0; i<20; i++) {
        final pos = Offset(random.nextDouble() * size.width, random.nextDouble() * size.height);
        canvas.drawCircle(pos, 2, paintPurple);
      }
    }
  }

  void _drawMockFace(Canvas canvas, double cx, double cy, Paint paint) {
    // 1. Precision Face Contour with Bezier
    final contourPath = Path();
    contourPath.moveTo(cx - 110, cy);
    contourPath.quadraticBezierTo(cx - 110, cy - 150, cx, cy - 150);
    contourPath.quadraticBezierTo(cx + 110, cy - 150, cx + 110, cy);
    contourPath.quadraticBezierTo(cx + 110, cy + 150, cx, cy + 150);
    contourPath.quadraticBezierTo(cx - 110, cy + 150, cx - 110, cy);
    canvas.drawPath(contourPath, paint);

    // 2. Curvy Eye Fitting
    _drawBezierEye(canvas, cx - 50, cy - 30, paint);
    _drawBezierEye(canvas, cx + 50, cy - 30, paint);

    // 3. Nose and Lip San (산을 따라가는 선)
    final nosePath = Path();
    nosePath.moveTo(cx, cy - 20);
    nosePath.lineTo(cx, cy + 40);
    nosePath.quadraticBezierTo(cx - 25, cy + 50, cx - 15, cy + 60);
    nosePath.quadraticBezierTo(cx, cy + 55, cx + 15, cy + 60);
    canvas.drawPath(nosePath, paint);

    // Lip Fit
    final lipPath = Path();
    lipPath.moveTo(cx - 30, cy + 85);
    lipPath.quadraticBezierTo(cx, cy + 70, cx + 30, cy + 85); // Lip mountain
    lipPath.quadraticBezierTo(cx, cy + 100, cx - 30, cy + 85);
    canvas.drawPath(lipPath, paint);
  }

  void _drawBezierEye(Canvas canvas, double ex, double ey, Paint paint) {
    final eyePath = Path();
    eyePath.moveTo(ex - 20, ey);
    eyePath.quadraticBezierTo(ex, ey - 15, ex + 20, ey);
    eyePath.quadraticBezierTo(ex, ey + 15, ex - 20, ey);
    canvas.drawPath(eyePath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
