# ✨ Funções para o FiscalizaBot.
Uma forma responsável de implementar um LLM para informar é utilizar `function calling`, que são "funções" que o modelo decide chamar para obter informações. Isso significa que, para o modelo saber quais dados e sobre o FiscalizaJá, não precisamos fazer `fine-tuning` que seria caro, lento e muito difícil de ensinar o modelo.

Decidi fazer funções separadas das funções utilizadas pela API pois não podemos simplesmente tacar os dados, é necessário lembrar que um LLM é MUITO pesado para rodar e precisamos trabalhar com dados limitados.

## 👌 Adicionando novas funções
Todos os arquivos aqui serão carregados automaticamente e devem exportar uma função como default, é só você criar uma tool com o mesmo nome do arquivo em `instructions.ts` que, quando o modelo chamar, ela será usada.