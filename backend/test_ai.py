import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    base_url=os.getenv("AZURE_OPENAI_ENDPOINT"),
)

response = client.responses.create(
    model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
    input="Say hello to LearnFlow AI in one short sentence."
)

print(response.output_text)