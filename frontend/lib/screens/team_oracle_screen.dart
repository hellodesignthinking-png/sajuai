import 'package:flutter/material.dart';

class TeamOracleScreen extends StatelessWidget {
  const TeamOracleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Team Oracle: B2B Synergy', style: TextStyle(color: Color(0xFFFFD700))),
        backgroundColor: const Color(0xFF121212),
      ),
      body: Container(
        color: const Color(0xFF121212),
        child: ListView(
          padding: const EdgeInsets.all(25),
          children: [
            _buildHarmonyScore(),
            const SizedBox(height: 30),
            _buildSectionTitle("Team Composition"),
            _buildElementRadar(),
            const SizedBox(height: 30),
            _buildSectionTitle("Strategic Pairings"),
            _buildPairingCard("The Accelerators", "User A (Fire) + User B (Wood)", "95% Synergy"),
            _buildPairingCard("The Stabilizers", "User C (Earth) + User D (Metal)", "88% Synergy"),
          ],
        ),
      ),
    );
  }

  Widget _buildHarmonyScore() {
    return Container(
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1E1E1E), Color(0xFF004D40)]),
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: Colors.tealAccent.withOpacity(0.3)),
      ),
      child: const Column(
        children: [
          Text("TEAM HARMONY SCORE", style: TextStyle(color: Colors.tealAccent, fontSize: 12, letterSpacing: 4)),
          SizedBox(height: 20),
          Text("92", style: TextStyle(color: Colors.white, fontSize: 60, fontWeight: FontWeight.bold)),
          Text("Excellent Synergy detected in Project Phase 1.", style: TextStyle(color: Colors.white70, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(color: Color(0xFFFFD700), fontSize: 16));
  }

  Widget _buildElementRadar() {
    return Container(
      height: 150,
      margin: const EdgeInsets.only(top: 15),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(15)),
      child: const Center(child: Text("Team Element Balance Chart", style: TextStyle(color: Colors.white24))),
    );
  }

  Widget _buildPairingCard(String title, String members, String score) {
    return Card(
      color: Colors.white.withOpacity(0.02),
      margin: const EdgeInsets.only(top: 10),
      child: ListTile(
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text(members, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        trailing: Text(score, style: const TextStyle(color: Color(0xFFFFD700))),
      ),
    );
  }
}
