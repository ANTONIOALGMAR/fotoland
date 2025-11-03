package com.fotoland.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class S3Config {

    @Value("${cloud.aws.region.static}")
    private String awsRegion;

    @Value("${cloud.aws.s3.endpoint}")
    private String s3Endpoint;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(awsRegion))
                .endpointOverride(URI.create(s3Endpoint))
                .build();
    }
}
