// Importações necessárias
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Plan.module.css";
import Chart from "chart.js/auto";


// Componente principal responsável pelo controle financeiro
const Plan = () => {
  // Estados para armazenar os dados do formulário e da API
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [euroRate, setEuroRate] = useState(0);
  const [planos, setPlanos] = useState([]);

  // Refs para manipular o canvas do gráfico
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Hook de navegação do React Router
  const navigate = useNavigate();

  // useEffect: executa ao carregar a página
  useEffect(() => {
    getEuroValue();
    getList();
  }, []);

  // Busca a cotação atual do Euro via API públicav(API EXTERNA)
  const getEuroValue = async () => {
    try {
      const response = await fetch("https://economia.awesomeapi.com.br/json/last/EUR-BRL");
      const data = await response.json();
      setEuroRate(parseFloat(data.EURBRL.bid));
    } catch (error) {
      console.error("Erro ao obter a cotação do Euro:", error);
    }
  };

  // Busca a lista de planos financeiros cadastrados do back-end
  const getList = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado! Faça login novamente.");
      navigate("/");
      return;
    }

    try {
      console.log("🔑 Token atual:", token);

      const response = await fetch("http://127.0.0.1:5001/planos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log("📌 Resposta completa do servidor:", data);

      if (Array.isArray(data.planos)) {
        setPlanos(data.planos);
        updateChart(data.planos);
      } else {
        alert("Erro ao processar os dados recebidos.");
      }
    } catch (error) {
      console.error("Erro ao obter a lista:", error);
      alert("Erro ao buscar dados do servidor.");
    }
  };

  // Adiciona um novo item à lista (Receita ou Gasto)
  const handleAdd = async () => {
    if (!tipo || !descricao || !valor) {
      alert("Preencha todos os campos corretamente!");
      return;
    }
  
    let valorConvertido = parseFloat(valor);
    if (document.getElementById("checkBox").checked) {
      if (euroRate > 0) {
        valorConvertido = valorConvertido / euroRate;
      } else {
        alert("Erro: Cotação do Euro não carregada.");
        return;
      }
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado! Faça login novamente.");
      navigate("/");
      return;
    }
  
    const payload = {
      nome: descricao,
      valor: parseFloat(valorConvertido),
      revenue: tipo,
    };
  
    try {
      const response = await fetch('http://127.0.0.1:5001/plano', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload),
      });
  
      const text = await response.text();
      console.log("🔄 Resposta do servidor:", text);
  
      if (response.ok) {
        getList();
        setTipo("");
        setDescricao("");
        setValor("");
      } else {
        const errorMsg = JSON.parse(text).message || response.statusText;
        alert("Erro ao adicionar plano: " + errorMsg);
      }
    } catch (error) {
      console.error("❌ Erro ao adicionar item:", error);
    }
  };
  
  
  // Remove um item do plano
  const handleDelete = async (nome) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado! Faça login novamente.");
      navigate("/");
      return;
    }

    const confirmar = window.confirm(`Tem certeza que deseja excluir "${nome}"?`);
    if (!confirmar) return;

    try {
      const response = await fetch(`http://127.0.0.1:5001/plano/${encodeURIComponent(nome)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Resposta do servidor:", data);

      if (response.ok) {
        getList();
      } else {
        alert("Erro ao excluir receita: " + data.message);
      }
    } catch (error) {
      console.error("Erro ao remover item:", error);
    }
  };


  // Edita um item existente do plano
  const handleEdit = async (nomeAtual, tipo, novoNome, novoValor) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado! Faça login novamente.");
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5001/plano/${encodeURIComponent(nomeAtual)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          revenue: tipo,
          nome: novoNome,
          valor: parseFloat(novoValor).toFixed(2),
        }),
      });

      const textResponse = await response.text();
      console.log("📌 Resposta completa da API:", textResponse);

      if (!response.ok) {
        throw new Error(`Erro na edição: ${response.status} - ${textResponse}`);
      }

      const data = JSON.parse(textResponse);
      console.log("✅ Plano editado com sucesso!", data);
      getList();
    } catch (error) {
      console.error("❌ Erro ao editar item:", error);
      alert("Erro ao editar plano. Verifique os dados e tente novamente.");
    }
  };


  // Atualiza o gráfico com base nas receitas e gastos
  const updateChart = (data) => {
    const receitas = data
      .filter((item) => item.revenue === "Receita")
      .reduce((acc, item) => acc + parseFloat(item.valor), 0);
    const gastos = data
      .filter((item) => item.revenue === "Gasto")
      .reduce((acc, item) => acc + parseFloat(item.valor), 0);

    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Receitas", "Gastos"],
        datasets: [
          {
            data: [receitas, gastos],
            backgroundColor: ["green", "red"],
          },
        ],
      },
    });
  };


  // Renderização da interface principal do componente
  return (
    <div className={styles.container}>
      <header className={styles.header}><h1>Plano de Controle Financeiro</h1></header>

      <section className={styles.newRevenue}>
        <div className={styles.inputContainer}>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Selecione</option>
            <option value="Receita">Receita</option>
            <option value="Gasto">Gasto</option>
          </select>

          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <input
            type="number"
            placeholder="Valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <label>
            <input type="checkbox" id="checkBox" />
            Converter para Euro (€)
          </label>

          <button onClick={handleAdd} className={styles.addBtn}>Adicionar</button>
        </div>
      </section>

      <section className={styles.cotacao}>
        <h3>Última cotação do Euro:</h3>
        <p>Valor (R$): {euroRate.toFixed(2)}</p>
      </section>

      <section className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {planos.map((item, index) => (
              <tr key={index}>
                <td>{item.revenue}</td>
                <td>{item.nome}</td>
                <td>{parseFloat(item.valor).toFixed(2)}</td>
                <td>
                  <div className="action-buttons">
                    <button className="edit" onClick={() => {
                      const novoNome = prompt("Novo nome:", item.nome);
                      const novoValor = prompt("Novo valor:", item.valor);
                      if (novoNome && novoValor && !isNaN(novoValor)) {
                        handleEdit(item.nome, item.revenue, novoNome, parseFloat(novoValor));
                      }
                    }}>✏️</button>
                    <button className="delete" onClick={() => handleDelete(item.nome)}>❌</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.chartContainer}>
        <h3>Plano de Controle Financeiro em Euros:</h3>
        <canvas ref={canvasRef}></canvas>
      </section>
    </div>
  );
};

export default Plan;
