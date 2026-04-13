package com.abhi.backend.exception;

public class AiServiceException extends RuntimeException {

    private final int statusCode;

    public AiServiceException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}