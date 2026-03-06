import 'package:flutter/material.dart';

class StoryScreen extends StatelessWidget {
  final String story;
  final String name;

  const StoryScreen({super.key, required this.story, required this.name});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('$name의 운명 스토리', style: const TextStyle(color: Color(0xFFFFD700))),
        backgroundColor: const Color(0xFF1A1A1A),
      ),
      body: Container(
        color: const Color(0xFF1A1A1A),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Center(
                child: Icon(Icons.auto_awesome, color: Color(0xFFFFD700), size: 40),
              ),
              const SizedBox(height: 30),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF2D1B33),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.5)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFFD700).withOpacity(0.1),
                      blurRadius: 10,
                      spreadRadius: 2,
                    )
                  ],
                ),
                child: Text(
                  story,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                    height: 1.8,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              Center(
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.home),
                  label: const Text("Go Home"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFD700),
                    foregroundColor: Colors.black,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
