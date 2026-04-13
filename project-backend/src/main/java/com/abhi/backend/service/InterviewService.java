package com.abhi.backend.service;

import com.abhi.backend.exception.AiServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
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

        } catch (ResourceAccessException e) {
            throw new AiServiceException("AI service is currently unavailable!", 503);
        } catch (HttpClientErrorException e) {
            throw new AiServiceException("Bad request: " + e.getMessage(), 400);
        } catch (HttpServerErrorException e) {
            throw new AiServiceException("AI service error: " + e.getMessage(), 500);
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

        } catch (ResourceAccessException e) {
            throw new AiServiceException("AI service is currently unavailable!", 503);
        } catch (HttpClientErrorException e) {
            throw new AiServiceException("Bad request: " + e.getMessage(), 400);
        } catch (HttpServerErrorException e) {
            throw new AiServiceException("AI service error: " + e.getMessage(), 500);
        }
    }
}