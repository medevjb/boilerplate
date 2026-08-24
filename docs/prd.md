# Backend PRD — AI Personalized Pet Storybook

**Version:** 5.0
**Scope:** Backend only
**Backend:** PHP Laravel
**Database:** PostgreSQL
**Queue:** Redis + Laravel Horizon
**Storage:** Private S3-compatible storage
**Story AI:** OpenAI Responses API — GPT-5.6 Terra
**Fallback:** GPT-5.6 Sol
**Image Generation:** GPT Image 2
**HTML Rendering:** Laravel Blade
**PDF Rendering:** Headless Chromium / Browsershot

---

# 1. Product Goal

The backend generates a personalized illustrated storybook from customer pet information and reference photos.

The book contains **more than 15 story pages**.

MVP configuration:

```json
{
  "story_page_count": 16,
  "preview_page_count": 3,
  "age_min": 4,
  "age_max": 8,
  "language": "en"
}
```

The architecture must support larger books later without changing the generation workflow.

Core responsibility:

```text
OpenAI
→ pet analysis
→ story
→ scenes
→ image prompts
→ illustrations

Laravel
→ validation
→ business rules
→ payment gate
→ queues
→ layouts
→ persistence
→ versioning
→ preview
→ PDF
```

---

# 2. Final Business Flow

```text
STEP 01
Store pet details + reference photos
        ↓
STEP 02
Queue generation
        ↓
STEP 03
Analyze pet using OpenAI
        ↓
STEP 04
Generate COMPLETE Book Blueprint JSON
for all 16+ pages
        ↓
STEP 05
Validate Blueprint
        ↓
STEP 06
Assign layouts to all pages
        ↓
STEP 07
Generate illustrations for pages 1–3 only
        ↓
STEP 08
Create 3-page customer preview
        ↓
STEP 09
Customer chooses whether to purchase
        ↓
 ┌──────┴────────┐
 │               │
Not Paid       Payment Verified
 │               │
STOP            ↓
          Generate pages 4–N
                  ↓
          Full HTML book ready
                  ↓
          Customer may modify
          individual pages
                  ↓
          Customer requests PDF
                  ↓
          Queue PDF generation
                  ↓
              PDF Ready
```

---

# 3. Architecture Rules

1. OpenAI work must run through queues.
2. `/generate` returns `202 Accepted`.
3. The complete story Blueprint is generated before preview images.
4. Only preview pages 1–3 are illustrated before payment.
5. Pages 4–N remain locked until payment is verified server-side.
6. Unpaid customers must not receive hidden story text, prompts, or assets for pages 4–N through APIs.
7. Layout is selected before illustration generation.
8. Each page illustration is an independent queue job.
9. Payment starts generation of remaining pages; it must not regenerate preview pages.
10. A customer can request changes to an individual page without regenerating the entire book.
11. HTML preview and PDF use the same Blade/CSS layouts.
12. PDF is generated only on customer request.
13. Completed AI work must be reused whenever possible.

---

# 4. Phase 1 — Store Book Input

Customer data:

```json
{
  "pet": {
    "name": "Charlie",
    "type": "dog",
    "personality_traits": [
      "playful",
      "adventurous",
      "curious"
    ],
    "description": "Charlie loves chasing butterflies.",
    "photo_ids": [
      "photo_01",
      "photo_02",
      "photo_03"
    ]
  },

  "story": {
    "theme": "adventure",
    "setting": "enchanted_forest",
    "dedication": "For Charlie."
  },

  "visual": {
    "style": "soft_watercolor_storybook"
  }
}
```

Pet photos:

```text
minimum: 3
maximum: 8
```

Supported:

```text
JPEG
PNG
WEBP
```

Laravel validates:

* MIME
* image decoding
* file size
* dimensions
* ownership

---

# 5. API — Create Book

```http
POST /api/books
```

Responsibilities:

* Validate input
* Verify pet-photo ownership
* Create book
* Store configuration
* Return draft

It does not call OpenAI.

Response:

```json
{
  "book_id": "book_123",
  "status": "draft"
}
```

---

# 6. API — Start Preview Generation

```http
POST /api/books/{book}/generate
```

Responsibilities:

1. Authorize customer.
2. Validate complete book configuration.
3. Prevent duplicate active generation.
4. Create generation record.
5. Dispatch `AnalyzePetReferencesJob`.
6. Return immediately.

Response:

```http
202 Accepted
```

```json
{
  "generation_id": "gen_456",
  "status": "queued"
}
```

---

# 7. Phase 2 — Pet Analysis

Job:

```text
AnalyzePetReferencesJob
```

Queue:

```text
book-content
```

Output:

```json
{
  "species": "dog",

  "size_category": "medium",

  "coat": {
    "primary_color": "golden",
    "pattern": "mostly uniform",
    "texture": "medium-length fluffy fur"
  },

  "face": {
    "muzzle": "lighter golden muzzle",
    "eyes": "dark brown",
    "ears": "floppy"
  },

  "distinctive_features": [
    "lighter muzzle",
    "feathery ears"
  ]
}
```

The original pet photos remain authoritative.

---

# 8. Pet Analysis Prompt

```text
You are a visual-reference analyst for a personalized children's storybook.

Analyze the supplied photographs of the same pet.

Create a concise identity profile that will help later illustration generation preserve the exact pet.

Describe only visually supported characteristics.

Do not invent uncertain details.
Do not infer personality.
Do not infer health or medical conditions.
Do not guess an exact breed when uncertain.

Focus on:

- species
- approximate size
- coat colors
- coat pattern
- fur texture
- face
- muzzle
- eyes
- ears
- tail
- body proportions
- distinctive visible markings

Return only data matching the provided JSON schema.
```

---

# 9. Phase 3 — Generate Complete Book Blueprint

Job:

```text
GenerateBookBlueprintJob
```

Queue:

```text
book-content
```

The AI generates the **entire book**, including pages that have not yet been purchased.

For a 16-page book:

```text
Story JSON:
pages 1–16 generated

Images before payment:
pages 1–3 generated

Images after payment:
pages 4–16 generated
```

This avoids changing the story after the customer has already previewed its opening.

---

# 10. Blueprint Contents

The Book Blueprint contains:

* Title
* Story summary
* Character bible
* Supporting characters
* Prop continuity
* Environment continuity
* Full story page text
* Narrative information
* Scene information
* Continuity information
* Detailed image prompt core

Structure:

```json
{
  "schema_version": "1.0",

  "title": "",

  "story_summary": "",

  "character_bible": {},

  "prop_bible": [],

  "environment_bible": [],

  "pages": [
    {
      "page_number": 1,

      "story_text": "",

      "narrative": {
        "goal": "",
        "plot_event": "",
        "emotional_beat": ""
      },

      "scene": {
        "location": "",
        "characters_present": [],
        "pet_action": "",
        "pet_expression": "",
        "important_objects": [],
        "environment_details": [],
        "time_of_day": "",
        "lighting": "",
        "mood": ""
      },

      "continuity": {
        "required_elements": [],
        "introduced_elements": []
      },

      "image_generation": {
        "scene_summary": "",
        "composition_goal": "",
        "camera": "",
        "image_prompt_core": "",
        "negative_prompt_core": "",
        "reference_images_required": true
      }
    }
  ]
}
```

---

# 11. Book Blueprint Prompt

```text
You are the lead writer, narrative designer, continuity editor and illustration art director for a personalized children's picture-book system.

The customer's real pet is the protagonist.

Create exactly the requested number of story pages.

STORY RULES

- Match the requested theme and setting.
- Use age-appropriate language.
- Create a clear beginning, development, climax and positive resolution.
- Keep the pet as the active protagonist.
- Express personality through actions.
- Maintain chronological continuity.
- Maintain location continuity.
- Maintain character continuity.
- Maintain prop continuity.
- Do not change the pet's physical appearance.
- Keep each page focused on one primary story event.
- Make every page visually illustratable.
- Keep page text inside the configured word limit.
- Avoid inappropriate children's content.

IMAGE RULES

For every page create image_prompt_core.

Describe:

- exact visual moment
- pet action
- expression/body language
- environment
- supporting characters
- important props
- composition
- camera perspective
- lighting
- mood
- continuity requirements

The image generator will receive the customer's pet photographs separately.

Treat those photographs as authoritative for pet identity.

Do not request story text, captions, page numbers, readable signs, logos or watermarks inside illustrations.

Return only data matching the required JSON schema.
```

---

# 12. Blueprint Validation

Use OpenAI Structured Outputs plus Laravel validation.

Validate:

* Exact configured page count
* Minimum book page count
* Sequential page numbers
* Required properties
* Known enum values
* Story text limits
* Image prompt availability
* Continuity data
* Valid JSON
* No executable HTML
* No model-generated storage paths
* No model-generated Blade templates

For MVP:

```text
story_page_count >= 16
```

Recommended configurable upper bound:

```text
16–32 story pages
```

---

# 13. Phase 4 — Layout Assignment

Laravel assigns a layout to **all pages** after Blueprint validation.

Example:

```php
'story_left_panel_v1' => [
    'blade' => 'books.layouts.story-left-panel',
    'max_words' => 45,
    'weight' => 15,
    'prompt_suffix' =>
        'Keep the left 30 percent visually calm because story text will be placed there.',
],
```

Selection considers:

* Text length
* Page type
* Previous layout
* Layout capacity
* Enabled layout
* Weighted randomness

Persist:

```json
{
  "page_number": 6,
  "layout_id": "story_left_panel_v1",
  "layout_version": 1
}
```

Layouts do not change on refresh.

---

# 14. Image Prompt Composition

Laravel builds:

```text
PET IDENTITY
+
ART STYLE
+
AI image_prompt_core
+
LAYOUT REQUIREMENT
+
GLOBAL IMAGE RULES
```

Example global rules:

```text
Do not render story text.
Do not render captions.
Do not render page numbers.
Do not render readable signs.
Do not render logos.
Do not render watermarks.
Do not add unexplained clothing or accessories.
```

---

# 15. Phase 5 — Generate Preview Pages

After layouts are assigned, Laravel generates only:

```text
Page 1
Page 2
Page 3
```

Job:

```text
GeneratePageIllustrationJob
```

Queue:

```text
book-images
```

Laravel batch example:

```text
PreviewIllustrationBatch

├── Page 1
├── Page 2
└── Page 3
```

When completed:

```text
preview_ready
```

---

# 16. Preview Access Rules

Before payment the API may expose:

```text
Book metadata
Title
Pages 1–3 story text
Pages 1–3 layouts
Pages 1–3 illustrations
```

It must not expose:

```text
Pages 4–N story text
Pages 4–N scene JSON
Pages 4–N image prompts
Pages 4–N signed asset URLs
Complete internal Blueprint
```

Even though those values already exist in the database.

This is a backend authorization/business-rule requirement.

---

# 17. API — Preview Pages

```http
GET /api/books/{book}/pages
```

Before payment:

```json
{
  "book_id": "book_123",

  "access": "preview",

  "total_story_pages": 16,

  "available_story_pages": 3,

  "pages": [
    {
      "page_number": 1,
      "story_text": "...",
      "layout_id": "story_left_panel_v1",
      "illustration_url": "signed-url"
    },
    {
      "page_number": 2,
      "story_text": "...",
      "layout_id": "story_bottom_panel_v1",
      "illustration_url": "signed-url"
    },
    {
      "page_number": 3,
      "story_text": "...",
      "layout_id": "story_right_panel_v1",
      "illustration_url": "signed-url"
    }
  ]
}
```

---

# 18. Payment Gate

Book access states:

```text
preview_generating
preview_ready
payment_pending
paid
full_book_generating
full_book_ready
```

The backend must never trust:

```json
{
  "paid": true
}
```

from a browser/client request.

Payment must be confirmed by trusted server-side payment verification.

---

# 19. Payment Confirmation

The exact payment provider can be added separately.

The storybook backend requires a trusted domain event such as:

```text
BookPaymentConfirmed
```

Containing:

```json
{
  "book_id": "book_123",
  "payment_id": "payment_456",
  "amount": "...",
  "currency": "...",
  "verified": true
}
```

Only a verified payment transition can change:

```text
preview_ready
↓
paid
```

---

# 20. Payment Idempotency

Payment processing must be idempotent.

If the payment provider sends the same confirmation more than once:

```text
Do not generate pages 4–N twice.
```

Use a unique provider payment/transaction ID.

---

# 21. Phase 6 — Generate Remaining Pages

After verified payment:

```text
GenerateRemainingBookPagesJob
```

determines which pages do not yet have illustrations.

For a normal 16-page book:

```text
Pages 1–3:
already generated

Pages 4–16:
queue generation
```

Create Laravel batch:

```text
FullBookIllustrationBatch

├── Page 4
├── Page 5
├── Page 6
├── ...
└── Page 16
```

---

# 22. Controlled Image Concurrency

Pages are independent jobs.

Example:

```env
BOOK_IMAGE_MAX_CONCURRENCY=4
```

Possible execution:

```text
4,5,6,7
↓
8,9,10,11
↓
12,13,14,15
↓
16
```

Exact concurrency is configurable.

---

# 23. Full Book Completion

When all purchased pages have illustrations:

```text
FinalizeBookPreviewJob
```

sets:

```text
full_book_ready
```

The API can now expose all story pages.

---

# 24. Phase 7 — Specific Page Changes

A customer may request changes to an individual page.

Supported change scopes:

```text
illustration
story
both
```

API:

```http
POST /api/books/{book}/pages/{page}/revision
```

Example:

```json
{
  "scope": "illustration",
  "instruction": "Make Charlie look happier and make the forest brighter."
}
```

or:

```json
{
  "scope": "story",
  "instruction": "Make this page more playful and shorter."
}
```

or:

```json
{
  "scope": "both",
  "instruction": "Instead of crossing a bridge, Charlie should find stepping stones."
}
```

---

# 25. Page Revision Rules

## Illustration Only

Keep:

```text
story text
scene
layout
story continuity
```

Modify:

```text
image prompt
illustration
```

Create new image version.

---

## Story Only

AI may update:

```text
story text
scene if necessary
image prompt if scene changed
```

Laravel must validate continuity before accepting the revision.

If the visual scene changes, the page illustration becomes stale and must be regenerated.

---

## Both

AI creates a revised:

```text
story text
scene
continuity
image_prompt_core
```

Laravel then:

1. Validates revision.
2. Checks layout compatibility.
3. Reassigns layout only if required.
4. Creates final image prompt.
5. Generates new illustration.
6. Creates new page version.

---

# 26. Page Revision AI Prompt

```text
You are revising exactly one page of an existing personalized children's picture book.

Preserve the overall story, established characters, pet identity, world, tone and continuity.

Apply the customer's requested page change without unnecessarily changing unrelated story events.

CURRENT PAGE:

{{current_page}}

PREVIOUS PAGE CONTEXT:

{{previous_page}}

NEXT PAGE CONTEXT:

{{next_page}}

ESTABLISHED STORY CONTINUITY:

{{continuity}}

CUSTOMER CHANGE REQUEST:

{{customer_instruction}}

CHANGE SCOPE:

{{scope}}

Rules:

- Do not rewrite unrelated pages.
- Keep the main pet consistent.
- Do not contradict established props or locations.
- Preserve the logical transition from the previous page.
- Preserve the logical transition into the next page.
- Keep page text within configured limits.
- If the visual event changes, produce an updated image_prompt_core.
- Return only structured data matching the revision schema.
```

---

# 27. Page Versioning

Never overwrite an existing published page version.

Example:

```text
Page 6

v1 → original
v2 → illustration changed
v3 → story + image changed
```

`book_pages` stores:

```text
current_version
```

and:

```text
selected_illustration_asset_id
```

---

# 28. Page Modification Before Payment

Before payment, customer changes are allowed only for accessible preview pages:

```text
pages 1–3
```

Pages 4–N cannot be revised through the public API until full-book access is unlocked.

---

# 29. Page Modification After Payment

After payment:

```text
pages 1–N
```

may be revised.

Revision access can later be limited by:

* Number of free revisions
* Subscription tier
* Credit balance
* Admin policy

These limits should remain configurable.

---

# 30. Revision Impact on PDF

Any page modification after a PDF exists creates a newer book version.

Example:

```text
Book v4
↓
PDF v4

Customer changes page 8
↓
Book v5

Existing PDF v4 remains unchanged.
```

A new PDF request generates:

```text
PDF v5
```

---

# 31. Phase 8 — HTML Preview

Laravel Blade remains the canonical layout source.

Example:

```text
resources/views/books/
├── preview.blade.php
├── cover.blade.php
├── dedication.blade.php
└── layouts/
    ├── story-bottom-panel.blade.php
    ├── story-left-panel.blade.php
    └── story-right-panel.blade.php
```

Preview can represent:

```text
3-page preview
```

or:

```text
full purchased book
```

based on server-side access state.

---

# 32. API — Generation Status

```http
GET /api/books/{book}/generation-status
```

Preview generation:

```json
{
  "status": "generating_preview",
  "progress_percent": 80,

  "pages": {
    "completed": 2,
    "target": 3
  }
}
```

Waiting for payment:

```json
{
  "status": "preview_ready",
  "payment_status": "unpaid",

  "pages": {
    "available": 3,
    "total": 16
  }
}
```

After payment:

```json
{
  "status": "generating_full_book",
  "payment_status": "paid",

  "pages": {
    "completed": 9,
    "total": 16
  }
}
```

---

# 33. Phase 9 — PDF Generation

PDF is allowed only when:

```text
payment_status = paid
AND
full_book_status = ready
```

API:

```http
POST /api/books/{book}/pdf
```

Response:

```http
202 Accepted
```

```json
{
  "pdf_generation_id": "pdfgen_123",
  "status": "queued"
}
```

---

# 34. PDF Job

```text
GenerateBookPdfJob
```

Queue:

```text
book-pdf
```

Flow:

```text
Immutable Book Snapshot
↓
Laravel Blade
↓
Headless Chromium
↓
PDF
↓
Private Storage
```

Preview and PDF use the same HTML/CSS.

---

# 35. Queue Architecture

Use:

```text
book-content
book-images
book-preview
book-pdf
book-maintenance
```

Workflow:

```text
AnalyzePetReferencesJob
↓
GenerateBookBlueprintJob
↓
AssignLayoutsJob
↓
Generate Preview Illustration Batch (1–3)
↓
Preview Ready
↓
PAYMENT
↓
Generate Remaining Illustration Batch (4–N)
↓
Full Book Ready
```

PDF is independent.

---

# 36. Idempotency

Critical fingerprints/locks:

```text
book generation
book payment unlock
page image generation
page revision
PDF generation
```

Example page image fingerprint:

```text
SHA256(
    book_version
    + page_number
    + page_version
    + final_prompt
    + reference_image_checksums
    + image_model
)
```

A successful matching asset must be reused.

---

# 37. Retry & Recovery

Provider retries apply to:

* HTTP 429
* HTTP 5xx
* Network timeout
* Invalid image response

A failed individual page retries independently.

Example:

```text
Page 1 completed
Page 2 completed
Page 3 failed

Retry:
Page 3 only
```

After payment:

```text
Pages 4–8 completed
Page 9 failed
Pages 10–16 completed

Retry:
Page 9 only
```

Scheduled:

```text
RecoverStuckBookGenerationsJob
```

handles abandoned/stuck operations.

---

# 38. Backend States

Generation:

```text
draft
queued
analyzing_pet
generating_blueprint
validating_blueprint
assigning_layouts
generating_preview
preview_ready
generating_full_book
full_book_ready
failed
cancelled
```

Payment:

```text
unpaid
pending
paid
failed
refunded
```

PDF:

```text
not_requested
queued
rendering
ready
failed
```

---

# 39. Required Database Tables

```text
pets
pet_photos

books
book_generations

book_pages
book_page_versions

book_assets

ai_operations
image_generations

book_payments

book_snapshots
pdf_generations
```

---

# 40. Important Book Fields

`books`:

```text
id
user_id
pet_id

title

theme
setting
illustration_style

story_page_count
preview_page_count

age_min
age_max
language

status
payment_status

current_version

timestamps
```

---

# 41. Book Page Fields

`book_pages`:

```text
id
book_id

page_number
page_type

is_preview_page

current_version

selected_layout_id
selected_illustration_asset_id

generation_status

timestamps
```

`is_preview_page`:

```text
true for pages 1–3
false for pages 4–N
```

---

# 42. Payment Table

`book_payments`:

```text
id
book_id
user_id

provider
provider_payment_id

amount
currency

status

verified_at
created_at
updated_at
```

`provider_payment_id` must be unique where appropriate to prevent duplicate processing.

---

# 43. API Summary

```text
POST   /api/pet-photos

POST   /api/books
GET    /api/books/{book}
PATCH  /api/books/{book}

POST   /api/books/{book}/generate

GET    /api/books/{book}/generation-status

GET    /api/books/{book}/pages
GET    /books/{book}/preview

POST   /api/books/{book}/pages/{page}/revision

POST   /api/books/{book}/pdf
GET    /api/books/{book}/pdf/{generation}/status

GET    /api/books/{book}/downloads/{pdf}
```

Payment-specific endpoints depend on the chosen payment provider.

Internally, story generation requires a trusted:

```text
BookPaymentConfirmed
```

event before generating locked pages.

---

# 44. Security Requirements

Especially important because the full story exists before payment:

* Pages 4–N must never leak through public APIs before payment.
* Hidden image prompts must never be exposed.
* Complete Blueprint must remain internal.
* Signed asset URLs must only be issued for accessible pages.
* PDF endpoint requires verified payment.
* Page revision endpoint verifies page access.
* Pet photos remain private.
* Generated images remain private.
* OpenAI API key remains backend-only.
* Never trust client-provided payment status.
* Payment callbacks must be authenticated/verified.
* AI/customer text must be HTML escaped.

---

# 45. MVP Acceptance Criteria

Backend is ready when:

* Customer can create a book with 3+ pet photos.
* Books support at least 16 story pages.
* `/generate` returns `202`.
* Pet analysis is queued.
* Complete 16+ page Blueprint is generated before image generation.
* Laravel validates the complete Blueprint.
* Layouts are assigned before illustrations.
* Only pages 1–3 are initially illustrated.
* Customer receives only pages 1–3 before payment.
* Pages 4–N cannot be accessed through API before payment.
* Verified payment starts pages 4–N generation.
* Duplicate payment events do not duplicate page generation.
* Remaining pages generate as independent queue jobs.
* Full HTML preview becomes available when all pages complete.
* Customer can request a change to one specific page.
* Page revision creates a new page version.
* Image-only revision does not rewrite story.
* Story changes trigger illustration regeneration when necessary.
* Editing one page does not regenerate unrelated pages.
* Existing PDFs remain immutable after later edits.
* PDF can only be requested after payment and full-book completion.
* PDF runs through a separate queue.
* Failed pages can resume independently.
* Completed paid AI work is reused rather than repeated.

---

# 46. Final Backend Workflow

```text
Create Book
↓
Queue Generation
↓
Pet Analysis
↓
Generate Complete 16+ Page Blueprint
↓
Validate
↓
Assign Layouts
↓
Generate Pages 1–3
↓
Preview Ready
↓
Payment Verified?
     │
     ├── NO
     │    ↓
     │   Stop
     │
     └── YES
          ↓
       Generate Pages 4–N
          ↓
       Full Book Ready
          ↓
       Page-Specific Revisions
       as requested
          ↓
       Save as PDF
          ↓
       PDF Queue
          ↓
       PDF Ready
```

The key commercial rule is:

```text
Generate the complete STORY before payment.

Generate only the PREVIEW ARTWORK before payment.

Unlock and generate the remaining ARTWORK only after verified payment.

Never expose locked story content before payment.
```
