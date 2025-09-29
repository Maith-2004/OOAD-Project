
package lk.shanthi.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@org.springframework.context.annotation.Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/users/register", "/users/login").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/users", "/users/*").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/users/*").permitAll()
                .requestMatchers("/products/**", "/products").permitAll()
                .requestMatchers("/orders/**", "/orders").permitAll()
                .requestMatchers("/payments/**", "/payments").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
