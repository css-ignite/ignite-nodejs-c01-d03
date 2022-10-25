# Ignite - Trilha NodJS - Chapter I - Desafio 03 - Corrigindo o código

## Sobre o desafio

Nesse desafio, temos uma aplicação Node.js que está em processo de desenvolvimento mas que já possui os testes necessários para fazer toda a validação dos requisitos (você não deve mexer nos testes).
Após algumas alterações no código da aplicação, parte dos testes deixaram de passar e agora só você pode resolver esse problema. Bora lá? 🚀

Essa aplicação realiza o CRUD (**C**reate, **R**ead, **U**pdate, **D**elete) de repositórios de projetos. Além disso, é possível dar likes em repositórios cadastrados, aumentando a quantidade de likes em 1 a cada vez que a rota é chamada.

A estrutura de um repositório ao ser criado é a seguinte:

```jsx
{
  id: uuid(),
  title,
  url,
  techs,
  likes: 0
}
```

Descrição de cada propriedade:

- **id** deve ser um uuid válido;
- **title** é o título do repositório (por exemplo "unform");
- **url** é a URL que aponta para o repositório (por exemplo "[https://github.com/unform/unform](https://github.com/unform/unform)");
- **techs** é um array onde cada elemento deve ser uma string com o nome de uma tecnologia relacionada ao repositório (por exemplo: ["react", "react-native", "form"]);
- **likes** é a quantidade de likes que o repositório recebeu (e que vai ser incrementada de 1 em 1 a cada chamada na rota de likes).

Note que a quantidade de likes deve sempre ser zero no momento de criação.

## Correções no Código

### Criação do Middleware para verificar se existe um repository

- Aqui eu crio um middleware para verificar se existe um repositório com o id passado na rota. Caso não exista, retorna um erro, caso exista, passa para o próximo middleware ou código enviando o `repositoryIndex` para utilização.

```js
function middlewareFindRepositoryByIndex(request, response, next){
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );

  if (repositoryIndex < 0) {
    return response.status(404).json({ 
      error: "Repository not found." 
    });
  }

  request.repositoryIndex = repositoryIndex;

  return next();

}
```

### Ajustes na rota `(POST)/repositories`

- Adicionado o comando para incluir o objeto `repository` no array `repositories`.

```js
app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  /*
    A correção ocorreu aqui!
    Esta linha não existia no código original.
  */

  repositories.push(repository);

  return response.json(repository);
});
```

### Ajustes na rota `(PUT)/repositories/{id}`

- Adicionado o middleware `middlewareFindRepositoryByIndex` para verificar se existe um repositório com o id passado na rota. Caso não exista, retorna um erro, caso exista, passa para o próximo middleware ou código enviando o `repositoryIndex` para utilização.
- Remoção do código antigo que buscava o repositório pelo id passado na rota.
- Ajustado código para utilizar o `repositoryIndex` passado pelo middleware `middlewareFindRepositoryByIndex`.
- Removido código que fazia o update de todo o objeto `repository` e adicionado código que faz o update preservando o valor de `likes` do objeto `repository`.

```js
app.put("/repositories/:id", middlewareFindRepositoryByIndex, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const { repositoryIndex } = request;

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositoryIndex].likes,
  };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});
```

### Ajustes na rota `(DELETE)/repositories/{id}`

- Adicionado o middleware `middlewareFindRepositoryByIndex` para verificar se existe um repositório com o id passado na rota. Caso não exista, retorna um erro, caso exista, passa para o próximo middleware ou código enviando o `repositoryIndex` para utilização.
- Remoção do código antigo que buscava o repositório pelo id passado na rota.
- Ajustado código para utilizar o `repositoryIndex` passado pelo middleware `middlewareFindRepositoryByIndex`.

```js
app.delete("/repositories/:id", middlewareFindRepositoryByIndex, (request, response) => {
  const { repositoryIndex } = request;

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});
```

### Ajustes na rota `(POST)/repositories/{id}/like`

- Adicionado o middleware `middlewareFindRepositoryByIndex` para verificar se existe um repositório com o id passado na rota. Caso não exista, retorna um erro, caso exista, passa para o próximo middleware ou código enviando o `repositoryIndex` para utilização.
- Remoção do código antigo que buscava o repositório pelo id passado na rota.
- Ajustado código para utilizar o `repositoryIndex` passado pelo middleware `middlewareFindRepositoryByIndex`.
- Ajustado retorno da rota para enviar um objeto `repository` com o valor de `likes` incrementado em 1 no formato JSON.

```js
app.post("/repositories/:id/like", middlewareFindRepositoryByIndex, (request, response) => {
  const { repositoryIndex } = request;

  const likes = ++repositories[repositoryIndex].likes;

  return response.json({ likes: likes });
});
```