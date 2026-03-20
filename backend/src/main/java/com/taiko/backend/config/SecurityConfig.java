package com.taiko.backend.config;

import com.taiko.backend.security.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desactivamos CSRF (obligatorio para JWT y APIs REST)
            .cors(cors -> cors.configure(http)) // Permitimos CORS
            .authorizeHttpRequests(auth -> auth
                // Endpoints de autenticación (Login y Registro) -> PÚBLICOS
                .requestMatchers("/api/auth/**").permitAll()
                
                // Endpoints GET de coches -> PÚBLICOS
                .requestMatchers(HttpMethod.GET, "/api/cars/**").permitAll()
                
                // Permitir ver errores reales en vez de 403
                .requestMatchers("/error").permitAll()
                
                // Endpoint de búsqueda -> PÚBLICO
                .requestMatchers(HttpMethod.POST, "/api/cars/search").permitAll()

                // Endpoints del ChatBot -> PÚBLICOS
                .requestMatchers("/api/chat/**").permitAll()
                
                // Endpoints POST/PUT/DELETE de coches -> SOLO AUTENTICADOS
                .requestMatchers(HttpMethod.POST, "/api/cars/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/cars/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/cars/**").authenticated()
                
                // Cualquier otra petición requiere autenticación
                .anyRequest().authenticated()
            )
            // No creamos sesiones (stateless) porque la seguridad depende de JWT en cada petición
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Añadimos nuestro filtro JWT antes del filtro estándar de usuario/contraseña
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Requerido para encriptar/desencriptar las contraseñas en la base de datos.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Expone el AuthenticationManager para usarlo en nuestro AuthController al hacer login.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
