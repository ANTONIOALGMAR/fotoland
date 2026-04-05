package com.fotoland.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FotolandBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FotolandBackendApplication.class, args);
	}

}
