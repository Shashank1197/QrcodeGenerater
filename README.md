# QR Code Generator

A simple and efficient **QR Code Generator** built with Python.  
This project allows users to generate QR codes for any text or URL and automatically save them as PNG images.

---

## 📌 Features

- Generate QR codes from any **text, link, or message**
- Save the QR code automatically as a `.png` file
- Clean and user-friendly interface
- Lightweight and fast
- Works on Windows, macOS, and Linux

---

## 🛠️ Tech Stack

- **Python 3.x**
- **qrcode** library
- **Pillow (PIL)** for image handling
- **Tkinter** (if GUI is used)

---

# 🚀 Project Pipeline

### **1. User Input**
- User enters text or URL (CLI or GUI)

### **2. Validation**
- Ensures empty input is not allowed

### **3. QR Code Generation**
- Uses the `qrcode` library to encode data
- Customizable:
  - Version  
  - Box size  
  - Border  

### **4. Save Output**
- Saves the QR code as a PNG image locally

### **5. Display / Notify**
- Shows the QR code (GUI) or prints a success message (CLI)

---

# 📥 Installation & Setup

Follow these steps to run the project on your computer.

---

## ✔️ Step 1 — Clone the Repository

```bash
git clone https://github.com/Shashank1197/QrcodeGenerater.git
cd QrcodeGenerater

## ✔️ Step 2 — Install Dependencies

After entering the project folder, install the required Python libraries:

```bash
pip install qrcode pillow

pip install -r requirements.txt

python main.py
