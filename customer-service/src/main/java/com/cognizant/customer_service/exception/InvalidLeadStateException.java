package com.cognizant.customer_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidLeadStateException extends RuntimeException {
    public InvalidLeadStateException(String message) {
        super(message);
    }
}
