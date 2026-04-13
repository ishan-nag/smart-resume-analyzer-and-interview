package com.abhi.backend.controller;

import com.abhi.backend.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    // Endpoint 4: Generate interview questions
    @PostMapping("/generate")
    public ResponseEntity<String> generateQuestions(
            @RequestBody String requestBody) {
        String result = interviewService.generateQuestions(requestBody);
        return ResponseEntity.ok(result);
    }

    // Endpoint 5: Evaluate interview answers
    @PostMapping("/evaluate")
    public ResponseEntity<String> evaluateAnswers(
            @RequestBody String requestBody) {
        String result = interviewService.evaluateAnswers(requestBody);
        return ResponseEntity.ok(result);
    }
}