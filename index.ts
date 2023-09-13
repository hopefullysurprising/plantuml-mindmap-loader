import { validate } from 'schema-utils';
import { LoaderContext } from 'webpack';

import { parseMindMap } from './src/parseMindMap';

interface LoaderProperties {
  test: string;
}

const schema = {
  type: 'object' as 'object', // `as` is for making the type match `JSONSchema7`
  properties: {
    test: {
      type: 'string' as 'string',  // `as` is for making the type match `JSONSchema7`
    },
  },
};

// Should match the definition in index.d.ts
export interface PlantUMLMindMapNode {
  id: number; // Number of the line in the file
  label: string;
  tags: string[];
  children: PlantUMLMindMapNode[];
}

export default function (this: LoaderContext<LoaderProperties>, source: string): string {
  const options = this.getOptions();

  validate(schema, options, {
    name: 'plantuml-mindmap-loader',
    baseDataPath: 'options',
  });

  const result = parseMindMap(source);

  return `export default ${JSON.stringify(result)};`;
}
