package com.cognizant.customer_service.service;

import com.cognizant.customer_service.entity.Interaction;
import com.cognizant.customer_service.repository.InteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InteractionService {
    private final InteractionRepository interactionRepository;

    public Interaction logInteraction(Interaction interaction) {
        return interactionRepository.save(interaction);
    }

    public List<Interaction> getInteractionsByCustomer(Long customerId) {
        return interactionRepository.findByCustomerId(customerId);
    }
}
