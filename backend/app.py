from flask import Flask, request, jsonify
from flask_cors import CORS
import flask_mysqldb
import random
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)

# ---------------- DATABASE CONFIG ----------------
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Admin@123'   # 👈 CHANGE THIS
app.config['MYSQL_DB'] = 'healthcare'

mysql = flask_mysqldb.MySQL(app)

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

    sender_email = "yashwinadkar2002@gmail.com"        # 👈 CHANGE
    sender_password = "wbdx hdiw uaic gvpz"        # 👈 CHANGE

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
        print(e)
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
    data = request.json

    name = data['name']
    email = data['email']
    password = data['password']
    role = data['role']

    cur = mysql.connection.cursor()

    # CHECK EXISTING EMAIL
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        return jsonify({"message": "Email already exists ❌"})

    # INSERT USER
    cur.execute(
        "INSERT INTO users(name,email,password,role) VALUES(%s,%s,%s,%s)",
        (name, email, password, role)
    )
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "User registered successfully ✅"})
# ---------------- LOGIN ----------------
@app.route('/login', methods=['POST'])
def login():
    data = request.json

    email = data['email']
    password = data['password']

    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT id, name, role FROM users WHERE email=%s AND password=%s",
        (email, password)
    )
    user = cur.fetchone()
    cur.close()

    if user:
        return jsonify({
            "message": "Login successful ✅",
            "user_id": user[0],
            "name": user[1],
            "role": user[2]
        })
    else:
        return jsonify({"message": "Invalid credentials ❌"})
    
if __name__ == "__main__":
    app.run(debug=True)