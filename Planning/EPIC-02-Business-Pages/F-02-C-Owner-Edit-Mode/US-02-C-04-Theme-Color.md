# US-02-C-04: Theme Color

**Feature:** [[F-02-C-Owner-Edit-Mode|F-02-C: Owner Edit Mode]]
**Epic:** [[EPIC-02-Business-Pages|EPIC-02: Business Pages & Services]]
**Status:** 🔲 Not Started

---

## Story
As a **business owner**, I want to **customize my business page's theme color** so that **my page reflects my brand identity**.

## Tasks
- `[BE]` Ensure `ThemeColor` field exists on the Business model and is returned in `BusinessDTO`
- `[BE]` Accept `ThemeColor` in `UpdateBusinessDTO` via `PUT /businesses/{id}`
- `[FE]` Add color picker component in edit mode with a live preview of the selected color
- `[FE]` Apply theme color to buttons, accents, and highlights on the public business page

## Acceptance Criteria
- [ ] Selected color is persisted after saving and survives page refresh
- [ ] Theme color is applied to buttons and accent elements on the public page
- [ ] Live preview updates the page appearance immediately as the color is selected
