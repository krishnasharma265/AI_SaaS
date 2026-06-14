from groq import Groq
from app.core.config import settings
from app.core.logger import logger
import asyncio

client=Groq(
    api_key=settings.GROQ_API_KEY
    )

class AIServices:

    @staticmethod
    async def generate_response(messages:list):
        formatted = [
            {"role": msg["role"] if msg["role"] in ("user", "assistant") else "user",
             "content": msg["content"]}
            for msg in messages
        ]
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=formatted,
                    max_tokens=1024,
                    temperature=0.7,
                )
            )
            
            return {
                "content":response.choices[0].message.content ,
                "prompt_tokens":response.usage.prompt_tokens,
                "output_tokens":response.usage.completion_tokens,
                "total_tokens":response.usage.total_tokens
                }
        except Exception as e:
            logger.info(
                f"AI service gives error {e}"
            )
            return f"AI service is temporarily unavailable. because {e}"