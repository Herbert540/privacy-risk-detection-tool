export async function analyzePolicy(policyText, preferences) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing VITE_OPENAI_API_KEY in .env");

    // description of the prefs
    function prefsToDescription(prefs) {
        const lines = [];

        // Format
        const fmt = Object.entries(prefs.format)
            .filter(([, v]) => v)
            .map(([k]) => k);
        if (fmt.length) lines.push(`Format: ${fmt.join(", ")}`);

        // Content
        const cnt = Object.entries(prefs.content)
            .filter(([, v]) => v)
            .map(([k]) => k);
        if (cnt.length) lines.push(`Content: ${cnt.join(", ")}`);

        // Tool behavior
        const tb = [];
        if (prefs.toolBehavior.riskTolerance)
            tb.push(`Risk tolerance = ${prefs.toolBehavior.riskTolerance}`);
        if (prefs.toolBehavior.highlightMethod)
            tb.push(`Highlight method = ${prefs.toolBehavior.highlightMethod}`);
        if (prefs.toolBehavior.severityLabeling)
            tb.push("Add severity category (High/Medium/Low)");
        if (prefs.toolBehavior.actionRecommendations)
            tb.push("Add Action recommendations");
        if (prefs.toolBehavior.educationalPopups)
            tb.push("Add Accept / Reject / Investigate suggestions");
        if (!prefs.toolBehavior.useDefaultRules)
            tb.push("No default rules");
        if (tb.length) lines.push(`Tool behavior: ${tb.join(", ")}`);

        // Summary length
        if (prefs.summaryLength)
            lines.push(`Summary length = ${prefs.summaryLength}`);

        // Additional
        if (prefs.additional?.trim())
            lines.push(`Additional: ${prefs.additional.trim()}`);

        return lines.join("\n");
    }

    const prefsDescription = prefsToDescription(preferences);

    // instructions based on highlightMethod
    let highlightInstruction = "";
    switch (preferences.toolBehavior.highlightMethod) {
        case "list":
            highlightInstruction =
                "- Return each flagged clause as a bullet in a list under its preference.\n";
            break;
        case "summary":
            highlightInstruction =
                "- Provide a brief plain-language summary of the flagged clauses under each preference.\n";
            break;
        case "legalRefs":
            highlightInstruction =
                "- Include any relevant legal references (e.g. GDPR/CCPA articles) when flagging clauses.\n";
            break;
        default:
            highlightInstruction = "";
    }

    // system prompt with injected highlight instruction
    const systemPrompt = `
        You are a privacy–policy assistant.  
        Using the user's preferences and a privacy policy text,  
        extract **only** the clauses that MATCH and CONFLICT  
        with those preferences. 

        ${highlightInstruction}
        Output must be at most 2000 tokens and should be valid JSON with exactly two keys:

        {
        "matchingClauses": [
            {
            "preference": "<preference label>",
            "clauses": ["<text based on instuction and user preferences>", …],
            "severity": "<optional severity category (High/Medium/Low) based on user preferences (defaults to empty string)>",
            "educationalNotes": "<optional educational notes based on user preferences (defaults to empty string)>",
            "actionRecommendations": "<optional action recommendations based on user preferences (defaults to empty string)>"
            },
            …
        ],
        "conflictingClauses": [
            {
            "preference": "<preference label>",
            "clauses": ["<text based on instuction and user preferences>", …],
            "severity": "<optional severity category (High/Medium/Low) if in user preferences (defaults to empty string)>",
            "educationalNotes": "<optional educational notes if in user preferences (defaults to empty string)>",
            "actionRecommendations": "<optional action recommendations if in user preferences (defaults to empty string)>"
            },
            …
        ]
        }

        Do NOT output any extra keys or prose.`.trim();

    const userPrompt = `
        User Preferences:
        ${prefsDescription}

        Privacy Policy Text:
        ${policyText}
        `.trim();

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.0,
            max_tokens: 2000,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
            `OpenAI error ${res.status}: ${err.error?.message || res.statusText}`
        );
    }

    const { choices } = await res.json();
    const reply = choices?.[0]?.message?.content;
    if (!reply) throw new Error("No content returned from OpenAI");

    // Parse the JSON response from OpenAI
    let jsonText = reply.trim();
    if (jsonText.startsWith("```")) {
        const lines = jsonText.split("\n");
        lines.shift();
        if (lines[0].trim().toLowerCase() === "json") {
            lines.shift();
        }
        jsonText = lines.join("\n");
    }
    if (jsonText.endsWith("```")) {
        jsonText = jsonText.slice(0, jsonText.lastIndexOf("```"));
    }

    const parsed = JSON.parse(jsonText);

    console.log("OpenAI reply:", parsed);

    return parsed;
}
