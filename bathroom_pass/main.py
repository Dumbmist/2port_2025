from flask import Flask, render_template, request, jsonify
import threading
import requests
import json

from static.assets.api.assets import javaURI

app = Flask(__name__)

# Static queue data (replace with a dynamic backend if needed)
queue = ["John Mortensen", "Srijan Atti"]
current_user = ""
next_up = "Matthew Wakayama"

def barcode_reader():
    """Barcode scanner implementation"""
    hid = {4: 'a', 5: 'b', 6: 'c', 7: 'd', 8: 'e', 9: 'f', 10: 'g', 11: 'h', 12: 'i', 13: 'j', 14: 'k', 15: 'l', 
           16: 'm', 17: 'n', 18: 'o', 19: 'p', 20: 'q', 21: 'r', 22: 's', 23: 't', 24: 'u', 25: 'v', 26: 'w', 27: 'x', 
           28: 'y', 29: 'z', 30: '1', 31: '2', 32: '3', 33: '4', 34: '5', 35: '6', 36: '7', 37: '8', 38: '9', 39: '0'}

    fp = open('/dev/hidraw0', 'rb')
    ss = ""
    done = False

    while not done:
        buffer = fp.read(8)
        for c in buffer:
            if ord(c) > 0:
                if int(ord(c)) == 40:  # Enter key (end of barcode)
                    done = True
                    break
                else:
                    ss += hid.get(int(ord(c)), '')

    return ss

def send_barcode_to_server(student_id):
    """Send barcode data to Flask endpoint"""
    url = f"{javaURI}/api/queue/add"
    data = {"student_id": student_id}

    try:
        response = requests.post(url, json=data)
        print(f"Sent {student_id} to server: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending barcode: {e}")

def barcode_listener():
    """Continuously listens for barcode scans and sends them to the Flask server."""
    while True:
        student_id = barcode_reader()
        send_barcode_to_server(student_id)
        
def get_name_by_sid(sid):
    url = f"localhost:8085/api/{sid}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Data fetched successfully:", response.json())
            return response.json()
        else:
            print(f"GET req failed {response.status_code}: {response.text}")
    except requests.exceptions.RequestException as e:
        print("Error during GET request:", e)

def add_to_queue(teacherEmail, studentName, uri):
    payload = {
        "studentName":studentName,
        "teacherEmail":teacherEmail,
        "uri":uri
    }
    url = "localhost:8085/api/queue/add"
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 201:
            print("Data posted successfully: ", response.json)
        else:
            print(f"POST req failed with status code {response.status_code}: {response.text}")
    except requests.exceptions.RequestException as e:
        print("Error during POST req:", e)
    
@app.route('/')
def home():
    return render_template('index.html', current_user=current_user, next_up=next_up, queue=queue)

@app.route('/scan', methods=['POST'])
def scan_barcode():
    """Handles barcode scans"""
    global current_user, next_up, queue

    data = request.get_json()
    scanned_id = data.get("student_id")

    if scanned_id:
        print(f"Scanned ID: {scanned_id}")
        # Update queue logic
        current_user = next_up
        if queue:
            next_up = queue.pop(0)
        else:
            next_up = "Nobody"

        return jsonify({"message": "Queue updated", "current_user": current_user, "next_up": next_up, "queue": queue})
    
    return jsonify({"error": "Invalid scan"}), 400

if __name__ == '__main__':
    # Start barcode listening thread
    threading.Thread(target=barcode_listener, daemon=True).start()

    # Run Flask app
    app.run(port=4100, debug=True)
