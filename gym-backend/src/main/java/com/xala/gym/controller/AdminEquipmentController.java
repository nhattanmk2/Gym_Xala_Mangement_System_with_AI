package com.xala.gym.controller;

import com.xala.gym.entity.GymEquipment;
import com.xala.gym.repository.GymEquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/equipment")
@RequiredArgsConstructor
public class AdminEquipmentController {

    private final GymEquipmentRepository equipmentRepository;

    @GetMapping
    public ResponseEntity<List<GymEquipment>> getAllEquipment() {
        return ResponseEntity.ok(equipmentRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<GymEquipment> createEquipment(@RequestBody GymEquipment equipment) {
        return ResponseEntity.ok(equipmentRepository.save(equipment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
