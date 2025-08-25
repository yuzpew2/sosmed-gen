# Sosmed Gen

Sosmed Gen is a web application designed to help users generate social media posts using the power of AI. Users simply provide a niche or topic, and the application uses Google Search to gather real-time context before generating creative content with Google Gemini.

## Key Features

* **User Authentication:** Secure user sign-up, login, and logout system powered by Supabase.
* **AI-Powered Generation:** Generates social media posts based on a user's niche and a selected writing style.
* **Real-time Context:** Uses the Google Search API to fetch relevant, up-to-date information before generation.
* **Interactive Output:** Users can edit the generated result and copy it to their clipboard with a single click.

## Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Database & Auth:** Supabase
* **AI Model:** Google Gemini 1.5 Flash
* **Web Search:** Google Programmable Search Engine
* **Deployment:** Vercel

## Environment Variables Setup

To run this project, you need to create a `.env.local` file in the root directory and add the following environment variables. Obtain these keys from their respective platforms.

Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY

Google AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

Google Search
GOOGLE_SEARCH_API_KEY=YOUR_GOOGLE_SEARCH_API_KEY
GOOGLE_CSE_ID=YOUR_SEARCH_ENGINE_ID


## Transcription Service

### Environment Variable

Add the transcription service base URL to your `.env.local`:

```
TRANSCRIBE_API_BASE=https://api-transcribe.yuslabs.xyz
```

Replace the URL if you host your own transcription API.

### Workflow

1. Enter a YouTube URL and its corresponding video ID in the generator form.
2. Submit the form to start a background transcription job. The server returns a `taskId`.
3. The client polls the transcription endpoint every 3 seconds until the job finishes.
4. Once transcription completes, the summary feeds the post generator and a styled post appears in the UI for editing or copying.

**Notes:**

- Transcribing long videos can take several minutes; keep the page open while the task runs.
- Ensure `TRANSCRIBE_API_BASE` points to a reachable service or the transcription will fail.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd sosmed-gen
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up the `.env.local` file** as described above.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.
