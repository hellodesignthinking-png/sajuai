import 'package:flutter/material.dart';

class FateInquiryScreen extends StatefulWidget {
  final List<String> questions;
  const FateInquiryScreen({super.key, required this.questions});

  @override
  State<FateInquiryScreen> createState() => _FateInquiryScreenState();
}

class _FateInquiryScreenState extends State<FateInquiryScreen> {
  int _currentIndex = 0;
  final Map<int, String> _answers = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Container(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        decoration: BoxDecoration(
          image: DecorationImage(
            image: const NetworkImage("https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1000&q=80"),
            fit: BoxFit.cover,
            colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.8), BlendMode.darken),
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "운명의 문답 (The Inquiry)",
                style: TextStyle(color: Color(0xFFFFD700), fontSize: 14, letterSpacing: 4),
              ),
              const SizedBox(height: 30),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 500),
                child: Text(
                  widget.questions[_currentIndex],
                  key: ValueKey(_currentIndex),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w300, height: 1.5),
                ),
              ),
              const SizedBox(height: 50),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildOption("그렇습니다", true),
                  _buildOption("아니오", false),
                ],
              ),
              const SizedBox(height: 30),
              Text(
                "질문 ${_currentIndex + 1} / ${widget.questions.length}",
                style: const TextStyle(color: Colors.white24, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOption(String text, bool value) {
    return GestureDetector(
      onTap: () {
        if (_currentIndex < widget.questions.length - 1) {
          setState(() {
            _currentIndex++;
          });
        } else {
          Navigator.pop(context, "confirmed");
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.5)),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(text, style: const TextStyle(color: Color(0xFFFFD700))),
      ),
    );
  }
}
