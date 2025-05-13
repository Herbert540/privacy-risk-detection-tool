import whatsappPrivacyTextPDF from '../testing/waPDF.txt?raw';
import whatsappPrivacyTextURL from '../testing/waURL.txt?raw';

export async function extractPolicy({ url, file }) {
    const testWithTxt = true;
    // ─── URL via RapidAPI Article Extractor ───────────────────────────

    if (url) {
        ////////////////////////////////////////////////////////
        // Keeping this here to avoid hitting the API limit ////
        ////////////////////////////////////////////////////////
        if (testWithTxt) {
            return whatsappPrivacyTextURL;
        }

        const RAPID_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
        const apiUrl = `https://article-extractor-and-summarizer.p.rapidapi.com/extract` +
            `?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPID_KEY,
                'X-RapidAPI-Host': 'article-extractor-and-summarizer.p.rapidapi.com',
            }
        });

        if (!res.ok) {
            throw new Error(`Extraction failed (${res.status}): ${res.statusText}`);
        }

        const json = await res.json();

        if (json.content) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(json.content, 'text/html');
            return doc.body.textContent || '';
        }
    }

    // ─── File via Cloudmersive PDF→TXT ────────────────────────────────
    if (file) {
        const CLOUDF_KEY = import.meta.env.VITE_CLOUDMERSIVE_API_KEY;
        const name = file.name.toLowerCase();

        ////////////////////////////////////////////////////////
        // Keeping this here to avoid hitting the API limit ////
        ////////////////////////////////////////////////////////
        if (testWithTxt) {
            return whatsappPrivacyTextPDF;
        }

        if (name.endsWith('.txt')) {
            // Plain‐text files we can read natively
            return await file.text();
        }

        if (name.endsWith('.pdf')) {
            // PDF → TXT
            const res = await fetch(
                'https://api.cloudmersive.com/convert/pdf/to/txt',
                {
                    method: 'POST',
                    headers: {
                        Apikey: CLOUDF_KEY,
                        'Content-Type': 'application/pdf',
                    },
                    body: file,
                }
            );
            if (!res.ok) throw new Error(`PDF→TXT failed: ${res.statusText}`);
            const json = await res.json();
            return json.TextResult;
        }

        if (name.endsWith('.docx')) {
            // DOCX → TXT
            const res = await fetch(
                'https://api.cloudmersive.com/convert/docx/to/txt',
                {
                    method: 'POST',
                    headers: {
                        Apikey: CLOUDF_KEY,
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    },
                    body: file,
                }
            );
            if (!res.ok) throw new Error(`DOCX→TXT failed: ${res.statusText}`);
            const json = await res.json();
            return json.TextResult;
        }

        throw new Error('Unsupported file type; only .txt, .pdf, or .docx allowed.');

    }

    throw new Error("Please provide a URL or a file");
}
