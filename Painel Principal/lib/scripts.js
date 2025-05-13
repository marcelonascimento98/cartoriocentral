function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

jQuery(document).ready(function($) {
  var inputManual = $("#inputManualSenha");
  let historicoSenhas = [];

  const mapaServicos = {
    A: "Expedir, Retirar ou Autenticar Documentos",
    B: "Abrir ou Reconhecer Firma",
    C: "Outros",
    D: "Prioridade"
  };

  const mapaMesas = {
    A: "Mesa 1",
    B: "Mesa 2",
    C: "Mesa 3",
    D: "Mesa 4"
  };

  const endpoint = "https://script.google.com/macros/s/AKfycbzG74YSECdmtVBHreXUPO_cbQ0pEMvnYieHUILdi6nvrNTO6SaXn09HA-p1jbUuaTwQ/exec";

  function atualizaHistoricoSenha(senha) {
    const letra = senha.charAt(0);
    const servico = mapaServicos[letra] || "Desconhecido";
    const mesa = mapaMesas[letra] || "Mesa ?";
    const texto = `SENHA ${senha} | ${servico} | ${mesa}`;

    historicoSenhas.unshift(texto);
    if (historicoSenhas.length > 4) historicoSenhas.pop();

    $("#ultimaSenhaHistorico").html(
      historicoSenhas.map(s => `<div>${s}</div>`).join("")
    );
  }

  function atualizarServico(senha) {
    const letra = senha.charAt(0);
    const servico = mapaServicos[letra] || "Desconhecido";
    const mesa = mapaMesas[letra] || "Mesa ?";
    $("#servicoAtual").text(`${servico} | ${mesa}`);
  }

  function registrarChamadaNaPlanilha(senha, mesa) {
    const anterior = localStorage.getItem(`ultimaSenha_${senha.charAt(0)}`) || "";
    localStorage.setItem(`ultimaSenha_${senha.charAt(0)}`, senha);

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        senha: senha,
        mesa: mesa,
        anterior: anterior
      })
    });
  }

  $("body").on('keydown', function(e) {
    var senhaAtual = $("#senhaAtualNumero");
    var audioChamada = $("#audioChamada");

    if (inputManual.is(":visible")) {
      if (e.key === "Enter") {
        var valor = inputManual.val().toUpperCase().trim();
        if (/^[A-D]\d{4}$/.test(valor)) {
          senhaAtual.text(valor);
          atualizaHistoricoSenha(valor);
          atualizarServico(valor);
          registrarChamadaNaPlanilha(valor, mapaMesas[valor.charAt(0)]);
          audioChamada.trigger("play");
        } else {
          alert("Senha inválida.");
        }
        inputManual.val("").hide();
        return;
      }
      if (e.key === "Escape") {
        inputManual.val("").hide();
        return;
      }
    }

    if (e.key === "Shift") {
      inputManual.show().focus();
      return;
    }

    const letra = e.key.toUpperCase();
    if (!inputManual.is(":visible") && ["A", "B", "C", "D"].includes(letra)) {
      const contador = parseInt(localStorage.getItem(`contador_${letra}`)) || 0;
      const novaSenha = letra + pad(contador + 1, 4);
      localStorage.setItem(`contador_${letra}`, contador + 1);

      senhaAtual.text(novaSenha);
      atualizaHistoricoSenha(novaSenha);
      atualizarServico(novaSenha);
      registrarChamadaNaPlanilha(novaSenha, mapaMesas[letra]);
      audioChamada.trigger("play");
    }
  });
});
