// Importações principais
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";


// Componente de Registro
const Register = () => {
  // Estados para campos do formulário
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); 
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Estilo aplicado ao fundo da página
  useEffect(() => {
    document.body.style.background = "linear-gradient(135deg, #e0f7ff, #c2e9fb)";
    document.body.style.margin = "0";
    document.body.style.fontFamily = "Arial, sans-serif";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // Função chamada ao enviar o formulário de cadastro
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Cadastro realizado com sucesso!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Erro ao conectar ao servidor");
    }
  };


  // Renderização da interface principal do componente
  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h2>Cadastro</h2>
        {message && <p className={styles.message}>{message}</p>}
        <form onSubmit={handleRegister}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Cadastrar</button>
        </form>
        <p>Já tem uma conta? <a href="/">Faça login</a></p>
      </div>
    </div>
  );
};

export default Register;