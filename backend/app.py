from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os
import random
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import bcrypt

load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------------- DATABASE CONNECTION ----------------
def get_db_connection():
    return psycopg2.connect(
        os.environ.get("DATABASE_URL"),
        sslmode='require'
    )

# ---------------- OTP STORAGE ----------------
otp_storage = {}

# ---------------- HOME ----------------
@app.route('/')
def home():
    return "Backend Running ✅"

# ---------------- SEND OTP ----------------
@app.route('/send_otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data['email']

    otp = str(random.randint(1000, 9999))
    otp_storage[email] = otp

    sender_email = "yashwinadkar2002@gmail.com"
    sender_password = "wbdx hdiw uaic gvpz"

    msg = MIMEText(f"Your OTP is: {otp}")
    msg['Subject'] = "OTP Verification"
    msg['From'] = sender_email
    msg['To'] = email

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()

        return jsonify({"message": "OTP sent successfully"})
    except Exception as e:
        print("OTP ERROR:", e)
        return jsonify({"message": "Failed to send OTP"})

# ---------------- VERIFY OTP ----------------
@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data['email']
    otp = data['otp']

    if email in otp_storage and otp_storage[email] == otp:
        return jsonify({"message": "OTP verified"})
    else:
        return jsonify({"message": "Invalid OTP"})

# ---------------- REGISTER ----------------
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json

        name = data['name']
        email = data['email']
        password = data['password']
        role = data['role']

        # 🔐 HASH PASSWORD
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        conn = get_db_connection()
        cur = conn.cursor()

        # CHECK EXISTING EMAIL
        cur.execute("SELECT * FROM users WHERE email=%s", (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"message": "Email already exists ❌"})

        # INSERT USER
        cur.execute(
            "INSERT INTO users(name,email,password,role) VALUES(%s,%s,%s,%s)",
            (name, email, hashed_password.decode('utf-8'), role)
        )
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": "User registered successfully ✅"})

    except Exception as e:
        print("REGISTER ERROR:", e)
        return jsonify({"message": "Server error", "error": str(e)})

# ---------------- LOGIN ----------------
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json

        email = data['email']
        password = data['password']

        conn = get_db_connection()
        cur = conn.cursor()

        # GET USER BY EMAIL
        cur.execute(
            "SELECT id, name, role, password FROM users WHERE email=%s",
            (email,)
        )
        user = cur.fetchone()

        cur.close()
        conn.close()

        if user:
            stored_password = user[3]

            # 🔐 CHECK PASSWORD
            if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
                return jsonify({
                    "message": "Login successful ✅",
                    "user_id": user[0],
                    "name": user[1],
                    "role": user[2]
                })

        return jsonify({"message": "Invalid credentials ❌"})

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"message": "Server error", "error": str(e)})

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run()