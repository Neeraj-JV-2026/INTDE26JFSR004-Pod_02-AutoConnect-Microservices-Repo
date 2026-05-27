package com.cognizant.user_service.controller;

import com.cognizant.user_service.dto.UserRequestDTO;
import com.cognizant.user_service.dto.UserResponseDTO;
import com.cognizant.user_service.entity.User;
import com.cognizant.user_service.security.Role;
import com.cognizant.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserRequestDTO userRequestDTO) {
        User user = mapToEntity(userRequestDTO);
        User savedUser = userService.createUser(user);
        return new ResponseEntity<>(mapToResponseDTO(savedUser), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','AUDITOR')")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponseDTO(userService.getUserById(id)));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyAuthority('ADMIN','AUDITOR')")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(mapToResponseDTO(userService.getUserByEmail(email)));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','AUDITOR')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponseDTO> responseDTOs = users.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    @GetMapping("/by-role")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AUDITOR', 'SERVICE_ADVISOR')")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRole(@RequestParam String role) {
        List<UserResponseDTO> responseDTOs = userService.getUsersByRole(role)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserRequestDTO userRequestDTO) {
        User user = mapToEntity(userRequestDTO);
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(mapToResponseDTO(updatedUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enable-mfa")
    @PreAuthorize("hasAuthority('ADMIN') or #id == authentication.principal.userId")
    public ResponseEntity<UserResponseDTO> enableMfa(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponseDTO(userService.enableMfa(id)));
    }

    @PostMapping("/{id}/disable-mfa")
    @PreAuthorize("hasAuthority('ADMIN') or #id == authentication.principal.userId")
    public ResponseEntity<UserResponseDTO> disableMfa(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponseDTO(userService.disableMfa(id)));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(Arrays.stream(Role.values()).map(Enum::name).collect(Collectors.toList()));
    }

    @PostMapping("/{id}/assign-role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDTO> assignRole(@PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(mapToResponseDTO(userService.assignRole(id, role)));
    }

    // ── Admin Approval Endpoints ───────────────────────────────────
    @GetMapping("/pending-approval")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getPendingApprovals() {
        return ResponseEntity.ok(
            userService.getPendingApprovals().stream()
                .map(this::mapToResponseDTO).collect(Collectors.toList()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDTO> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponseDTO(userService.approveUser(id)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> rejectUser(@PathVariable Long id) {
        userService.rejectUser(id);
        return ResponseEntity.noContent().build();
    }

    private User mapToEntity(UserRequestDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setRole(dto.getRole());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setMfaEnabled(dto.getMfaEnabled());
        user.setStatus(dto.getStatus());
        return user;
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setRole(user.getRole());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setMfaEnabled(user.getMfaEnabled());
        dto.setStatus(user.getStatus());
        dto.setApproved(user.getApproved());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
