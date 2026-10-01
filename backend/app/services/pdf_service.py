import fitz

print("🔥 NEW COLORFUL REPORT SERVICE LOADED 🔥")

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)

    text = ""

    for page in doc:
        page_text = page.get_text()

        if page_text:
            text += page_text + "\n"

    doc.close()

    return text