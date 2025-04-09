// Importações necessárias
import { Link } from 'react-router-dom';    
import React from "react";
import styles from './Header.module.css'


// Função responsável por realizar o logout
// Remove o token de autenticação do localStorage e redireciona para a página inicial
const handleLogout = () => {
    localStorage.removeItem("token"); 
    window.location.href = "/"; 
  };


// Componente funcional Header, responsável por exibir o cabeçalho do site
function Header() {
    return(
        <header className={styles.header}>
            <span>Malucchetti</span>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/cadastro">Cadastro</Link>
                <Link to="/plano">Plano</Link>
                <button onClick={handleLogout}>Sair</button> 
            </nav>
        </header>
    )
}

export default Header