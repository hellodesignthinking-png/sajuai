import 'package:flutter/material.dart';

class CRMDashboardScreen extends StatelessWidget {
  const CRMDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fate-CRM: FocusDashboard', style: TextStyle(color: Color(0xFFFFD700))),
        backgroundColor: const Color(0xFF1A1A1A),
      ),
      body: Container(
        decoration: const BoxDecoration(color: Color(0xFF121212)),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildFocusCard(),
            const SizedBox(height: 30),
            _buildSectionTitle("Strategic Connections"),
            _buildContactTile("Director Kim", "Business Synergy: 92%", "Heavenly Supporter", Colors.amber),
            _buildContactTile("Lead Developer Lee", "Team Synergy: 75%", "Stable Support", Colors.blue),
            _buildContactTile("Partner Park", "Careful Management: 45%", "Conflict Potential", Colors.redAccent),
          ],
        ),
      ),
    );
  }

  Widget _buildFocusCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF2D1B33), Color(0xFF1A1A1A)]),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.stars, color: Color(0xFFFFD700)),
              SizedBox(width: 10),
              Text("이달의 집중 관리 (Monthly Focus)", style: TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 15),
          const Text("Director Kim", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 5),
          const Text("Why: Highest synergy with your current 'Fire' yong-sin cycle.", style: TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFFD700), foregroundColor: Colors.black),
            child: const Text("Schedule Strategy Meeting"),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 15),
      child: Text(title, style: const TextStyle(color: Color(0xFFFFD700), fontSize: 18, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildContactTile(String name, String percentage, String label, Color color) {
    return Card(
      color: Colors.white.withOpacity(0.05),
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: color.withOpacity(0.2), child: Icon(Icons.person, color: color)),
        title: Text(name, style: const TextStyle(color: Colors.white)),
        subtitle: Text(percentage, style: const TextStyle(color: Colors.white54)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
          child: Text(label, style: TextStyle(color: color, fontSize: 10)),
        ),
      ),
    );
  }
}
