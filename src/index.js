const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const sha1 = require('sha1');

Promise = require('promise');

const server = express()
server.use(bodyParser.urlencoded({ extended: true }));

function createFile(data) {
  return new Promise((fulfill, reject) => {
    fs.open('answer.json', 'w', function(err, file) {
      if(err) {
          reject();
      } else {
        fulfill(fs.appendFile(file, JSON.stringify(data),'utf-8', err => {
          fs.close(file, (err) => {
            if (err) throw err;
          });
          console.log('Arquivo criado com sucesso');
        }));
      }
    });
  });
}

function decipher() {

  let file = fs.readFileSync('answer.json', 'utf8');

  let jsonData = JSON.parse(file);

  let cipher = jsonData.cifrado;
  let hops = jsonData.numero_casas;

  let text = '';
  let letter = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

  let mod = function (n, m) {
    let remain = n % m;
    return Math.floor(remain >= 0 ? remain : remain + m);
  };
    
  for (let I = 0; I < cipher.length; I++) {
      
    if (letter.indexOf(cipher[I]) >= 0) {
      text = text + letter[mod(letter.indexOf(cipher[I]) - hops,26)];
    } else {
      text = text + cipher[I];
    }
  }

  jsonData.decifrado = text;
  jsonData.resumo_criptografico = sha1(text);

  if (jsonData) {
    fs.writeFile('answer.json', JSON.stringify(jsonData), (err) => {
      if (err) {
        throw err;
      } else {
        console.log('Arquivo salvo com sucesso');
      }
    });
  }
}

async function answer () {
  response = await axios.get('https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=97d02183d5e185cd9f9e3e84e2f5aa2f2a9c54fa');
  createFile(response.data).then((file) => {
    decipher(file);
  });
  
}

server.get('/', (req, res) => {
  answer()
	fs.readFile('./src/index.html', function(err, data){
		if (err){
			res.writeHead(404, {'Content-Type':'text/html'});
			res.write('Not Found');	
		}else {
			res.writeHead(200, {'Content-Type':'text/html'});
			res.write(data);
		}
		res.end();
	})
})

server.listen(3333, () => {
  console.log('Server iniciado')
})