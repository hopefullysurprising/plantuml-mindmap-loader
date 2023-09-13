import { parseMindMap } from "./parseMindMap";

describe('test parsing of PlantUML mind maps', () => {

  it('should throw an error when content is not starting with @startmindmap', () => {
    const invalidContent = `something_invalid`;
    expect(() => {
      parseMindMap(invalidContent);
    }).toThrow();
  });

  it ('should properly parse simple mind map', () => {
    const content = `
      @startmindmap
      * root
      ** child1
      *** grandchild1
      ** child2
      *** grandchild2
      @endmindmap
    `;
    const parsed = parseMindMap(content);
    expect(parsed.label).toBe('root');
    expect(parsed.children.length).toBe(2);
    expect(parsed.children[0].label).toBe('child1');
    expect(parsed.children[0].children.length).toBe(1);
    expect(parsed.children[0].children[0].label).toBe('grandchild1');
  });

});
