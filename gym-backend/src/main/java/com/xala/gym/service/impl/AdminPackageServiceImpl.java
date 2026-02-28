package com.xala.gym.service.impl;

import com.xala.gym.dto.request.PackageRequest;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.PackageRepository;
import com.xala.gym.service.AdminPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPackageServiceImpl implements AdminPackageService {

    private final PackageRepository packageRepository;

    @Override
    public List<Package> getAllPackages() {
        return packageRepository.findAll();
    }

    @Override
    public Package getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
    }

    @Override
    @Transactional
    public Package createPackage(PackageRequest request, MultipartFile image) throws IOException {
        Package pkg = new Package();
        mapRequestToEntity(request, pkg);
        if (image != null && !image.isEmpty()) {
            pkg.setImage(image.getBytes());
        }
        return packageRepository.save(pkg);
    }

    @Override
    @Transactional
    public Package updatePackage(Long id, PackageRequest request, MultipartFile image) throws IOException {
        Package pkg = getPackageById(id);
        mapRequestToEntity(request, pkg);
        if (image != null && !image.isEmpty()) {
            pkg.setImage(image.getBytes());
        }
        return packageRepository.save(pkg);
    }

    @Override
    @Transactional
    public void deletePackage(Long id) {
        Package pkg = getPackageById(id);
        packageRepository.delete(pkg);
    }

    @Override
    @Transactional
    public Package toggleActive(Long id) {
        Package pkg = getPackageById(id);
        pkg.setActive(!pkg.getActive());
        return packageRepository.save(pkg);
    }

    @Override
    @Transactional
    public Package updatePromotion(Long id, String promotion) {
        Package pkg = getPackageById(id);
        pkg.setPromotion(promotion);
        return packageRepository.save(pkg);
    }

    private void mapRequestToEntity(PackageRequest request, Package pkg) {
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationInDays(request.getDurationInDays());
        pkg.setCategory(request.getCategory());
        pkg.setPromotion(request.getPromotion());
        if (request.getActive() != null) {
            pkg.setActive(request.getActive());
        }
    }
}
