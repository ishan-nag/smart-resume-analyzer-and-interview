package com.abhi.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    // Service 1: Get all roles
    public String getRoles() {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/api/roles",
                    HttpMethod.GET,
                    null,
                    String.class
            );
            return response.getBody();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // Service 2: Upload resume PDF
    public String uploadResume(MultipartFile file) {
        try {
            // Prepare the PDF file
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            // Build request body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Create request
            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            // Call AI service
            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/api/upload",
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            return response.getBody();

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // Service 3: Analyze resume
    public String analyzeResume(String requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/api/analyze",
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