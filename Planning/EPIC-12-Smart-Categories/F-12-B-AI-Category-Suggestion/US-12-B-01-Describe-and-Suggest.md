# US-12-B-01: Describe Service and Get AI Category Suggestions

**Feature:** [[F-12-B-AI-Category-Suggestion|F-12-B: AI-Assisted Category Suggestion]]
**Epic:** [[EPIC-12-Smart-Categories|EPIC-12: Smart Categories]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner who can't find their category**, I want to **describe my service in plain text and get AI-suggested categories from the existing list** so that **I can find the best fit without creating duplicates**.

## Tasks
- `[BE]` Add `POST /categories/suggest` endpoint accepting `{ description: string }` from an authenticated business owner
- `[BE]` Call the Anthropic API (Claude Haiku) with a prompt: given the owner's description + the full list of existing category names, return up to 3 best-matching category names from the list (no hallucination — only existing categories)
- `[BE]` Return the matched category objects (id + name + icon) to the frontend
- `[BE]` Keep the AI call minimal — use a short, focused prompt to stay within free-tier usage
- `[FE]` When "Can't find your category?" is clicked, show a text area: "Describe what your service does"
- `[FE]` Submit button calls the suggest endpoint
- `[FE]` Show the top 3 suggested categories as selectable chips
- `[FE]` Owner selects one → it is used as their category
- `[FE]` If none of the suggestions match, show "None of these fit → Request a new category" button leading to US-12-B-02

## Acceptance Criteria
- [ ] Owner can type a description and receive up to 3 category suggestions
- [ ] Suggestions only include categories that already exist in the database — no invented categories
- [ ] Selecting a suggestion saves it as the category correctly
- [ ] "None of these fit" option is available after suggestions are shown
- [ ] AI call fails gracefully — if the API is unavailable, the owner can still pick manually from the full list
