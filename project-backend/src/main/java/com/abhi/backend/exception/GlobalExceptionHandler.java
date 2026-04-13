package com.abhi.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle AI service errors
    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<Map<String, String>> handleAiServiceException(
            AiServiceException ex) {

        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("status", String.valueOf(ex.getStatusCode()));

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(error);
    }

    // Handle connection errors (AI service is down)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(
            Exception ex) {

        Map<String, String> error = new HashMap<>();
        error.put("error", "Something went wrong!");
        error.put("details", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error);
    }
}