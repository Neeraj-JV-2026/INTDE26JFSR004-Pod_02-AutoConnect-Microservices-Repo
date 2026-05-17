package com.cognizant.customer_service.controller;

import com.cognizant.customer_service.dto.InteractionDTO;
import com.cognizant.customer_service.entity.Interaction;
import com.cognizant.customer_service.service.InteractionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
@Tag(name = "Interactions", description = "Customer interaction logging APIs")
public class InteractionController {
    private final InteractionService interactionService;

    @PostMapping("/log")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT')")
    @Operation(summary = "Log a new customer interaction")
    public ResponseEntity<InteractionDTO> logInteraction(@Valid @RequestBody InteractionDTO dto) {
        Interaction interaction = mapToInteractionEntity(dto);
        return new ResponseEntity<>(mapToInteractionResponse(interactionService.logInteraction(interaction)), HttpStatus.CREATED);
    }

    @GetMapping("/{customerId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'AUDITOR')")
    @Operation(summary = "Get all interactions for a customer")
    public ResponseEntity<List<InteractionDTO>> getInteractionsByCustomer(@PathVariable Long customerId) {
        List<InteractionDTO> list = interactionService.getInteractionsByCustomer(customerId).stream()
                .map(i -> mapToInteractionResponse(i)).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private Interaction mapToInteractionEntity(InteractionDTO dto) {
        Interaction i = new Interaction();
        i.setCustomerId(dto.getCustomerId());
        i.setUserId(dto.getUserId());
        i.setChannel(dto.getChannel());
        i.setMessage(dto.getMessage());
        i.setOutcome(dto.getOutcome());
        return i;
    }

    private InteractionDTO mapToInteractionResponse(Interaction i) {
        return InteractionDTO.builder()
                .interactionId(i.getInteractionId())
                .customerId(i.getCustomerId())
                .userId(i.getUserId())
                .channel(i.getChannel())
                .message(i.getMessage())
                .timestamp(i.getTimestamp())
                .outcome(i.getOutcome())
                .build();
    }
}
