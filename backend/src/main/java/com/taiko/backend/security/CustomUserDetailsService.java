package com.taiko.backend.security;

import com.taiko.backend.model.User;
import com.taiko.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        if (!user.isActivo()) {
            throw new UsernameNotFoundException("Cuenta desactivada");
        }

        // El rol se incluye como authority para que Spring Security pueda usarlo
        // en hasAuthority() y @PreAuthorize sin necesidad de consultar la BD en cada request
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(user.getRol().name());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(authority)
        );
    }
}
