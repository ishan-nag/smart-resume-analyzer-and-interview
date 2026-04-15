package com.abhi.backend.controller;

import com.abhi.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    // Endpoint 1: Get all roles
    @GetMapping("/roles")
    public ResponseEntity<String> getRoles() {
        String roles = resumeService.getRoles();
        return ResponseEntity.ok(roles);
    }

    // Endpoint 2: Upload resume PDF
    @PostMapping("/upload")
    public ResponseEntity<String> uploadResume(
            @RequestPart("file") MultipartFile file) {
        String parsedResume = resumeService.uploadResume(file);
        return ResponseEntity.ok(parsedResume);
    }

    // Endpoint 3: Analyze resume
    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeResume(
            @RequestBody String requestBody) {
        String result = resumeService.analyzeResume(requestBody);
        return ResponseEntity.ok(result);
    }
}