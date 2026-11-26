package com.example.demo;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class MeetingImageWebConfig implements WebMvcConfigurer {
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        long mb = 1024L * 1024L;
        return new MultipartConfigElement("", 10 * mb, 30 * mb, 0);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get("uploads", "meetings")
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();
        registry.addResourceHandler("/uploads/meetings/**")
                .addResourceLocations(location);
    }
}