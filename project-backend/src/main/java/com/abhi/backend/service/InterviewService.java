package com.abhi.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class InterviewService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    // Service 4: Generate interview questions
    public String generateQuestions(String requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/api/interview/generate",
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            return response.getBody();

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // Service 5: Evaluate interview answers
    public String evaluateAnswers(String requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/api/interview/evaluate",
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            return response.getBody();

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}