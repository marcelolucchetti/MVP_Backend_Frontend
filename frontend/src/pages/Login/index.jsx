// Importações principais do React
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

// Componente de Login
const Login = () => {
    // Estado para armazenar o nome de usuário
  const [username, setUsername] = useState("");
    // Estado para armazenar a senha
  const [password, setPassword] = useState("");
    // Estado para exibir mensagens de erro/sucesso
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // useEffect para aplicar estilo de fundo quando o componente for montado
  useEffect(() => {
    document.body.style.background = "linear-gradient(135deg, #e0f7ff, #c2e9fb)";
    document.body.style.margin = "0";
    document.body.style.fontFamily = "Arial, sans-serif";
    return () => {
      document.body.style.background = "";
    };
  }, []);


  // Função chamada ao enviar o formulário de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("🔑 Token recebido:", data);

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_id", data.user_id);
        navigate("/plano");
      } else {
        setMessage(data.message || "Usuário ou senha inválidos");
      }
    } catch (err) {
      setMessage("Erro ao conectar ao servidor");
    }
  };


  // Renderização da interface principal do componente
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>Login</h2>
        {message && <p className={styles.message}>{message}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
        <p>
          Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
