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

    public String analyzeResume(MultipartFile resume, String jobRole) {

        try {
            // Step 1: Prepare the PDF file
            ByteArrayResource fileResource = new ByteArrayResource(resume.getBytes()) {
                @Override
                public String getFilename() {
                    return resume.getOriginalFilename();
                }
            };

            // Step 2: Build the request body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("resume", fileResource);
            body.add("jobRole", jobRole);

            // Step 3: Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Step 4: Create the request
            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            // Step 5: Call AI service
            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/analyze",
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