import 'package:flutter/material.dart';

class FateReviewScreen extends StatelessWidget {
  const FateReviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Monthly Fate Review', style: TextStyle(color: Color(0xFFFFD700))),
        backgroundColor: const Color(0xFF121212),
      ),
      body: Container(
        decoration: const BoxDecoration(color: Color(0xFF121212)),
        child: ListView(
          padding: const EdgeInsets.all(25),
          children: [
            _buildSummaryHeader(),
            const SizedBox(height: 30),
            _buildSectionTitle("Accuracy Matrix"),
            _buildAccuracyChart(),
            const SizedBox(height: 30),
            _buildSectionTitle("Self-Learning Insights"),
            _buildInsightCard("Core Lesson", "당신의 사재(財)운은 비즈니스 미팅에서 가장 정밀하게 적중했습니다.", Icons.auto_awesome),
            _buildInsightCard("Refinement", "다음 달 분석부터는 금(金)의 기운을 15% 더 가중하여 계산합니다.", Icons.settings_backup_restore),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryHeader() {
    return Container(
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: Colors.white10),
      ),
      child: const Column(
        children: [
          Text("MARCH REVIEW", style: TextStyle(color: Color(0xFFFFD700), fontSize: 12, letterSpacing: 4)),
          SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatItem(label: "SYCH RATE", value: "82%"),
              _StatItem(label: "LOG DAYS", value: "28"),
              _StatItem(label: "GROWTH", value: "+15%"),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 15),
      child: Text(title, style: const TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildAccuracyChart() {
    return Container(
      height: 100,
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.02), borderRadius: BorderRadius.circular(15)),
      child: const Center(child: Text("Real-time Prediction vs Reality Curve", style: TextStyle(color: Colors.white24, fontSize: 10))),
    );
  }

  Widget _buildInsightCard(String title, String content, IconData icon) {
    return Card(
      color: Colors.white.withOpacity(0.05),
      margin: const EdgeInsets.only(bottom: 15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: const Color(0xFFFFD700), size: 20),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Color(0xFFFFD700), fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(content, style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.5)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
        const SizedBox(height: 5),
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
      ],
    );
  }
}
