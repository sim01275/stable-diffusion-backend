require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.SHOP_URL,
  methods: ['GET', 'POST'],
  credentials: true
}));


// Middleware de vérification Shopify simplifié
const verifyShopifyWebhook = async (req, res, next) => {
    // Récupère le token depuis les headers de la requête
    const accessToken = req.headers['x-shopify-access-token'];
    
    // Vérifie si le token correspond à votre SHOPIFY_API_SECRET
    if (accessToken !== process.env.SHOPIFY_API_SECRET) {
      return res.status(401).json({ 
        error: 'Non autorisé',
        message: 'Token d\'accès invalide ou manquant'
      });
    }
    
    // Si le token est valide, continue vers la route
    next();
  };
  
// Route pour la génération d'image
app.post('/api/generate-image', verifyShopifyWebhook, async (req, res) => {
  const { prompt, style, animalType } = req.body;

  try {
    // Création d'un prompt optimisé pour les animaux
    const enhancedPrompt = `${animalType} pet, ${prompt}, ${style}, high quality, detailed, professional photo`;

    const response = await axios.post(       
      'https://api.replicate.com/v1/predictions',
      {
        version: 'stable-diffusion-xl-1024-v1-0', // Version recommandée pour SDXL
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

    // Attendre que l'image soit générée
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (!imageUrl && attempts < maxAttempts) {
      const checkResult = await axios.get(response.data.urls.get, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (checkResult.data.status === 'succeeded') {
        imageUrl = checkResult.data.output[0];
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!imageUrl) {
      throw new Error('Délai de génération d'image dépassé');
    }

    res.json({ imageUrl });
  } catch (error) {
    console.error('Erreur:', error.message);
    res.status(500).json({ error: 'Erreur lors de la génération d\'image.' });
  }
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue!' });
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});