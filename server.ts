import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

// Configurações das APIs (Vindas da Vercel)
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY! });

// 1. Rota de Verificação do Webhook (Para a Meta aceitar o link)
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
  }
  return res.sendStatus(403);
});

// 2. Rota que recebe as mensagens do WhatsApp
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message?.text?.body) {
      const userPhone = message.from;
      const userText = message.text.body;

      // Aqui você chamaria a sua IA e responderia...
      console.log(`Mensagem de ${userPhone}: ${userText}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro no Webhook:', error);
    res.sendStatus(500);
  }
});

// Rota de teste para ver se o bot está online
app.get('/', (req, res) => {
  res.send('🚀 MKT Reporter Bot está ONLINE na Vercel!');
});

export default app;
