const Oferta = require('../models/ofertaModel');
const { enviarEmail } = require('../services/emailService');

// Função que monta o HTML do e-mail
function buildEmailHtml(status, oferta) {
  const cores = {
    "Em análise": "#facc15",
    "Rejeitado": "#ef4444",
    "Aceito": "#3b82f6",
    "Aprovado": "#10b981",
    "Aguardando milhas": "#3b82f6",
    "Milhas recebidas": "#8b5cf6",
    "Emissão de passagem": "#f97316",
    "Pago": "#10b981",
    "Cancelado": "#6b7280"
  };

  const cor = cores[status] || "#3b82f6";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: ${cor}; text-align: center;">Atualização de Status da Sua Oferta</h2>
      <p>Olá <strong>${oferta.usuario.nome}</strong>,</p>
      <p>Sua oferta no sistema <strong>Ponto Seguro Milhas</strong> foi atualizada para o status:</p>
      <p style="text-align: center; font-weight: bold; font-size: 18px; color: ${cor}; padding: 10px; border: 1px solid ${cor}; border-radius: 5px;">${status}</p>
      <hr style="margin: 20px 0;">
      <p><strong>Detalhes da sua oferta:</strong></p>
      <ul>
        <li>Cia / Programa: ${oferta.cia || "-" } / ${oferta.programa || "-" }</li>
        <li>Milhas: ${oferta.milhas?.toLocaleString() || "-"}</li>
        <li>Valor: R$ ${oferta.valor?.toLocaleString() || "-"}</li>
      </ul>
      <p>Se tiver dúvidas, entre em contato com nossa equipe.</p>
      <p style="text-align: center; margin-top: 20px;">🔒 Ponto Seguro Milhas</p>
    </div>
  `;
}

// Criar oferta
const salvarOferta = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não logado" });

    const payload = {
      ...req.body,
      usuario: req.user._id,
      status: "Em análise"
    };

    const oferta = new Oferta(payload);
    await oferta.save();

    // Enviar e-mail de criação
    if (req.user.email) {
      const html = buildEmailHtml("Em análise", oferta);
      await enviarEmail({
        para: req.user.email,
        assunto: "Sua oferta está em análise",
        html
      });
    }

    res.status(201).json(oferta);
  } catch (error) {
    console.error("Erro em salvarOferta:", error);
    res.status(500).json({ message: "Erro ao salvar oferta" });
  }
};

// Listar ofertas do usuário logado
const listarOfertas = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não logado" });

    const ofertas = await Oferta.find({ usuario: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(ofertas);
  } catch (error) {
    console.error("Erro em listarOfertas:", error);
    res.status(500).json({ message: "Erro ao buscar ofertas" });
  }
};

// Listar todas as ofertas (admin)
const listarTodasOfertas = async (req, res) => {
  try {
    const ofertas = await Oferta.find()
      .populate("usuario", "nome email cpf")
      .sort({ createdAt: -1 });
    res.status(200).json(ofertas);
  } catch (error) {
    console.error("Erro em listarTodasOfertas:", error);
    res.status(500).json({ message: "Erro ao buscar todas as ofertas" });
  }
};

// Atualizar status da oferta (admin)
const updateStatusOferta = async (req, res) => {
  try {
    const ofertaId = req.params.id;
    const { status } = req.body;

    const statusPermitidos = [
      "Em análise",
      "Rejeitado",
      "Aceito",
      "Aprovado",
      "Aguardando milhas",
      "Milhas recebidas",
      "Emissão de passagem",
      "Pago",
      "Cancelado"
    ];

    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const oferta = await Oferta.findByIdAndUpdate(
      ofertaId,
      { status },
      { new: true }
    ).populate("usuario", "nome email");

    if (!oferta) return res.status(404).json({ message: "Oferta não encontrada" });

    // Enviar e-mail automático conforme o status
    if (oferta.usuario?.email) {
      const html = buildEmailHtml(status, oferta);
      const assunto = `Atualização da sua oferta: ${status}`;

      try {
        await enviarEmail({ para: oferta.usuario.email, assunto, html });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail:", emailError);
      }
    }

    res.status(200).json(oferta);
  } catch (error) {
    console.error("Erro em updateStatusOferta:", error);
    res.status(500).json({ message: "Erro ao atualizar status da oferta" });
  }
};

// Deletar oferta
const deletarOferta = async (req, res) => {
  try {
    const ofertaId = req.params.id;

    const oferta = await Oferta.findById(ofertaId);
    if (!oferta) return res.status(404).json({ message: "Oferta não encontrada" });

    // Só o dono pode deletar
    if (String(oferta.usuario) !== String(req.user._id)) {
      return res.status(403).json({ message: "Não autorizado a deletar esta oferta" });
    }

    await Oferta.findByIdAndDelete(ofertaId);
    res.status(200).json({ message: "Oferta deletada com sucesso" });
  } catch (error) {
    console.error("Erro em deletarOferta:", error);
    res.status(500).json({ message: "Erro ao deletar oferta" });
  }
};

// Listar ranking de ofertas
const listarRanking = async (req, res) => {
  try {
    const ofertas = await Oferta.find({ status: { $in: ["Aceito", "Aprovado", "Pago"] } })
      .populate("usuario", "nome")
      .sort({ valor: 1 });

    const ranking = ofertas.map((oferta) => {
      const valorPorMilhar = oferta.valor / (oferta.milhas / 1000);
      return {
        _id: oferta._id,
        usuario: oferta.usuario?.nome || "Usuário",
        milhas: oferta.milhas,
        valor: oferta.valor,
        valorPorMilhar: Number(valorPorMilhar.toFixed(2))
      };
    });

    ranking.sort((a, b) => a.valorPorMilhar - b.valorPorMilhar);
    res.status(200).json(ranking);
  } catch (error) {
    console.error("Erro em listarRanking:", error);
    res.status(500).json({ message: "Erro ao buscar ranking de ofertas" });
  }
};

module.exports = {
  salvarOferta,
  listarOfertas,
  listarTodasOfertas,
  updateStatusOferta,
  deletarOferta,
  listarRanking
};

