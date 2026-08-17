import { jsonOk } from "@/lib/api/json";
import { publicGet } from "@/lib/api/route";
import { parseSearchParams } from "@/lib/api/schemas";
import { getSearchIndex } from "@/lib/queries/search-index";
import { rankDocuments, suggestCompletions } from "@/lib/search/ranking";

export const GET = publicGet(
  "search",
  async ({ request }) => {
    const { query, limit } = parseSearchParams(request.nextUrl.searchParams);

    if (!query) {
      return jsonOk({ results: [], suggestions: [] });
    }

    const documents = await getSearchIndex();
    return jsonOk(
      {
        results: rankDocuments(documents, query, limit),
        suggestions: suggestCompletions(documents, query),
      },
      { cache: { isDraft: false, maxAge: 300 } },
    );
  },
  { withDraft: false },
);
