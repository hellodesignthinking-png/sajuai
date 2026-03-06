import 'package:flutter/material.dart';
import 'screens/ar_scanner_screen.dart';
import 'screens/story_screen.dart';
import 'widgets/fortune_chart.dart';
import 'widgets/dynamic_area_chart.dart';
import 'screens/matching_screen.dart';
import 'widgets/digital_twin.dart';
import 'screens/inquiry_screen.dart';
import 'screens/crm_dashboard.dart';
import 'widgets/fate_sbt_card.dart';
import 'screens/fate_review_screen.dart';
import 'screens/privacy_screen.dart';
import 'screens/team_oracle_screen.dart';
import 'screens/dimension_gate_screen.dart';

void main() {
  runApp(const FateSyncApp());
}

class FateSyncApp extends StatelessWidget {
  const FateSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fate-Sync',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFFFFD700), // Gold
        hintColor: const Color(0调800080), // Purple
        scaffoldBackgroundColor: const Color(0调1A1A1A),
        textTheme: const TextTheme(
          displayLarge: TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold),
          bodyLarge: TextStyle(color: Colors.white70),
        ),
      ),
      home: const SajuInputScreen(),
    );
  }
}

class SajuInputScreen extends StatefulWidget {
  const SajuInputScreen({super.key});

  @override
  State<SajuInputScreen> createState() => _SajuInputScreenState();
}

class _SajuInputScreenState extends State<SajuInputScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  bool _isLunar = false;
  String? _selectedMBTI;

  final List<String> _mbtiList = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fate-Sync Analysis', style: TextStyle(color: Color(0xFFFFD700))),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1A1A1A), Color(0xFF2D1B33)],
          ),
        ),
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              const Text(
                'Enter Your Details',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFFFFD700)),
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Name',
                  labelStyle: const TextStyle(color: Colors.white70),
                  enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.purple.withOpacity(0.5))),
                  focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFFFD700))),
                ),
                validator: (value) => value!.isEmpty ? 'Please enter your name' : null,
              ),
              const SizedBox(height: 20),
              // Date Picker
              ListTile(
                title: Text(_selectedDate == null ? 'Select Birth Date' : 'Birth Date: ${_selectedDate!.toLocal()}'.split(' ')[0]),
                trailing: const Icon(Icons.calendar_today, color: Color(0xFFFFD700)),
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime(1995),
                    firstDate: DateTime(1900),
                    lastDate: DateTime.now(),
                  );
                  if (date != null) setState(() => _selectedDate = date);
                },
              ),
              // Time Picker
              ListTile(
                title: Text(_selectedTime == null ? 'Select Birth Time (Optional)' : 'Birth Time: ${_selectedTime!.format(context)}'),
                trailing: const Icon(Icons.access_time, color: Color(0xFFFFD700)),
                onTap: () async {
                  final time = await showTimePicker(
                    context: context,
                    initialTime: const TimeOfDay(hour: 0, minute: 0),
                  );
                  if (time != null) setState(() => _selectedTime = time);
                },
              ),
              SwitchListTile(
                title: const Text('Lunar Calendar'),
                subtitle: const Text('Check if the birthday is based on the lunar calendar'),
                value: _isLunar,
                activeColor: const Color(0xFFFFD700),
                onChanged: (val) => setState(() => _isLunar = val),
              ),
              const SizedBox(height: 20),
              // MBTI Dropdown
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'MBTI'),
                value: _selectedMBTI,
                items: _mbtiList.map((mbti) => DropdownMenuItem(value: mbti, child: Text(mbti))).toList(),
                onChanged: (val) => setState(() => _selectedMBTI = val),
              ),
              const SizedBox(height: 20),
              // Image Analysis Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFFFD700),
                        side: const BorderSide(color: Color(0xFFFFD700)),
                      ),
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ARScannerScreen())),
                      icon: const Icon(Icons.face),
                      label: const Text("Face Scan"),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF800080),
                        side: const BorderSide(color: Color(0xFF800080)),
                      ),
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ARScannerScreen())),
                      icon: const Icon(Icons.front_hand),
                      label: const Text("Palm Scan"),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFD700),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                ),
                onPressed: () {
                  if (_formKey.currentState!.validate() && _selectedDate != null) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const DashboardScreen(
                          name: "User",
                          mbti: "ENFP",
                          elements: {"목": 25, "화": 40, "토": 10, "금": 10, "수": 15},
                          synergyReport: "Your fire element fuels your ENFP passion! You are a brilliant flame that inspires others with endless creativity.",
                        ),
                      ),
                    );
                  }
                },
                child: const Text('Start Analysis', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  final String name;
  final String mbti;
  final Map<String, double> elements;
  final String synergyReport;

  const DashboardScreen({
    super.key,
    required this.name,
    required this.mbti,
    required this.elements,
    required this.synergyReport,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('$name\'s Destiny Dashboard', style: const TextStyle(color: Color(0xFFFFD700))),
        backgroundColor: const Color(0xFF1A1A1A),
      ),
      body: Container(
        color: const Color(0xFF1A1A1A),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildSectionTitle("Saju Elements Distribution (오행)"),
            const SizedBox(height: 20),
            Center(
              child: SizedBox(
                height: 200,
                width: 200,
                child: CustomPaint(
                  painter: PieChartPainter(elements: elements),
                ),
              ),
            ),
            const SizedBox(height: 20),
            _buildLegend(),
            _buildSectionTitle("Real-time Eternal Sync"),
            const SizedBox(height: 15),
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(15)),
                    child: const Column(
                      children: [
                        Text("Vitality (Bio-Data)", style: TextStyle(color: Colors.white54, fontSize: 10)),
                        SizedBox(height: 10),
                        LinearProgressIndicator(value: 0.85, backgroundColor: Colors.white10, color: Colors.greenAccent),
                        SizedBox(height: 5),
                        Text("85% - Spirit is High", style: TextStyle(color: Colors.greenAccent, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                _buildVoiceOracleButton(),
              ],
            ),
            const SizedBox(height: 30),
            const FateSBTCard(name: "User", gyeokguk: "Peak Structure (왕신격)", syncScore: 88.5),
            const SizedBox(height: 30),
            _buildSectionTitle("AI Digital Twin Analysis"),
            const SizedBox(height: 10),
            const DigitalTwinWidget(faceData: {'sanjong': true}),
            const Divider(color: Colors.white24, height: 40),
            _buildSectionTitle("10-Year Fortune Trend (대운 흐름)"),
            const SizedBox(height: 20),
            const DynamicAreaChart(
              scores: [60, 45, 80, 75, 90, 65, 55, 70, 85, 95],
              keywords: ["Start", "Chill", "Peak", "Steady", "Master", "Move", "Rest", "Rise", "Success", "Peak"],
            ),
            const SizedBox(height: 10),
            const Center(child: Text("Higher points indicate peaks in your potential.", style: TextStyle(fontSize: 12, color: Colors.white54))),
            const Divider(color: Colors.white24, height: 40),
            _buildSectionTitle("Destiny Matching"),
            const SizedBox(height: 10),
            ListTile(
              tileColor: Colors.grey[900],
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              leading: const Icon(Icons.favorite, color: Colors.red),
              title: const Text("Find Your Perfect Match"),
              subtitle: const Text("Compare your fate with friends"),
              trailing: const Icon(Icons.chevron_right, color: Color(0xFFFFD700)),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MatchingScreen(
                      syncRate: 88,
                      description: "Two souls meet with 88% synchronicity. Your elements complement each other perfectly.",
                    ),
                  ),
                );
              },
            ),
            ListTile(
              tileColor: Colors.grey[900],
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              leading: const Icon(Icons.people, color: Colors.blue),
              title: const Text("Fate-CRM: FocusDashboard"),
              subtitle: const Text("Strategic relationship analysis"),
              trailing: const Icon(Icons.chevron_right, color: Color(0xFFFFD700)),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => const CRMDashboardScreen()));
              },
            ),
            ListTile(
              tileColor: Colors.grey[900],
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              leading: const Icon(Icons.history_edu, color: Color(0xFFFFD700)),
              title: const Text("Monthly Fate Review"),
              subtitle: const Text("Personalized accuracy retrospective"),
              trailing: const Icon(Icons.chevron_right, color: Color(0xFFFFD700)),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => const FateReviewScreen()));
              },
            ),
            const Divider(color: Colors.white24, height: 40),
            _buildSectionTitle("Physiognomy & Palm Analysis"),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: _buildImageCard("Face Analysis", "Landmarks: 1.2 ratio", Icons.face)),
                const SizedBox(width: 10),
                Expanded(child: _buildImageCard("Palm Analysis", "Life Line: Strong", Icons.front_hand)),
              ],
            ),
            const Divider(color: Colors.white24, height: 40),
            _buildSectionTitle("Synergy Report ($mbti + Fire)"),
            const SizedBox(height: 10),
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => StoryScreen(
                      name: name,
                      story: "하늘의 기운이 모여 $name님의 운명을 비추고 있습니다...",
                    ),
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF2D1B33),
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: const Color(0xFFFFD700), width: 1),
                ),
                child: Column(
                  children: [
                    Text(
                      synergyReport,
                      style: const TextStyle(fontSize: 16, color: Colors.white, height: 1.5),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      "Read Full Personal Story →",
                      style: TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVoiceOracleButton() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: const Color(0xFFFFD700).withOpacity(0.1), borderRadius: BorderRadius.circular(15), border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.3))),
      child: const Column(
        children: [
          Icon(Icons.mic, color: Color(0xFFFFD700)),
          SizedBox(height: 5),
          Text("Voice Oracle", style: TextStyle(color: Color(0xFFFFD700), fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFFFFD700)),
    );
  }

  Widget _buildImageCard(String title, String subtitle, IconData icon) {
    return Container(
      height: 150,
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.purple.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 40, color: const Color(0xFFFFD700)),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.white54)),
        ],
      ),
    );
  }

  Widget _buildLegend() {
    return Wrap(
      spacing: 15,
      alignment: WrapAlignment.center,
      children: elements.keys.map((key) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 12, height: 12, color: _getElementColor(key)),
            const SizedBox(width: 5),
            Text(key, style: const TextStyle(color: Colors.white70)),
          ],
        );
      }).toList(),
    );
  }
}

class PieChartPainter extends CustomPainter {
  final Map<String, double> elements;
  PieChartPainter({required this.elements});

  @override
  void paint(Canvas canvas, Size size) {
    double total = elements.values.fold(0, (sum, item) => sum + item);
    double startAngle = -0.5 * 3.14159;

    elements.forEach((key, value) {
      final sweepAngle = (value / total) * 2 * 3.14159;
      final paint = Paint()
        ..color = _getElementColor(key)
        ..style = PaintingStyle.fill;

      canvas.drawArc(
        Rect.fromLTWH(0, 0, size.width, size.height),
        startAngle,
        sweepAngle,
        true,
        paint,
      );
      startAngle += sweepAngle;
    });

    // Inner circle for donut chart look
    final centerPaint = Paint()..color = const Color(0xFF1A1A1A);
    canvas.drawCircle(Offset(size.width / 2, size.height / 2), size.width / 4, centerPaint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

Color _getElementColor(String element) {
  switch (element) {
    case "목": return Colors.green;
    case "화": return Colors.red;
    case "토": return Colors.amber;
    case "금": return Colors.grey;
    case "수": return Colors.blue;
    default: return Colors.white;
  }
}
