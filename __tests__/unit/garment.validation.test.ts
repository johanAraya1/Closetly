import { garmentMetadataSchema } from "@/features/closet/validations/garment.validation";

describe("garment metadata validation", () => {
  it("defaults private visibility", () => {
    const parsed = garmentMetadataSchema.parse({});
    expect(parsed.visibility).toBe("private");
    expect(parsed.allow_sale).toBe(false);
  });
});
