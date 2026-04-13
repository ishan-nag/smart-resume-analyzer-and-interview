package com.abhi.backend.service;

import com.abhi.backend.exception.AiServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
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

        } catch (ResourceAccessException e) {
            throw new AiServiceException("AI service is currently unavailable!", 503);
        } catch (HttpClientErrorException e) {
            throw new AiServiceException("Bad request: " + e.getMessage(), 400);
        } catch (HttpServerErrorException e) {
            throw new AiServiceException("AI service error: " + e.getMessage(), 500);
        }
    }

    // Service 2: Upload resume PDF
    public String uploadResume(MultipartFile file) {
        try {
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/api/upload",
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
        } catch (Exception e) {
            throw new AiServiceException("Error processing file: " + e.getMessage(), 500);
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

        } catch (ResourceAccessException e) {
            throw new AiServiceException("AI service is currently unavailable!", 503);
        } catch (HttpClientErrorException e) {
            throw new AiServiceException("Bad request: " + e.getMessage(), 400);
        } catch (HttpServerErrorException e) {
            throw new AiServiceException("AI service error: " + e.getMessage(), 500);
        }
    }
}