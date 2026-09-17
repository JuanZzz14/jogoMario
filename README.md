# Jogo Mario

## Descrição

Jogo de plataforma 2D inspirado no clássico "Mario", desenvolvido em HTML5 Canvas e JavaScript puro. O jogador controla um personagem que deve correr, pular sobre plataformas, desviar ou eliminar inimigos, coletar moedas e alcançar a bandeira ao final de cada fase.

## Objetivo do projeto

Esta atividade tem como objetivo colocar em prática o uso de **Git** e **GitHub** na organização de um projeto de software, exercitando:

- criação e configuração de um repositório;
- organização de diretórios seguindo uma estrutura próxima à de projetos reais;
- uso de branches (`main` e `dev`);
- histórico de commits representando etapas de desenvolvimento;
- integração de código por meio de merge.

O Front-End do Jogo Mario, desenvolvido em atividade anterior, foi organizado dentro deste repositório como o principal artefato de código.

## Tecnologias

- HTML5 (Canvas API)
- CSS3
- JavaScript
- [Vite](https://vitejs.dev/) (servidor de desenvolvimento e build)

## Instalação

```bash
cd frontend
npm install
```

## Execução

```bash
cd frontend
npm run dev
```

Acesse o endereço exibido no terminal (por padrão, `http://localhost:5173`).

### Build de produção

```bash
cd frontend
npm run build
npm run preview
```

## Como jogar

| Tecla | Ação |
|---|---|
| ← / A | Mover para a esquerda |
| → / D | Mover para a direita |
| ↑ / W / Espaço | Pular |
| R | Reiniciar a fase atual |

Pise sobre os inimigos para eliminá-los, colete as moedas pelo caminho e alcance a bandeira para vencer a fase.

## Estrutura do repositório

```
jogoMario/
│
├── backend/                 # reservado para eventual back-end do projeto
│
├── docs/
│   ├── branding/             # identidade visual do projeto
│   ├── mer/                  # modelo Entidade-Relacionamento
│   ├── mockups/               # mockups e protótipos das interfaces
│   ├── models/
│   │   └── uml/               # diagramas UML
│   └── requirements/          # documentos de requisitos
│
├── frontend/                 # código-fonte do Front-End do jogo
│   ├── package.json
│   ├── index.html
│   └── src/
│
├── .gitignore
├── LICENSE
└── README.md
```

## Fluxo de branches

O desenvolvimento é realizado na branch `dev` e, após validado, integrado à branch `main` por meio de merge (Pull Request), conforme o fluxo:

```
dev (commits de desenvolvimento) → merge → main
```

## Integrantes

| Nome | Matrícula | Papel |
|----------------|-----------|---------------|
| [Nome do aluno] | [Matrícula] | Scrum Master |
| [Nome do aluno] | [Matrícula] | Documentador |
| [Nome do aluno] | [Matrícula] | Desenvolvedor |
| [Nome do aluno] | [Matrícula] | Desenvolvedor |
| [Nome do aluno] | [Matrícula] | Testador |

> Atualize esta tabela com os nomes, matrículas e papéis reais dos integrantes do grupo.

## Licença

Este projeto está licenciado sob a licença MIT — consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.
