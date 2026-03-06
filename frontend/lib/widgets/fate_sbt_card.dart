import 'package:flutter/material.dart';

class FateSBTCard extends StatelessWidget {
  final String name;
  final String gyeokguk;
  final double syncScore;

  const FateSBTCard({
    super.key,
    required this.name,
    required this.gyeokguk,
    required this.syncScore,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(25),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(25),
        gradient: const LinearGradient(
          colors: [Color(0xFF1E1E1E), Color(0xFF2D1B33)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.5), width: 2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFFD700).withOpacity(0.1),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("SOULBOUND FATE ID", style: TextStyle(color: Color(0xFFFFD700), fontSize: 10, letterSpacing: 2)),
              Icon(Icons.verified, color: Colors.blueAccent[100], size: 18),
            ],
          ),
          const SizedBox(height: 30),
          Center(
            child: Container(
              height: 100,
              width: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white10),
                image: const DecorationImage(
                  image: NetworkImage("https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&w=200&q=80"),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: Text(name, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 10),
          Center(
            child: Text(gyeokguk, style: const TextStyle(color: Colors.white54, fontSize: 14)),
          ),
          const Divider(color: Colors.white10, height: 40),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildMetric("SYNC RATE", "${syncScore.toInt()}%"),
              _buildMetric("STATUS", "MINTED"),
              _buildMetric("NETWORK", "POLYGON"),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white24, fontSize: 8)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
