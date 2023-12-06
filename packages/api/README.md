# [Api] Available commands

- `writeOpenapi`: Write openapi.json file from next.js local server
- `postwriteOpenapi`: Format the code using ESLint 
- `dev`: Generate API from openapi.json for development
- `build`: Generate API from openapi.json for production
- `lint`: Lints the code using ESLint
- `clean`: Clear build outputs

# Swagger UI
After running local server, if you type [http://localhost:3000/swagger](http://localhost:3000/swagger) URL in 
browser you could see swagger page

# Troubleshooting

<details>
<summary>[ERROR] Could not resolve "./__generated__/APISpecification.generated"</summary>
<p>

This `api` package generates code from route handler of next.js,
so you'd better run next.js development server before you generate codes

```shell
   yarn dev
   yarn workspace api generate:orval:dev
```

</p>
</details>
