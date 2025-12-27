from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import time
import glob
import qrcode
import razorpay
from PIL import Image, ImageDraw, ImageFont
from supabase import create_client, Client
from dotenv import load_dotenv

# *** IMPORT THE AI LOGIC ***
from ai_engine import generate_ai_qr

load_dotenv()

app = Flask(__name__)
CORS(app)

# ==========================================
# 1. CREDENTIALS (PASTE YOUR KEYS HERE)
# ==========================================

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Clients
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
SUPABASE_BUCKET = "qr-assets" # Ensure this bucket exists in your Supabase Storage

# ==========================================
# 2. FILE SYSTEM & HELPERS
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, 'generated', 'temp')
os.makedirs(TEMP_DIR, exist_ok=True)

# Helper: Upload to Supabase & Get URL
def upload_to_cloud(local_path, cloud_filename):
    try:
        with open(local_path, 'rb') as f:
            # Overwrite if exists ("upsert": "true")
            supabase.storage.from_(SUPABASE_BUCKET).upload(
                file=f, 
                path=cloud_filename, 
                file_options={"content-type": "image/png", "upsert": "true"}
            )
        # Get Public Link
        return supabase.storage.from_(SUPABASE_BUCKET).get_public_url(cloud_filename)
    except Exception as e:
        print(f"Upload Error: {e}")
        return None

# Helper: Standard Watermark
def apply_watermark(input_path, output_path):
    try:
        with Image.open(input_path).convert("RGBA") as base:
            overlay = Image.new("RGBA", base.size, (0,0,0,0))
            draw = ImageDraw.Draw(overlay)
            w, h = base.size
            
            # Diagonal Text
            try: 
                font = ImageFont.truetype("Arial.ttf", 30)
                draw.text((w/4, h/2), "PREVIEW", fill=(255, 0, 0, 128), font=font)
            except: pass

            draw.line((0,0,w,h), fill=(255,0,0,100), width=5)
            draw.line((0,h,w,0), fill=(255,0,0,100), width=5)
            Image.alpha_composite(base, overlay).save(output_path)
    except: pass

# Helper: AI Glitch
def apply_ai_glitch(input_path, output_path):
    try:
        with Image.open(input_path).convert("RGB") as base:
            draw = ImageDraw.Draw(base)
            draw.rectangle([20, 20, 100, 100], fill=(10, 10, 10)) # Break QR
            draw.rectangle([base.width-100, 0, base.width, 30], fill=(0, 255, 255))
            try: font = ImageFont.truetype("Arial.ttf", 16)
            except: font = ImageFont.load_default()
            draw.text((base.width-90, 5), "SAMPLE", fill=(0,0,0), font=font)
            base.save(output_path)
    except: pass

# ==========================================
# 3. ROUTES
# ==========================================

@app.route('/create-order', methods=['POST'])
def create_order():
    try:
        data = request.json
        amount = data.get('amount')
        order = razorpay_client.order.create({"amount": amount, "currency": "INR", "payment_capture": 1})
        return jsonify(order)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/verify-payment', methods=['POST'])
def verify_payment():
    try:
        data = request.json
        # 1. Verify Signature
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': data.get('razorpay_order_id'),
            'razorpay_payment_id': data.get('razorpay_payment_id'),
            'razorpay_signature': data.get('razorpay_signature')
        })
        
        # 2. Get Real URL
        art_id = data.get('art_id')
        
        # We know the filename convention is "real_{art_id}.png"
        real_cloud_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(f"real_{art_id}.png")
        
        return jsonify({"success": True, "download_url": real_cloud_url})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/generate/standard', methods=['POST', 'OPTIONS']) 
def generate_standard():
    if request.method == 'OPTIONS': return _handle_cors()
    try:
        data = request.json
        user_url = data.get('url')
        art_id = str(uuid.uuid4())
        
        # 1. Generate Local
        qr = qrcode.QRCode(box_size=12, border=4)
        qr.add_data(user_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
        
        local_real = os.path.join(TEMP_DIR, f"{art_id}_real.png")
        local_prev = os.path.join(TEMP_DIR, f"{art_id}_preview.png")
        img.save(local_real)
        apply_watermark(local_real, local_prev)
        
        # 2. Upload to Cloud (Real + Preview)
        upload_to_cloud(local_real, f"real_{art_id}.png")
        prev_url = upload_to_cloud(local_prev, f"preview_{art_id}.png")
        
        # 3. Cleanup Local
        try:
            os.remove(local_real)
            os.remove(local_prev)
        except: pass
        
        return jsonify({"art_id": art_id, "preview_url": prev_url, "type": "standard"})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/generate/ai', methods=['POST', 'OPTIONS']) 
def generate_ai():
    if request.method == 'OPTIONS': return _handle_cors()
    try:
        data = request.json
        user_url = data.get('url')
        prompt = data.get('prompt')
        art_id = str(uuid.uuid4())
        
        local_real = os.path.join(TEMP_DIR, f"{art_id}_real.png")
        
        # 1. AI Generation
        print(f"🚀 Starting AI Generation for {art_id}...")
        success = generate_ai_qr(user_url, prompt, local_real)
        if not success: return jsonify({"error": "AI Failed"}), 500
        
        # 2. Create Glitch Preview
        local_prev = os.path.join(TEMP_DIR, f"{art_id}_preview.png")
        apply_ai_glitch(local_real, local_prev)
        
        # 3. Upload to Cloud
        upload_to_cloud(local_real, f"real_{art_id}.png")
        prev_url = upload_to_cloud(local_prev, f"preview_{art_id}.png")
        
        # 4. Cleanup Local
        try:
            os.remove(local_real)
            os.remove(local_prev)
        except: pass
        
        return jsonify({"art_id": art_id, "preview_url": prev_url, "type": "ai"})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/regenerate', methods=['POST'])
def regenerate():
    # If using DB, we would mark status as deleted.
    # For now, we just return success.
    return jsonify({"success": True})

def _handle_cors():
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)