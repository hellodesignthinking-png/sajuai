import 'package:flutter/material.dart';
import 'dart:math' as math;

class DimensionGateScreen extends StatefulWidget {
  const DimensionGateScreen({super.key});

  @override
  State<DimensionGateScreen> createState() => _DimensionGateScreenState();
}

class _DimensionGateScreenState extends State<DimensionGateScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isMorphed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 5),
      vsync: this,
    )..repeat();

    // Trigger morphing after 3 seconds of scanning
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isMorphed = true;
        });
      }
    });

    // Auto-exit to result after 6s
    Future.delayed(const Duration(seconds: 6), () {
      if (mounted) Navigator.pop(context);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        alignment: Alignment.center,
        children: [
          // Background "Rift" effect
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return CustomPaint(
                painter: RiftPainter(progress: _controller.value),
                size: Size.infinite,
              );
            },
          ),
          
          // Face Morphing Area
          Center(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 1500),
              child: _isMorphed 
                ? _buildMangaFace() 
                : _buildRealFaceScan(),
            ),
          ),

          // Scanning Overlay
          const Positioned(
            bottom: 80,
            child: Column(
              children: [
                Text("OPENING DIMENSION GATE...", style: TextStyle(color: Color(0xFFFFD700), fontSize: 12, letterSpacing: 4)),
                SizedBox(height: 10),
                Text("Synchronizing Destiny Vectors...", style: TextStyle(color: Colors.white24, fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRealFaceScan() {
    return Container(
      key: const ValueKey("real"),
      width: 250,
      height: 250,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.5)),
      ),
      child: const Icon(Icons.face_retouching_natural, color: Color(0xFFFFD700), size: 100),
    );
  }

  Widget _buildMangaFace() {
    return Container(
      key: const ValueKey("manga"),
      width: 280,
      height: 280,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.tealAccent, width: 3),
        boxShadow: [BoxShadow(color: Colors.tealAccent.withOpacity(0.3), blurRadius: 30)],
        image: const DecorationImage(
          image: NetworkImage("https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80"),
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}

class RiftPainter extends CustomPainter {
  final double progress;
  RiftPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFFFD700).withOpacity(0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final center = Offset(size.width / 2, size.height / 2);
    
    for (int i = 0; i < 8; i++) {
        final radius = (progress * 500) % 500 + (i * 50);
        canvas.drawCircle(center, radius, paint);
        
        // Rotating "Data Fragments"
        final angle = progress * 2 * math.pi + (i * math.pi / 4);
        final fragmentX = center.dx + radius * math.cos(angle);
        final fragmentY = center.dy + radius * math.sin(angle);
        
        canvas.drawRect(Rect.fromCenter(center: Offset(fragmentX, fragmentY), width: 10, height: 10), paint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
