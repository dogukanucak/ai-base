import { SearchTool } from "../tools/SearchTool";

export class UniversityAgent {
  async findPage(query: string) {
    const searchTool = new SearchTool();
    const result = await searchTool.search(query);
    return result;
  }
}
