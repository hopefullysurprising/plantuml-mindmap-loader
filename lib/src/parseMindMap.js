"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMindMap = void 0;
function parseMindMap(source) {
    const sourceLines = source
        .split('\n')
        .map((line) => line.trim())
        .map((line, index) => ({ text: line, index: index + 1, }))
        .filter((line) => line.text);
    if (sourceLines.length === 0) {
        throw new Error("Empty file for PlantUML mind map. Can't process");
    }
    const firstLineInFile = sourceLines.shift();
    if (!(firstLineInFile === null || firstLineInFile === void 0 ? void 0 : firstLineInFile.text.startsWith('@startmindmap'))) {
        throw new Error("PlantUML mind map should start with '@startmindmap'. Can't process");
    }
    const mindMapLines = sourceLines
        .filter((line) => line.text.startsWith('*'));
    if (mindMapLines.length === 0) {
        throw new Error("PlantUML mind map should contain at least one node. Can't process");
    }
    // Make it tree-structured
    const rootNode = getTreeStructureFromLines(mindMapLines);
    // Get the actually classed tree
    const plantUMLMindMapNode = convertParsedLineToMindMapNode(rootNode);
    return plantUMLMindMapNode;
}
exports.parseMindMap = parseMindMap;
function getTreeStructureFromLines(lines) {
    // Finding the root node
    const rootLine = lines.shift();
    if (!rootLine) {
        throw new Error("No tree nodes found in the mind map content. Can't process");
    }
    const rootNode = {
        index: rootLine.index,
        nestingLevel: 1,
        allText: rootLine.text,
        children: [],
    };
    // Creating a tree with lines alone - no specialization, just text
    let previousNode = rootNode;
    for (const nodeLine of lines) {
        const nestingLevel = getNestingLevelByLine(nodeLine.text);
        let parent = undefined;
        if (nestingLevel > previousNode.nestingLevel) {
            parent = previousNode;
        }
        else if (nestingLevel === previousNode.nestingLevel) {
            parent = previousNode.parent;
        }
        else {
            parent = findParentWithNestingLevel(previousNode, nestingLevel - 1);
        }
        const newNode = {
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
function getNestingLevelByLine(line) {
    const regex = /^(\*+)/;
    // This can iterate over the RegExp but we need the first match only
    const matches = regex.exec(line);
    if (!matches) {
        return 0;
    }
    return matches[0].length;
}
function findParentWithNestingLevel(previousNode, nestingLevel) {
    if (!previousNode.parent) {
        return undefined;
    }
    if (previousNode.parent.nestingLevel === nestingLevel) {
        return previousNode.parent;
    }
    return findParentWithNestingLevel(previousNode.parent, nestingLevel);
}
function convertParsedLineToMindMapNode(node) {
    var _a;
    // Removing the leading asterisks to leave text only
    let lineText = node.allText.replace(/^\*+/g, '').trim();
    // Taking all tags off the string and keep them together
    // (tags are like "#tag" and "#type:question" and so on")
    const regexForTags = /#[a-zA-Z0-9:]+/g;
    const tags = (_a = lineText.match(regexForTags)) !== null && _a !== void 0 ? _a : [];
    lineText = lineText.replace(regexForTags, '').trim();
    return {
        id: node.index,
        label: lineText,
        tags,
        children: node.children.map(convertParsedLineToMindMapNode),
    };
}
