# Arquitetura de Computação em Núvem - Trabalho final
Trabalho final da disciplina de Arquitetura de Computação em Núvem do UniSenac.


## Arquitetura de Solução

### Diagrama cenário ideal - produção
Este diagrama mostra o cenário ideal para produção, com algumas ferramentas que não conseguimos implementar de verdade, como um cluster Kubernetes real, um linkerd como service-mesh e estruturas como WAF e CDN. 

<img width="980" height="1900" alt="diagrama_ideal" src="https://github.com/user-attachments/assets/47cd444d-fc84-4cd1-9731-70fbaeb15abc" />

### Diagrama do projeto - implementado
A imagem abaixo mostra como o projeto final ficou estruturado de forma real. As ferramentas demonstradas estão presentes no projeto.
<img width="980" height="1580" alt="diagrama_projeto" src="https://github.com/user-attachments/assets/c7689aad-503b-443a-904f-c2b7e16a753d" />

### Diagrama arquitetura AWS
O diagrama abaixo mostra como ficaria a arquitetura do projeto rodando na infraestrutura da AWS, com uma núvem privada, zonas de disponibilidade e réplicas das instâncias em EC2s.

<img width="660" height="740" alt="diagrama_aws" src="https://github.com/user-attachments/assets/f56c4efc-8aca-4ac4-82de-871cd299ccd9" />

### Diagrama backend e frontend
Este diagrama foi feito para organizar o desenvolvimento do projeto, organizando quais dados o frontend vai consumir do backend. Ele reflete o estado final do projeto.

<img width="2741" height="3668" alt="diagrama_backend_frontend" src="https://github.com/user-attachments/assets/14d7f46d-33f6-4ffc-82a4-73dee288ca26" />

---

## Tecnologias utilizadas

- **Frontend**: Typescript com React
- **Backend**: Python com FastAPI
- **API Gateway**: Nginx
- **Monitoramento**: Prometheus e Grafana
- **Documentação**: OpenAPI

# Setup

Crie a network do docker para que os serviços se comuniquem com o rabbit:

```bash
docker network create backend
```


## Iniciar Serviços

Para iniciar os microsserviços, rode `docker compose up` no diretório raiz deles `customer-service` e `content-service`.
Confira o `README.md` de cada um deles para mais informações.


Depois de iniciar os microsserviços, inicie o Nginx, RabbitMQ, Prometheus e Grafana, com os comandos:
```bash
docker compose down -v
docker compose up
```

por fim, inicie o frontend no diretório `app` com os comandos:
```bash
npm i
npm run dev
```

## Troubleshooting

Caso dê erro para conectar o gateway nos serviços, tente reiniciar os containers dos microsserviços:
```bash
docker restart <id_container>
```

---

## Monitoramento

Acesse [Prometheus](http://localhost:9090/) e [Grafana](http://localhost:3000/) por estes links. O endpoint de métricas do Prometheus é `localhost:8000/metrics`.

E acesse o dashboard do [RabbitMQ](http://localhost:15672/) por este link.

Acesso padrão do grafana:
- usuário: `admin`
- senha: `admin`

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-36-14" src="https://github.com/user-attachments/assets/29bfbf43-cbab-4ce5-9258-f609cbb06301" />


Verifique que o Prometheus encontrou os serviços corretamente, conforme a imagem abaixo:

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-37-01" src="https://github.com/user-attachments/assets/303358a9-39ca-4562-baa9-83554b7a32a2" />


## Setup Grafana

Após acessar o Grafana, vamos adicionar o data source do Prometheus. Vá em Connections > Data Sources e selecione o Prometheus. Clique em **Add new data source**. Então, adicione a URL para conectar-se: `http://prometheus:9090`.

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-38-41" src="https://github.com/user-attachments/assets/d043d854-7063-4d38-9357-2f09d5cd96ef" />

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-39-14" src="https://github.com/user-attachments/assets/08cfb156-aa34-44a2-9f61-6c77737ce632" />



## Dashboards de exemplo no Grafana

<img width="1280" height="720" alt="Captura de tela de 2026-06-26 23-56-05" src="https://github.com/user-attachments/assets/32ff227c-41e9-4c67-9061-d01598996b2c" />

<img width="1280" height="720" alt="Captura de tela de 2026-06-26 23-56-13" src="https://github.com/user-attachments/assets/264fedee-0256-4c00-a698-81eba0ce4051" />

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-59-47" src="https://github.com/user-attachments/assets/41628efb-0966-4bd7-a9c8-1d05edd86965" />

<img width="3072" height="1856" alt="Captura de tela de 2026-06-26 12-42-18" src="https://github.com/user-attachments/assets/8607eeeb-14ac-4165-be19-af5048d03cba" />


## Logs da aplicação

logs do customer-service rodando e enviando mensagens para o content-service via rabbitmq:

<img width="3072" height="1856" alt="image" src="https://github.com/user-attachments/assets/684dc642-915a-4d44-ae24-97d8ad306fae" />

Usuários realizando login
<img width="3072" height="1856" alt="Captura de tela de 2026-06-26 12-33-56" src="https://github.com/user-attachments/assets/215a94e1-3ea4-48dd-bdd5-05fb751e4804" />



logs do content-service recebendo as mensagens:

<img width="3072" height="1856" alt="image" src="https://github.com/user-attachments/assets/5acbd393-e78c-479f-ba9e-028bc5a9fb49" />

<img width="3072" height="1856" alt="Captura de tela de 2026-06-26 15-56-30" src="https://github.com/user-attachments/assets/cfae4c48-a4d3-4a6e-96e9-0b1f6b964530" />


## Dashboard RabbitMQ

Envio das mensagens na fila de exemplo:

<img width="3072" height="1856" alt="image" src="https://github.com/user-attachments/assets/5a3f8f7c-5c25-4dab-98cd-ae80bf3fe32d" />

Conexões ativas no RabbitMQ - customer-service e content-service:
<img width="3072" height="1856" alt="image" src="https://github.com/user-attachments/assets/87f4d33d-c0ce-4e4e-8264-fac1b44315c5" />


## Exemplos de chamadas

Abaixo seguem exemplos de chamadas utilizando o API Gateway do nginx:


Registro (customer-service):
```
curl --location 'http://localhost/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user4@example.com",
  "password": "string",
  "is_active": true,
  "is_superuser": false,
  "is_verified": false,
  "image_url": "foo.png",
  "bio": "salveee",
  "name": "Lorenzo"
}'
```

Retornar dados do usuário autenticado (content-service):
```
curl --location 'http://localhost/api/users/me' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZTY5N2FmZS1lM2MyLTRlZGUtYmQyZS0wOTZkM2VjZGFmZDgiLCJhdWQiOlsiZmFzdGFwaS11c2VyczphdXRoIl19.v4u0-WcjSQezJ-NZKLRvvHEqF7VbB5BiMtpG2q1MRNY'
```


Retornar posts do feed (content-service):

```
curl --location 'http://localhost/api/content/posts'
```


