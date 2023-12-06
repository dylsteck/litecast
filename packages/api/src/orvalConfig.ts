import defineConfig from 'orval';

defineConfig({
  hooks: {
    afterAllFilesWrite: 'eslint --fix',
  },
  input: {
    target: 'src/__generated__/openapi.json',
  },
  output: {
    mode: 'single',
    override: {
      mutator: {
        name: 'customClient',
        path: 'src/mutator.ts',
      },
      requestOptions: true,
      useDates: true,
    },
    prettier: true,
    target: 'src/__generated__/APISpecification.generated.ts',
  },
});
