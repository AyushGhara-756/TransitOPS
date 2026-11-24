package in.th.transitops.security;

import in.th.transitops.enums.Roles;
import in.th.transitops.filter.JWTFilter;
import in.th.transitops.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserService userDetails;
    @Autowired
    private JWTFilter filter;

    @Bean
    public SecurityFilterChain chain(HttpSecurity http) throws Exception{
        return http
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/auth/**")
                        .permitAll()
                        .requestMatchers("/driver/**")
                        .hasAnyRole(Roles.FLEET_MANAGER.name(), Roles.SAFETY_OFFICER.name())
                        .requestMatchers(HttpMethod.GET, "/dashboard/**","/drivers/**","/trips/**")
                        .hasRole(Roles.DISPATCHER.name())
                        .requestMatchers("") //Need to make the financial endpoint
                        .hasRole(Roles.FINANCIAL_ANALYST.name())
                        .anyRequest()
                        .authenticated()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager manager(AuthenticationConfiguration config){
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider provider(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetails);
        provider.setPasswordEncoder(new BCryptPasswordEncoder());
        return provider;
    }
}
