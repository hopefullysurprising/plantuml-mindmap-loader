declare module '*.mindmap.puml' {

  // Should match the definition in index.ts
  export interface PlantUMLMindMapNode {
    id: number; // Number of the line in the file
    label: string;
    tags: string[];
    children: PlantUMLMindMapNode[];
  }

  const content: PlantUMLMindMapNode;
  export default content;
}
