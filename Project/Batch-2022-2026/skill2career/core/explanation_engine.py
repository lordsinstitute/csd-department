# core/explanation_engine.py
import os
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_explanation(user_skills, career_name, career_skills):
    """
    Generates a short explanation for why a career is a match
    """

    # Build a simple prompt
    prompt = f"""
    The user has the following skills (0-5 scale): {user_skills}.
    Evaluate how well these skills match the career: {career_name}.
    Career requires these skills: {career_skills}.
    Give a short explanation (2-3 sentences) why this career is suitable
    and mention the missing or weak skills.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )

        explanation = response.choices[0].message.content.strip()
        return explanation

    except Exception as e:
        return f"Error generating explanation: {e}"


# Optional test block
if __name__ == "__main__":

    user_skills = {"python": 5, "sql": 4, "machine_learning": 3}
    career_name = "Data Scientist"
    career_skills = {"python": 2, "sql": 2, "machine_learning": 2, "data_visualization": 1}

    result = generate_explanation(user_skills, career_name, career_skills)
    print("Explanation:\n", result)
