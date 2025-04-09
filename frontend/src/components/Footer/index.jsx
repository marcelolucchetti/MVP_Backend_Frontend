// Importações necessárias
import React from "react";
import styles from './Footer.module.css'


// Componente funcional Footer, responsável por exibir o rodapé do site
function Footer(){
    return(
        <footer className={styles.footer}>
            Criado por Marcelo Lucchetti; MVP Back-end Avançado
        </footer>
    )
}

export default Footer