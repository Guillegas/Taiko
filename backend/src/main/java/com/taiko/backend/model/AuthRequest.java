package com.taiko.backend.model;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}
