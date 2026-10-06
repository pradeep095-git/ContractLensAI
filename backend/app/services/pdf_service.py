import os
import subprocess
import zipfile

import fitz
from docx import Document


print("🔥 CONTRACT FILE SERVICE LOADED 🔥")


# ==========================================================
# PDF TEXT EXTRACTION
# ==========================================================

def extract_text_from_pdf(file_path):

    doc = fitz.open(file_path)

    text = ""

    for page in doc:

        page_text = page.get_text()

        if page_text:

            text += page_text + "\n"

    doc.close()

    return text


# ==========================================================
# DOCX TEXT EXTRACTION
# ==========================================================

def extract_text_from_docx(file_path):

    # First check whether the file is actually a valid ZIP.
    # A real DOCX file is a ZIP package.

    if not zipfile.is_zipfile(file_path):

        raise RuntimeError(
            "The uploaded DOCX file is not a valid DOCX document. "
            "Please open it in Microsoft Word and save it again as DOCX."
        )

    try:

        document = Document(file_path)

    except Exception as error:

        raise RuntimeError(
            f"Failed to open DOCX document: {str(error)}"
        )

    text_parts = []

    # ------------------------------------------------------
    # PARAGRAPHS
    # ------------------------------------------------------

    for paragraph in document.paragraphs:

        paragraph_text = paragraph.text.strip()

        if paragraph_text:

            text_parts.append(
                paragraph_text
            )

    # ------------------------------------------------------
    # TABLES
    # ------------------------------------------------------

    for table in document.tables:

        for row in table.rows:

            row_text = []

            for cell in row.cells:

                cell_text = cell.text.strip()

                if cell_text:

                    row_text.append(
                        cell_text
                    )

            if row_text:

                text_parts.append(
                    " | ".join(row_text)
                )

    return "\n".join(
        text_parts
    )


# ==========================================================
# DOC TEXT EXTRACTION
# ==========================================================

def extract_text_from_doc(file_path):

    try:

        result = subprocess.run(

            [
                "antiword",
                file_path
            ],

            stdout=subprocess.PIPE,

            stderr=subprocess.PIPE,

            check=True

        )

        try:

            return result.stdout.decode(
                "utf-8"
            )

        except UnicodeDecodeError:

            return result.stdout.decode(
                "latin-1",
                errors="replace"
            )

    except FileNotFoundError:

        raise RuntimeError(
            "DOC file processing requires Antiword on the server."
        )

    except subprocess.CalledProcessError as error:

        error_message = error.stderr.decode(
            "utf-8",
            errors="replace"
        )

        raise RuntimeError(
            f"Failed to extract text from DOC file: "
            f"{error_message}"
        )


# ==========================================================
# MAIN FILE EXTRACTION FUNCTION
# ==========================================================

def extract_text_from_file(file_path):

    extension = os.path.splitext(
        file_path
    )[1].lower()

    print(
        "📄 EXTRACTING FILE:",
        file_path
    )

    print(
        "📄 FILE EXTENSION:",
        extension
    )

    # ------------------------------------------------------
    # PDF
    # ------------------------------------------------------

    if extension == ".pdf":

        return extract_text_from_pdf(
            file_path
        )

    # ------------------------------------------------------
    # DOCX
    # ------------------------------------------------------

    if extension == ".docx":

        return extract_text_from_docx(
            file_path
        )

    # ------------------------------------------------------
    # DOC
    # ------------------------------------------------------

    if extension == ".doc":

        return extract_text_from_doc(
            file_path
        )

    # ------------------------------------------------------
    # UNSUPPORTED
    # ------------------------------------------------------

    raise ValueError(
        "Unsupported file format. "
        "Please upload PDF, DOC, or DOCX."
    )