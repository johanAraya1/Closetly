import { queryKeys } from "@/constants/queryKeys";

describe("query keys", () => {
  it("keeps feed and closet caches separated", () => {
    expect(queryKeys.garments).not.toEqual(queryKeys.exploreGarments);
  });
});
