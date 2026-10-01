from app.services.gemini_service import client
from google.genai import types
import json


def analyze_contract(text):

    prompt = f"""
You are a professional legal contract analysis assistant.

Analyze the following contract carefully.

Your job is to identify the actual risks, important clauses,
and practical recommendations based ONLY on the contract.

Do not invent clauses that are not present in the contract.

Return the analysis using the required JSON structure.

Important rules:

- risk_score must be an integer between 0 and 100.
- overall_risk must be exactly "Low", "Medium", or "High".
- confidence must be an integer between 0 and 100.
- summary must contain concise points about THIS contract.
- risky_clauses must contain clauses actually found in THIS contract.
- Each risky clause must contain "clause" and "risk".
- risk must be exactly "Low", "Medium", or "High".
- recommendations must be practical recommendations based on THIS contract.
- Do not use information from previous contracts.
- Do not return markdown.
- Do not return explanations outside the JSON.

Contract Text:

{text}
"""

    response = client.models.generate_content(

        model="gemini-3.5-flash",

        contents=prompt,

        config=types.GenerateContentConfig(

            response_mime_type="application/json",

            response_schema={

                "type": "OBJECT",

                "properties": {

                    "risk_score": {
                        "type": "INTEGER"
                    },

                    "overall_risk": {
                        "type": "STRING",
                        "enum": [
                            "Low",
                            "Medium",
                            "High"
                        ]
                    },

                    "confidence": {
                        "type": "INTEGER"
                    },

                    "summary": {
                        "type": "ARRAY",
                        "items": {
                            "type": "STRING"
                        }
                    },

                    "risky_clauses": {
                        "type": "ARRAY",
                        "items": {

                            "type": "OBJECT",

                            "properties": {

                                "clause": {
                                    "type": "STRING"
                                },

                                "risk": {
                                    "type": "STRING",
                                    "enum": [
                                        "Low",
                                        "Medium",
                                        "High"
                                    ]
                                }
                            },

                            "required": [
                                "clause",
                                "risk"
                            ]
                        }
                    },

                    "recommendations": {
                        "type": "ARRAY",
                        "items": {
                            "type": "STRING"
                        }
                    }
                },

                "required": [
                    "risk_score",
                    "overall_risk",
                    "confidence",
                    "summary",
                    "risky_clauses",
                    "recommendations"
                ]
            }
        )
    )

    print("Gemini Raw Response:")
    print(response.text)

    try:

        return json.loads(response.text)

    except json.JSONDecodeError as error:

        print(
            "Gemini JSON Error:",
            error
        )

        raise ValueError(
            "Gemini returned invalid JSON."
        )