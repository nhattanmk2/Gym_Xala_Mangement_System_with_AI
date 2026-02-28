package com.xala.gym.service;

import com.xala.gym.dto.request.PackageRequest;
import com.xala.gym.entity.Package;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface AdminPackageService {
    List<Package> getAllPackages();
    Package getPackageById(Long id);
    Package createPackage(PackageRequest request, MultipartFile image) throws IOException;
    Package updatePackage(Long id, PackageRequest request, MultipartFile image) throws IOException;
    void deletePackage(Long id);
    Package toggleActive(Long id);
    Package updatePromotion(Long id, String promotion);
}
