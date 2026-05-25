package com.cognizant.sales_service.service;

import com.cognizant.sales_service.entity.Promotion;
import com.cognizant.sales_service.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    public Optional<Promotion> validatePromoCode(String code) {
        return promotionRepository.findByCodeAndIsActiveTrue(code);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public void deactivatePromotion(Long id) {
        promotionRepository.findById(id).ifPresent(p -> {
            p.setIsActive(false);
            promotionRepository.save(p);
        });
    }
}
