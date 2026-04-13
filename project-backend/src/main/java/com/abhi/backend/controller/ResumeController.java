package com.abhi.backend.controller;

import com.abhi.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeResume(
            @RequestPart("resume") MultipartFile resume,
            @RequestPart("jobRole") String jobRole) {

        String result = resumeService.analyzeResume(resume, jobRole);
        return ResponseEntity.ok(result);
    }
}