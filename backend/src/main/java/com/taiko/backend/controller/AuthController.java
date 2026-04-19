package com.taiko.backend.controller;

import com.taiko.backend.model.AuthRequest;
import com.taiko.backend.model.AuthResponse;
import com.taiko.backend.model.User;
import com.taiko.backend.repository.UserRepository;
import com.taiko.backend.security.CustomUserDetailsService;
import com.taiko.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private CustomUserDetailsService userDetailsService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    /** Login con email y contraseña. Devuelve un JWT válido 24h. */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        if (authRequest.getUsername() == null || authRequest.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email y contraseña son obligatorios");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);
        User user = userRepository.findByEmail(authRequest.getUsername()).orElseThrow();
        return ResponseEntity.ok(new AuthResponse(jwt, user.getEmail(), user.getRol().name()));
    }

    /** Registro de nuevos usuarios con rol cliente. */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (req.getEmail() == null || req.getPassword() == null
                || req.getNombre() == null || req.getTelefono() == null) {
            return ResponseEntity.badRequest().body("Todos los campos son obligatorios");
        }
        if (req.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body("La contraseña debe tener al menos 8 caracteres");
        }
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("El email ya está registrado");
        }

        userRepository.insertUserNativeAsUser(
                req.getNombre(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getTelefono()
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);
        User user = userRepository.findByEmail(req.getEmail()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(jwt, user.getEmail(), user.getRol().name()));
    }

    public static class SignupRequest {
        private String nombre;
        private String email;
        private String password;
        private String telefono;
        public String getNombre()   { return nombre; }
        public String getEmail()    { return email; }
        public String getPassword() { return password; }
        public String getTelefono() { return telefono; }
    }
}
