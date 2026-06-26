# arq-nuvem-trabalho-final
Trabalho final da disciplina de Arquitetura de Computação em Núvem do UniSenac.


## Arquitetura de Solução

links


## Tecnologias utilizadas

- Frontend: Typescript com React
- Backend: Python com FastAPI
- API Gateway local: Nginx
- Monitoramento: Prometheus e Grafana
- Documentação: OpenAPI

## Setup

Crie a network do docker para que os serviços se comuniquem com o rabbit:

```bash
docker network create backend
```


## Iniciar Serviços Essenciais

Para iniciar o RabbitMQ, Prometheus e Grafana, rode:
```bash
docker compose down -v
docker compose up
```

Para iniciar os microsserviços, confira o `README.md` de cada um deles.


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

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-41-27" src="https://github.com/user-attachments/assets/78c202f3-aad0-43a1-8d2f-63b168dc3687" />

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-57-52" src="https://github.com/user-attachments/assets/5e2ec8d5-e39b-44dc-83b2-3ec6ec256072" />

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-59-47" src="https://github.com/user-attachments/assets/41628efb-0966-4bd7-a9c8-1d05edd86965" />


## Logs da aplicação

logs do customer-service rodando e enviando mensagens para o content-service via rabbitmq:

<img width="3072" height="1856" alt="image" src="https://github.com/user-attachments/assets/684dc642-915a-4d44-ae24-97d8ad306fae" />

logs do content-service recebendo as mensagens:

<img width="3072" height="1856" alt="image" src="https://github.com/user-attachments/assets/5acbd393-e78c-479f-ba9e-028bc5a9fb49" />


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
