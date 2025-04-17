from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import cv2
import numpy as np
import torch
from ultralytics import YOLO
from segment_anything import sam_model_registry, SamPredictor
import matplotlib.pyplot as plt
from matplotlib.colors import hsv_to_rgb
import base64
from io import BytesIO
import sys
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables for models
detection_model = None
sam = None
predictor = None

# Configuration
weights_path = r"C:\Users\bsaad\OneDrive\Desktop\Graduation\Second Weights\weights/best.pt"
sam_checkpoint_path = r"C:\Users\bsaad\OneDrive\Desktop\Graduation\Second Weights\weights\sam_vit_b_01ec64.pth"
confidence_threshold = 0.25
output_dir = "segmentation_results"
os.makedirs(output_dir, exist_ok=True)

def load_models():
    global detection_model, sam, predictor
    
    print("Loading YOLO detection model...")
    detection_model = YOLO(weights_path)
    
    print("Loading SAM model...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    sam = sam_model_registry["vit_b"](checkpoint=sam_checkpoint_path)
    sam.to(device=device)
    predictor = SamPredictor(sam)
    
    print("Models loaded successfully!")

# Convert image to base64 for embedding directly in HTML
def img_to_base64(img_array):
    img = img_array.copy()
    if img.dtype != np.uint8:
        img = (img * 255).astype(np.uint8)
    
    is_grayscale = len(img.shape) == 2
    if is_grayscale:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    
    buffer = BytesIO()
    plt.figure(figsize=(10, 8))
    plt.imshow(img)
    plt.axis('off')
    plt.tight_layout(pad=0)
    plt.savefig(buffer, format='png', bbox_inches='tight', pad_inches=0)
    plt.close()
    
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

def get_color(idx):
    """Generate distinct colors for different instances"""
    hue = (idx * 0.15) % 1.0  # Spread hue values
    return hsv_to_rgb((hue, 0.8, 1.0))

@app.route('/api/analyze', methods=['POST'])
def analyze_xray():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Save the uploaded file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)
    
    try:
        # Run detection
        detection_results = detection_model(temp_path, conf=confidence_threshold)
        
        # Load image for SAM
        image = cv2.imread(temp_path)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        height, width = image_rgb.shape[:2]
        
        # Set image for SAM
        predictor.set_image(image_rgb)
        
        # Process detections
        detections = []
        masks = []
        
        for result in detection_results:
            if not hasattr(result, 'boxes') or len(result.boxes) == 0:
                continue
            
            # Get all boxes
            boxes = result.boxes.xyxy.cpu().numpy()
            classes = result.boxes.cls.cpu().numpy()
            confs = result.boxes.conf.cpu().numpy()
            
            for i, (box, cls_id, conf) in enumerate(zip(boxes, classes, confs)):
                # Get detection information
                x1, y1, x2, y2 = box
                class_name = result.names[int(cls_id)]
                
                # Store detection info
                detections.append({
                    'id': i,
                    'box': box.tolist(),
                    'class_id': int(cls_id),
                    'class_name': class_name,
                    'confidence': float(conf),
                    'location': f"Position {i+1}"  # You can improve this with actual tooth position
                })
                
                # Convert box coordinates to integer
                box_coords = np.array([x1, y1, x2, y2])
                
                # Get mask prediction from SAM
                try:
                    mask_prediction, _, _ = predictor.predict(
                        box=box_coords,
                        multimask_output=False  # Get single best mask
                    )
                    mask = mask_prediction[0]  # Take first mask
                    masks.append(mask)
                except Exception as e:
                    print(f"Error generating mask for {class_name}: {e}")
                    # Create an empty mask as fallback
                    empty_mask = np.zeros((height, width), dtype=bool)
                    masks.append(empty_mask)
        
        # Create visualizations
        detection_img = detection_results[0].plot()
        detection_img = cv2.cvtColor(detection_img, cv2.COLOR_BGR2RGB)
        
        # Prepare response data
        original_base64 = img_to_base64(image_rgb)
        detection_base64 = img_to_base64(detection_img)
        
        # Prepare mask data
        mask_data = []
        for i, (mask, detection) in enumerate(zip(masks, detections)):
            # Get mask info
            class_name = detection['class_name']
            confidence = detection['confidence']
            box = detection['box']
            
            # Create a colored mask
            mask_array = np.zeros_like(image_rgb, dtype=np.uint8)
            
            # Choose color based on class
            if "Missing" in class_name:
                color = (255, 50, 50)  # Red
            elif "Caries" in class_name:
                color = (50, 50, 255)  # Blue
            elif "Root" in class_name:
                color = (255, 50, 255)  # Purple
            elif "Filling" in class_name:
                color = (50, 255, 50)  # Green
            elif "Treatment" in class_name:
                color = (255, 255, 50)  # Yellow
            else:
                color = (np.random.randint(50, 200), np.random.randint(50, 200), np.random.randint(50, 200))
            
            # Apply color to mask
            mask_array[mask] = color
            
            # Convert to base64
            mask_base64 = img_to_base64(mask_array)
            
            # Calculate mask statistics
            mask_area = np.sum(mask)
            mask_percentage = (mask_area / (image_rgb.shape[0] * image_rgb.shape[1])) * 100
            
            # Add to mask data
            mask_data.append({
                'id': i,
                'class': class_name,
                'confidence': float(confidence),
                'box': box,
                'color': f"rgb({color[0]}, {color[1]}, {color[2]})",
                'base64': mask_base64,
                'area': int(mask_area),
                'percentage': float(mask_percentage)
            })
        
        return jsonify({
            'original': original_base64,
            'detection': detection_base64,
            'masks': mask_data,
            'detections': detections
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        os.rmdir(temp_dir)

if __name__ == '__main__':
    load_models()
    app.run(host='0.0.0.0', port=5000, debug=False)