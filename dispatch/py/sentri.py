import os
import time
from pathlib import Path
from ollama import chat

MODEL = "huihui_ai/qwen3-abliterated:latest"


# -------------------------
# Load Markdown Files
# -------------------------

def load_markdown(filename):
    path = Path("py/SentriModel") / filename

    if path.exists():
        return path.read_text(encoding="utf-8")

    print(f"⚠️ Missing {filename}")
    return ""


# -------------------------
# Base Prompt
# -------------------------

BASE_PROMPT = """
You are Sentri.

You are a cybersecurity training assistant.

Only activate a capability when the user explicitly requests it.

Available commands:

- generateTask
- generateEmailTask

If no command is given, answer normally.
"""


# -------------------------
# Build System Prompt
# -------------------------

def build_system_prompt(user_input):

    prompt = BASE_PROMPT

    command = user_input.split(maxsplit=1)[0]

    if command == "generateTask":
        prompt += "\n\n" + load_markdown("taskGeneration.md")

    elif command == "generateEmailTask":
        prompt += "\n\n" + load_markdown("task/emailTask.md")

    return prompt


print("Program started")
print("Type 'exit' to quit.\n")


# -------------------------
# Chat Loop
# -------------------------

while True:

    print("You: (finish with END)")

    lines = []

    while True:
        line = input()

        if line.strip() == "END":
            break

        lines.append(line)

    user_input = "\n".join(lines).strip()

    if user_input.lower() in ["exit", "quit"]:
        print("Goodbye!")
        break

    # Build system prompt
    system_prompt = build_system_prompt(user_input)

    # Fresh conversation every request
    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": user_input
        }
    ]

    print("\nGenerating...\n")

    # Measure generation time
    start_time = time.perf_counter()

    response = chat(
        model=MODEL,
        messages=messages,
        think=False
    )

    end_time = time.perf_counter()

    assistant_reply = response.message.content

    print("Assistant:\n")
    print(assistant_reply)

    generation_time = end_time - start_time

    print(f"\n⏱ Generation Time: {generation_time:.2f} seconds")

    # Optional: Display generation speed if available
    if hasattr(response, "eval_count") and hasattr(response, "eval_duration"):
        if response.eval_duration > 0:
            tokens_per_second = response.eval_count / (response.eval_duration / 1e9)
            print(f"⚡ Generation Speed: {tokens_per_second:.2f} tokens/sec")

    print()