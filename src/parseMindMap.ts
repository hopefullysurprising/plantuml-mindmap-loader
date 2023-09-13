import { PlantUMLMindMapNode } from '../index';

interface ParsedMindMapLine {
  index: number;
  nestingLevel: number;
  allText: string;
  parent?: ParsedMindMapLine;
  children: ParsedMindMapLine[];
}

export function parseMindMap(source: string): PlantUMLMindMapNode {

  const sourceLines = source
    .split('\n')
    .map((line) => line.trim())
    .map((line, index) => ({ text: line, index: index + 1, }))
    .filter((line) => line.text);

  if (sourceLines.length === 0) {
    throw new Error("Empty file for PlantUML mind map. Can't process");
  }

  const firstLineInFile = sourceLines.shift();
  if (!firstLineInFile || !firstLineInFile.text.startsWith('@startmindmap')) {
    throw new Error("PlantUML mind map should start with '@startmindmap'. Can't process");
  }

  const mindMapLines = sourceLines
    .filter((line) => line.text.startsWith('*'));
  if (mindMapLines.length === 0) {
    throw new Error("PlantUML mind map should contain at least one node. Can't process");
  }

  // Make it tree-structured
  const rootNode: ParsedMindMapLine = getTreeStructureFromLines(mindMapLines);

  // Get the actually classed tree
  const plantUMLMindMapNode = convertParsedLineToMindMapNode(rootNode);

  return plantUMLMindMapNode;
}

function getTreeStructureFromLines(
  lines: { index: number; text: string; }[],
): ParsedMindMapLine {

  // Finding the root node
  const rootLine = lines.shift();
  if (!rootLine) {
    throw new Error("No tree nodes found in the mind map content. Can't process");
  }

  const rootNode: ParsedMindMapLine = {
    index: rootLine.index,
    nestingLevel: 1,
    allText: rootLine.text,
    children: [],
  };

  // Creating a tree with lines alone - no specialization, just text
  let previousNode = rootNode;
  for (const nodeLine of lines) {
    const nestingLevel = getNestingLevelByLine(nodeLine.text);
    let parent: ParsedMindMapLine | undefined = undefined;
    if (nestingLevel > previousNode.nestingLevel) {
      parent = previousNode;
    } else if (nestingLevel === previousNode.nestingLevel) {
      parent = previousNode.parent;
    } else {
      parent = findParentWithNestingLevel(previousNode, nestingLevel - 1);
    }
    const newNode: ParsedMindMapLine = {
      index: nodeLine.index,
      nestingLevel,
      allText: nodeLine.text,
      parent,
      children: [],
    };
    if (parent) {
      parent.children.push(newNode);
    }
    previousNode = newNode;
  }

  return rootNode;
}

function getNestingLevelByLine(line: string): number {
  const regex = /^(\*+)/;
  const matches = line.match(regex);
  return (matches && matches[1]) ? matches[1].length : 0;
}

function findParentWithNestingLevel(
  previousNode: ParsedMindMapLine,
  nestingLevel: number,
): ParsedMindMapLine | undefined {
  if (!previousNode.parent) { return undefined; }
  if (previousNode.parent.nestingLevel === nestingLevel) {
    return previousNode.parent;
  }
  return findParentWithNestingLevel(previousNode.parent, nestingLevel);
}

function convertParsedLineToMindMapNode(node: ParsedMindMapLine): PlantUMLMindMapNode {

  // Removing the leading asterisks to leave text only
  let lineText = node.allText.replace(/^\*+/g, '').trim();

  // Taking all tags off the string and keep them together
  // (tags are like "#tag" and "#type:question" and so on")
  const regexForTags = /#[a-zA-Z0-9:]+/g;
  const tags = lineText.match(regexForTags) || [];
  lineText = lineText.replace(regexForTags, '').trim();

  return {
    id: node.index,
    label: lineText,
    tags,
    children: node.children.map(convertParsedLineToMindMapNode),
  };
}
