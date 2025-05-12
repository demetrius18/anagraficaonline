CREATE DATABASE crm_clienti;
USE crm_clienti;

CREATE TABLE clienti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    piattaforma ENUM('GoldBet', 'BetFlag') NOT NULL,
    data_registrazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
