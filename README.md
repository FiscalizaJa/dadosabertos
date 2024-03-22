# 👋 Seja bem-vindo
Esta é a **plataforma de dados abertos do FiscalizaJá**. Um importante passo para o projeto, na direção de possibilitar o acesso ao uso de dinheiro público por nossos políticos.

Sei que para mim é um passo ousado e talvez um pouco maior que a perna, mas, em nome da transparência política, é isso que planejo, disponibilizar os dados gratuitamente, ao fácil acesso e com um **serviço descente** para a população brasileira. Nós pagamos muitos impostos abusivos **e é nosso direito saber como, onde e porquê estão sendo usados**. Se você assim como eu, deseja uma iniciativa maior pela transparência política, seja mais que bem-vindo ao FiscalizaJá!

## ⏱ Prazo para finalização
Não possuo em mente quanto vou finalizar isso, tenho em mente de 4 a 6 meses, não é um trabalho rápido, mas vai valer apena no futuro, eu conto com a comunidade open source para me ajudar 👐.

Sei que nos repositórios antigos, não segui boas práticas e isso dificultou a entrada de novos colaboradores, mas nesse, vou dar o meu melhor para manter as boas práticas, principalmente na questão dos commits e branches. É uma jornada de muito aprendizado também que espero sair daqui com um bom conhecimento e a realização de poder entregar para o povo brasileiro a real transparência política, em que todos possam entender e procurar os valores com facilidade, precisão e confiança.

# 🚀 Qual será a stack do projeto?
Assim como no [FiscalizaJá Deputados](https://github.com/fiscalizaja/fiscalizaja-deputados-rest), a stack usada aqui será:
- Node.js (não, não vou usar Bun, não está estável o suficiente ainda)
- Fastify
- Zod
- PostgreSQL
- Redis

## 🤔 Usar ORM...?
Por mais que ORMs facilitem muito o desenvolvimento, o nível de abstração de um ORM não vai ajudar nesse caso. Eu já sei com o que vou lidar e sei que é muito melhor escrever SQL na unha para lidar com essa altíssima quantidade de dados fora de padrão, com falhas e que maioria é gerada por sistemas legados que foram desenvolvidos antes mesmo de eu nascer. Então, não, não planejo o uso de um ORM.

### 🦅 Possíveis integrações
Algumas limitações que enfrento hoje que podem ser superadas com integrações com plataformas especializadas, uma delas é sobre consultar o CNPJ de fornecedores. Não tem como confiar nos nomes informados nas despesas por um motivo simples:
- Na câmara dos deputados, falo mesmo, EXISTEM ANALFABETOS, digitam o nome da empresa errado, alguns colocam o CPF deles no lugar do nome da empresa, é um CAOS total, se alguém se doer, que se doa mesmo, precisamos votar em gente que ao menos saiba escrever, já é um progresso se isso acontecer.

Dito isso, para consultar CNPJs eu penso em utilizar o [BrasilAPI](https://brasilapi.com.br/), assim podemos ter ainda mais informações sobre a empresa contratada.

# Vamos construir um Brasil melhor, juntos 🙏
A minha ação apartir daqui se intensifica, e eu conto com mais brasileiros inconformados com a realidade desse país para fazer a diferença. Toda ajuda é válida, se você não pode contribuir codificando, pode mostrar o FiscalizaJá para seus familiares e amigos, faça a diferença 👐.

"*Aquele que tem um porquê, supera qualquer como*"