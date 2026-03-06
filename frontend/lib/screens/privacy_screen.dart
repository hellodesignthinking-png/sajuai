import 'package:flutter/material.dart';

class PrivacyDashboardScreen extends StatelessWidget {
  const PrivacyDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy & Security', style: TextStyle(color: Color(0xFFFFD700))),
        backgroundColor: const Color(0xFF1A1A1A),
      ),
      body: Container(
        color: const Color(0xFF121212),
        child: ListView(
          padding: const EdgeInsets.all(25),
          children: [
            _buildSecurityHeader(),
            const SizedBox(height: 30),
            _buildSettingTile(
              "Zero-Knowledge Mode",
              "Original images are destroyed immediately after vector extraction.",
              Icons.shield,
              true,
            ),
            _buildSettingTile(
              "Encrypted Cloud Sync",
              "Your destiny vectors are encrypted with AES-256.",
              Icons.lock,
              true,
            ),
            _buildSettingTile(
              "Third-party Data Sharing",
              "We never share your raw biometric data with anyone.",
              Icons.group_off,
              false,
            ),
            const SizedBox(height: 50),
            ElevatedButton(
              onPressed: () {
                _showDeleteConfirmation(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent.withOpacity(0.1),
                foregroundColor: Colors.redAccent,
                side: const BorderSide(color: Colors.redAccent),
              ),
              child: const Text("Permanently Delete My Destiny Data"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecurityHeader() {
    return Container(
      padding: const EdgeInsets.all(25),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.greenAccent.withOpacity(0.3)),
      ),
      child: const Column(
        children: [
          Icon(Icons.verified_user, color: Colors.greenAccent, size: 40),
          SizedBox(height: 15),
          Text("YOU ARE SECURE", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          SizedBox(height: 5),
          Text("Fate-Sync protects your biometric identity with bank-grade security.", textAlign: TextAlign.center, style: TextStyle(color: Colors.white54, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildSettingTile(String title, String subtitle, IconData icon, bool enabled) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFFFFD700)),
      title: Text(title, style: const TextStyle(color: Colors.white)),
      subtitle: Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11)),
      trailing: Switch(value: enabled, onChanged: (v) {}, activeColor: const Color(0xFFFFD700)),
    );
  }

  void _showDeleteConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        title: const Text("Are you sure?", style: TextStyle(color: Colors.white)),
        content: const Text("This will permanently erase all calculated destiny vectors and history.", style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("CANCEL")),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("DELETE", style: TextStyle(color: Colors.redAccent))),
        ],
      ),
    );
  }
}
