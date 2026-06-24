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

Acesse [Prometheus](http://localhost:9090/) e [Grafana](http://localhost:3000/) por estes links. O endpoint de métricas do Prometheus é `localhost:8000/metrics`.

Acesso padrão do grafana:
- usuário: `admin`
- senha: `admin`

imagem_de_exemplo_login

Verifique que o Prometheus encontrou o serviço corretamente, conforme a imagem abaixo
<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/097b005a-717a-48ed-aa4f-0ae44b2d67be" />


## Setup Grafana

Após acessar o Grafana, vá em Connections > Data Sources e selecione o Prometheus. Então, adicione a URL para conectar-se: `http://prometheus:9090`.

Adicionando o Prometheus
<img width="1280" height="720" alt="Captura de tela de 2026-06-23 21-25-35" src="https://github.com/user-attachments/assets/fb6c0ad3-f581-4174-8902-3088edd5ea4b" />



Dashboard de exemplo Grafana
<img width="1280" height="720" alt="Captura de tela de 2026-06-23 20-50-57" src="https://github.com/user-attachments/assets/cff95455-8e31-45a0-a0b2-5cd669aa9ede" />
