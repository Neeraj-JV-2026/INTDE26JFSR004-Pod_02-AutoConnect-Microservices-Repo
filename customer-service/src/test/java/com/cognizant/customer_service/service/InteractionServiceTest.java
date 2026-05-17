package com.cognizant.customer_service.service;

import com.cognizant.customer_service.entity.Interaction;
import com.cognizant.customer_service.repository.InteractionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InteractionServiceTest {

    @Mock
    private InteractionRepository interactionRepository;

    @InjectMocks
    private InteractionService interactionService;

    private Interaction sample;

    @BeforeEach
    void setUp() {
        sample = new Interaction();
        sample.setInteractionId(1L);
        sample.setCustomerId(10L);
        sample.setUserId(2L);
        sample.setChannel("CALL");
        sample.setMessage("Discussed pricing options.");
        sample.setOutcome("FOLLOW_UP");
        sample.setTimestamp(LocalDateTime.now());
    }

    @Test
    void logInteraction_savesAndReturns() {
        when(interactionRepository.save(any(Interaction.class))).thenReturn(sample);

        Interaction result = interactionService.logInteraction(sample);

        assertThat(result.getInteractionId()).isEqualTo(1L);
        assertThat(result.getChannel()).isEqualTo("CALL");
        assertThat(result.getOutcome()).isEqualTo("FOLLOW_UP");
        verify(interactionRepository).save(any(Interaction.class));
    }

    @Test
    void getInteractionsByCustomer_returnsFilteredList() {
        Interaction other = new Interaction();
        other.setCustomerId(10L);
        other.setChannel("EMAIL");

        when(interactionRepository.findByCustomerId(10L)).thenReturn(List.of(sample, other));

        List<Interaction> result = interactionService.getInteractionsByCustomer(10L);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(i -> i.getCustomerId().equals(10L));
    }

    @Test
    void getInteractionsByCustomer_noInteractions_returnsEmptyList() {
        when(interactionRepository.findByCustomerId(99L)).thenReturn(List.of());

        List<Interaction> result = interactionService.getInteractionsByCustomer(99L);

        assertThat(result).isEmpty();
    }
}
