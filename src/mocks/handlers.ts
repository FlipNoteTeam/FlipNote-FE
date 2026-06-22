import { http, HttpResponse } from "msw";
import { mockCards } from "./fixtures/cards";

export const handlers = [
  http.get("/api/card-sets/:cardSetId/cards", () => {
    return HttpResponse.json({ success: true, data: mockCards });
  }),
];
