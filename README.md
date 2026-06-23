# arq-nuvem-trabalho-final
Trabalho final da disciplina de Arquitetura de Computação em Núvem do UniSenac.


## Arquitetura de Solução

links


## Setup

Crie a network do docker para que os serviços se comuniquem com o rabbit:

```bash
docker network create backend
```


## Iniciar Rabbitmq

rode:
```bash
docker compose down -v
docker compose up
```

Para iniciar os microsserviços, confira o `README.md` de cada um deles.
