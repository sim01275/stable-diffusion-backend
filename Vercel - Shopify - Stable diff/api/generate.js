const axios = require('axios');

module.exports = async (req, res) => {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route de test GET
  if (req.method === 'GET') {
    return res.json({ message: 'API is working!' });
  }

  // Route principale POST
  if (req.method === 'POST') {
    try {
      const { prompt, style, animalType } = req.body;
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
          }
        },
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.json(response.data);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ 
        error: 'Error generating image',
        details: error.message 
      });
    }
  }

  // Méthode non supportée
  return res.status(405).json({ error: 'Method not allowed' });
};