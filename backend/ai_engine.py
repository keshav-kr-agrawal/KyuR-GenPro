from gradio_client import Client
import shutil
import os
import random
import time

# --- YOUR TOKEN ---
# This allows access to the Hugging Face API
HF_TOKEN = os.getenv("HF_API_TOKEN")

def generate_ai_qr(url, prompt, output_path):
    print(f"🎨 Engineering High-Fidelity QR for: '{url}' with prompt: '{prompt}'")
    
    # 1. Connect to Hugging Face
    try:
        client = Client("huggingface-projects/QR-code-AI-art-generator", headers={"Authorization": f"Bearer {HF_TOKEN}"})
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return False
    
    random_seed = random.randint(0, 999999999)
    
    # 2. PROMPT ENGINEERING (Make it look professional)
    enhanced_prompt = f"{prompt}, masterpiece, trending on artstation, highly detailed, 8k resolution, vibrant, sharp focus, rich texture, neon lights, cyberpunk"
    negative_prompt = "ugly, blurry, low quality, distorted, pixelated, grainy, dull, plain, text, watermark, broken"

    # 3. CALL API (This takes 20-40s)
    try:
        result = client.predict(
            url,
            enhanced_prompt,
            negative_prompt,
            7.5,  # Guidance Scale (Creativity)
            1.50, # ControlNet Scale (Readability vs Art Balance)
            0.9,  # Strength
            random_seed,
            None,
            None,
            True,
            "DPM++ Karras SDE", # High Quality Sampler
            api_name="/inference"
        )
        
        # 4. MOVE RESULT TO OUR SERVER PATH
        # Gradio saves to a temp folder, we move it to where server.py expects it
        shutil.move(result, output_path)
        print(f"✅ AI Art Saved Successfully: {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ AI Generation Failed: {e}")
        return False