import 'package:flutter/material.dart';

class MatchingScreen extends StatelessWidget {
  final double syncRate;
  final String description;

  const MatchingScreen({super.key, required this.syncRate, required this.description});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Destiny Matching', style: TextStyle(color: Color(0xFFFFD700))),
        backgroundColor: const Color(0xFF1A1A1A),
      ),
      body: Container(
        padding: const EdgeInsets.all(30),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF1A1A1A), Color(0xFF2D1B33)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Your Destiny Sync Rate",
              style: TextStyle(fontSize: 22, color: Colors.white70),
            ),
            const SizedBox(height: 30),
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 200,
                  height: 200,
                  child: CircularProgressIndicator(
                    value: syncRate / 100,
                    strokeWidth: 15,
                    backgroundColor: Colors.white12,
                    color: const Color(0xFFFFD700),
                  ),
                ),
                Text(
                  "${syncRate.toInt()}%",
                  style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Color(0xFFFFD700)),
                ),
              ],
            ),
            const SizedBox(height: 50),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: Colors.purple.withOpacity(0.3)),
              ),
              child: Text(
                description,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, height: 1.6, color: Colors.white),
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Sharing your destiny card...")),
                );
              },
              icon: const Icon(Icons.share),
              label: const Text("Share to Instagram Story"),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFFD700),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
