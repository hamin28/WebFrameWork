package com.example.demo;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class MeetingImageStorageService {
    private static final Logger logger = Logger.getLogger(MeetingImageStorageService.class.getName());
    private static final String IMAGE_URL_PREFIX = "/uploads/meetings/";

    private final Path uploadRoot = Paths.get("uploads", "meetings").toAbsolutePath().normalize();

    public List<String> saveImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) return List.of();
        if (images.size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "모임 이미지는 최대 3장까지 등록할 수 있습니다.");
        }

        try {
            Files.createDirectories(uploadRoot);
            List<String> urls = new ArrayList<>();
            for (MultipartFile image : images) {
                if (image == null || image.isEmpty()) continue;

                String type = image.getContentType();
                String extension;
                if ("image/jpeg".equalsIgnoreCase(type)) extension = ".jpg";
                else if ("image/png".equalsIgnoreCase(type)) extension = ".png";
                else throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "JPG 또는 PNG 이미지만 등록할 수 있습니다.");

                String name = UUID.randomUUID() + extension;
                Path target = uploadRoot.resolve(name).normalize();
                if (!target.startsWith(uploadRoot)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
                Files.copy(image.getInputStream(), target);
                urls.add(IMAGE_URL_PREFIX + name);
            }
            return urls;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 파일을 저장하지 못했습니다.", e);
        }
    }

    public void deleteImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;

        for (String imageUrl : imageUrls) {
            if (imageUrl == null || !imageUrl.startsWith(IMAGE_URL_PREFIX)) continue;

            String fileName = imageUrl.substring(IMAGE_URL_PREFIX.length());
            Path target = uploadRoot.resolve(fileName).normalize();
            if (!target.startsWith(uploadRoot) || !target.getFileName().toString().equals(fileName)) continue;

            try {
                Files.deleteIfExists(target);
            } catch (IOException e) {
                logger.warning("모임 이미지 파일을 삭제하지 못했습니다: " + fileName + " (" + e.getMessage() + ")");
            }
        }
    }
}
