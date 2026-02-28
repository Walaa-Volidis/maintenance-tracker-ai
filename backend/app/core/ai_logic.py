import logging

from groq import Groq, GroqError

from app.core.config import settings

logger = logging.getLogger(__name__)

VALID_CATEGORIES: list[str] = [
    "Plumbing",
    "Electrical",
    "HVAC",
    "Furniture",
    "General",
]

DEFAULT_CATEGORY = "General"

MODEL_NAME = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = (
    "You are an expert maintenance dispatcher. "
    "Your task is to categorize the user's request into EXACTLY one of these "
    "categories: [Plumbing, Electrical, HVAC, Furniture, General].\n"
    "Rules:\n"
    "- Output ONLY the category name.\n"
    "- Do not include any punctuation, explanations, or extra words.\n"
    "- If the request is ambiguous, default to General.\n"
    "- If the request is in Arabic, understand the meaning and output the "
    "English category name."
)

# Create the client once at module level
client = Groq(api_key=settings.groq_api_key)


def suggest_category(description: str) -> str:
    """Use Groq (LLaMA 3.3 70B) to classify a maintenance request description.

    Returns one of the valid categories. Falls back to 'General'
    if the API call fails or returns an unexpected value.
    """
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": description},
            ],
            temperature=0,
            max_tokens=20,
        )

        category = response.choices[0].message.content.strip()

        # Validate against the allowed list (case-insensitive match)
        for valid in VALID_CATEGORIES:
            if category.lower() == valid.lower():
                return valid

        logger.warning(
            "Groq returned unexpected category '%s'; defaulting to '%s'.",
            category,
            DEFAULT_CATEGORY,
        )
        return DEFAULT_CATEGORY

    except GroqError as exc:
        logger.error("Groq API error while suggesting category: %s", exc)
        return DEFAULT_CATEGORY
    except Exception as exc: 
        logger.error("Unexpected error in suggest_category: %s", exc)
        return DEFAULT_CATEGORY


SUMMARY_SYSTEM_PROMPT = (
    "You are a concise maintenance report writer. "
    "Summarize the user's maintenance request into ONE short sentence "
    "of no more than 10 words.\n"
    "Rules:\n"
    "- Output ONLY the summary sentence.\n"
    "- Do not include any punctuation at the end, explanations, or extra words.\n"
    "- If the request is in Arabic, understand the meaning and output the "
    "English summary."
)

DEFAULT_SUMMARY = "Maintenance issue reported"


def generate_summary(description: str) -> str:
    """Use Groq to produce a <=10-word summary of a maintenance request.

    Falls back to a generic summary on any failure.
    """
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
                {"role": "user", "content": description},
            ],
            temperature=0,
            max_tokens=30,
        )

        summary = response.choices[0].message.content.strip()
        return summary if summary else DEFAULT_SUMMARY

    except GroqError as exc:
        logger.error("Groq API error while generating summary: %s", exc)
        return DEFAULT_SUMMARY
    except Exception as exc: 
        logger.error("Unexpected error in generate_summary: %s", exc)
        return DEFAULT_SUMMARY
