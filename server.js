const express = require('express');
const path = require('path');
const app = express();

// Middleware para servir arquivos estáticos da pasta 'dist/kudondza-frontend'
app.use(express.static(path.join(__dirname, 'dist/post-app')));

// Rota padrão para servir o arquivo index.html para qualquer rota não tratada
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/post-app/index.html'), function(err) {
    if (err) {
      // Se houver um erro ao enviar o arquivo, envie uma resposta de erro 500
      res.status(500).send(err);
    }
  });
});

const PORT = process.env.PORT || 4200;

// Inicia o servidor
app.listen(PORT, () => {
console.log(`Servidor Express iniciado com sucesso. Aguardando solicitações na porta ${PORT}`);
});


// ng build --configuration=production
// ng build
// node server.js