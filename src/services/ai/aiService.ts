import OpenAI from 'openai';

// TODO: Configurar chave de API via variável de ambiente
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

let openai: OpenAI | null = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Habilitar uso no frontend (apenas para MVP/Demo)
  });
}

/**
 * Sanitiza o texto removendo informações sensíveis como CPF antes de enviar para IA.
 * LGPD Compliance.
 */
const sanitizeText = (text: string): string => {
  // Remove CPF (formato 123.456.789-00 ou 12345678900)
  return text.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF REMOVIDO]');
};

export const enhanceComplaintText = async (text: string): Promise<string> => {
  if (!openai) {
    console.warn('OpenAI API Key não configurada.');
    return text; // Fallback: retorna o texto original
  }

  const sanitized = sanitizeText(text);

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente jurídico especializado em defesa do consumidor. Sua tarefa é reescrever o relato do consumidor para torná-lo mais claro, objetivo e formal, corrigindo erros gramaticais e melhorando a estrutura, sem alterar o sentido original dos fatos.'
        },
        { role: 'user', content: sanitized }
      ],
      model: 'gpt-3.5-turbo',
    });

    return completion.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Erro ao processar texto com IA:', error);
    throw new Error('Falha na comunicação com o serviço de IA.');
  }
};
