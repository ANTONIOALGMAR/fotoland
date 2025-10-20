package com.fotoland.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username; // Apelido

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName; // Nome Completo

    private String phoneNumber; // Telefone

    private String address; // Endereço

    private String profilePictureUrl; // URL da Foto de Perfil

    // TODO: Adicionar roles para Spring Security
}
