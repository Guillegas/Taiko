package com.taiko.backend.config;

import com.taiko.backend.security.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración central de seguridad de la aplicación.
 *
 * <p>Define la cadena de filtros HTTP, las reglas de autorización por
 * endpoint, la política CORS y los beans de soporte (encoder de
 * contraseñas y manager de autenticación).</p>
 *
 * <p>Decisiones de diseño:</p>
 * <ul>
 *   <li><b>Stateless</b>: la API no usa sesiones HTTP. La identidad del
 *       usuario se transporta en cada petición mediante un JWT firmado
 *       con HS256, validado por {@link com.taiko.backend.security.JwtRequestFilter}.</li>
 *   <li><b>BCrypt</b>: las contraseñas se almacenan hasheadas con
 *       {@link BCryptPasswordEncoder}, que aplica salt aleatorio y un
 *       coste configurable resistente a fuerza bruta.</li>
 *   <li><b>RBAC</b>: el rol (admin / cliente) se inyecta como
 *       <em>authority</em> en el contexto de seguridad y se valida tanto
 *       a nivel de URL como con {@code @PreAuthorize} gracias a
 *       {@link EnableMethodSecurity}.</li>
 *   <li><b>CORS restringido</b>: solo se aceptan peticiones desde el
 *       frontend en producción (Vercel) y entornos locales conocidos.</li>
 *   <li><b>CSRF deshabilitado</b>: es seguro al ser una API REST
 *       stateless sin cookies de sesión.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Activa @PreAuthorize en controllers y services
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth

                // Autenticación pública
                .requestMatchers("/api/auth/**").permitAll()

                // Webhook de Telegram (llamado desde servidores de Telegram, sin JWT)
                .requestMatchers("/api/webhook/telegram").permitAll()

                // Catálogo público: lectura de coches y búsqueda semántica
                .requestMatchers(HttpMethod.GET,  "/api/cars/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/cars/search").permitAll()

                // Catálogo de datos de referencia (carrocerías, combustibles, etc.)
                .requestMatchers(HttpMethod.GET, "/api/catalogo/**").permitAll()

                // Chat: inicio de conversación, mensajes e historial son públicos
                // (soporta usuarios anónimos; los UUIDs funcionan como tokens de sesión)
                .requestMatchers(HttpMethod.POST, "/api/chat/start").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/chat/*/message").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/chat/*/history").permitAll()

                // Exportaciones de chat: requieren autenticación
                .requestMatchers(HttpMethod.GET, "/api/chat/*/export/**").authenticated()

                // Conversaciones personales: solo para usuarios autenticados
                .requestMatchers(HttpMethod.GET,    "/api/chat/mis-conversaciones").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/chat/conversaciones/*").authenticated()

                // Panel de administración: solo para el rol admin
                .requestMatchers("/api/admin/**").hasAuthority("admin")

                // Operaciones de escritura sobre vehículos: solo admin
                // (seed e import también están protegidos con @PreAuthorize en el controller)
                .requestMatchers(HttpMethod.POST,   "/api/cars/new").hasAuthority("admin")
                .requestMatchers(HttpMethod.POST,   "/api/cars/seed").hasAuthority("admin")
                .requestMatchers(HttpMethod.POST,   "/api/cars/import").hasAuthority("admin")
                .requestMatchers(HttpMethod.POST,   "/api/cars/*/images").hasAuthority("admin")
                .requestMatchers(HttpMethod.PUT,    "/api/cars/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/cars/**").hasAuthority("admin")

                // Subida de imágenes: solo usuarios autenticados
                .requestMatchers(HttpMethod.POST, "/api/upload/**").authenticated()

                // Archivos estáticos servidos desde /uploads
                .requestMatchers("/uploads/**").permitAll()

                // Ruta de errores de Spring (necesaria para devolver errores reales en vez de 403)
                .requestMatchers("/error").permitAll()

                .anyRequest().authenticated()
            )
            // Sin sesiones HTTP: la autenticación es stateless vía JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Orígenes permitidos: frontend en producción (Vercel) y entornos de desarrollo local.
        // Restringir CORS a una lista cerrada evita que dominios arbitrarios
        // realicen peticiones autenticadas contra la API.
        config.setAllowedOrigins(List.of(
            "https://frontend-xi-navy-88.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
