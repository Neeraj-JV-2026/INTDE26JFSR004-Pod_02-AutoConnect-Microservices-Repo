package com.cognizant.user_service.config;

import com.cognizant.user_service.entity.User;
import com.cognizant.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default System Administrator account on first startup.
 *   Email   : admin@autoconnect.com
 *   Password: Admin@123
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByRole("ADMIN")) {
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail("admin@autoconnect.com");
            admin.setPhone("0000000000");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");
            admin.setApproved(true);
            admin.setMfaEnabled(false);
            userRepository.save(admin);
            log.info("Default admin created — email: admin@autoconnect.com / password: Admin@123");
        }
    }
}
