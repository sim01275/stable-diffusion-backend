const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-shopify-access-token']
}));

app.use(express.json());

// Route de test simple
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.json({ message: 'API is working!' });
  }
  
  if (req.method === 'POST') {
    const { prompt, style, animalType } = req.body;

    try {
      const enhancedPrompt = `${animalType} pet, ${prompt}, ${style}, high quality, detailed, professional photo`;

      const response = await axios.post(       
        'https://api.replicate.com/v1/predictions',
        {
          version: 'stable-diffusion-xl-1024-v1-0',
          input: {
            prompt: enhancedPrompt,
            negative_prompt: "blurry, bad anatomy, distorted, deformed",
            num_inference_steps: 50,
            guidance_scale: 7.5
          },
        },
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // ... reste du code de génération d'image ...

      res.json({ imageUrl });
    } catch (error) {
      console.error('Erreur:', error.message);
      res.status(500).json({ error: 'Erreur lors de la génération d\'image.' });
    }
  }
};