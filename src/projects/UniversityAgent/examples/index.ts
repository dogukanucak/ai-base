// Use the UniversityAgent to find a page

import { UniversityAgent } from "../agents/index";

const universityAgent = new UniversityAgent();

(async () => {
  const result = await universityAgent.findPage("gastronomy");
  console.log(result);
})();
