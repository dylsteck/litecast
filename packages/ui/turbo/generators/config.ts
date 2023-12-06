import { PlopTypes } from '@turbo/gen';

// Learn more about Turborepo Generators at https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // A simple generator to add a new React component to the internal UI library
  plop.setGenerator('react-component', {
    actions(data) {
      const actions = [];

      if (!data) {
        throw 'something went wrong';
      }

      if (data.componentType === 'server') {
        actions.push({
          path: 'src/{{camelCase name}}.tsx',
          templateFile: 'templates/serverComponent.hbs',
          type: 'add',
        });
        actions.push({
          path: 'index.tsx',
          pattern: /(\/\/ server component exports)/g,
          template: 'export * from "./src/{{camelCase name}}";',
          type: 'append',
        });
      } else {
        actions.push({
          path: 'src/{{camelCase name}}.tsx',
          templateFile: 'templates/clientComponent.hbs',
          type: 'add',
        });
        actions.push({
          path: 'index.tsx',
          pattern: /(\/\/ client component exports)/g,
          template: 'export * from "./src/{{camelCase name}}";',
          type: 'append',
        });
      }

      return actions;
    },
    description: 'Adds a new react component',
    prompts: [
      {
        message: 'What is the name of the component?',
        name: 'name',
        type: 'input',
      },
      {
        choices: ['server', 'client'],
        name: 'componentType',
        type: 'list',
      },
    ],
  });
}
