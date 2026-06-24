# arq-nuvem-trabalho-final
Trabalho final da disciplina de Arquitetura de Computação em Núvem do UniSenac.


## Arquitetura de Solução

links


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

Acesse [Prometheus](http://localhost:9090/) e [Grafana](http://localhost:3000/) por estes links. O endpoint de métricas do Prometheus é `localhost:8000/metrics`

Acesso padrão do grafana:
- usuário: `admin`
- senha: `admin`

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-36-14" src="https://github.com/user-attachments/assets/29bfbf43-cbab-4ce5-9258-f609cbb06301" />


Verifique que o Prometheus encontrou os serviços corretamente, conforme a imagem abaixo:

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-37-01" src="https://github.com/user-attachments/assets/303358a9-39ca-4562-baa9-83554b7a32a2" />


## Setup Grafana

Após acessar o Grafana, vá em Connections > Data Sources e selecione o Prometheus. Então, adicione a URL para conectar-se: `http://prometheus:9090`.

Adicionando o Prometheus
<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-38-41" src="https://github.com/user-attachments/assets/d043d854-7063-4d38-9357-2f09d5cd96ef" />

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-39-14" src="https://github.com/user-attachments/assets/08cfb156-aa34-44a2-9f61-6c77737ce632" />



Dashboards de exemplo no Grafana

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-41-27" src="https://github.com/user-attachments/assets/78c202f3-aad0-43a1-8d2f-63b168dc3687" />

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-57-52" src="https://github.com/user-attachments/assets/5e2ec8d5-e39b-44dc-83b2-3ec6ec256072" />

<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-59-47" src="https://github.com/user-attachments/assets/41628efb-0966-4bd7-a9c8-1d05edd86965" />

