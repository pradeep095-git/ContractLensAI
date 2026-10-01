from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.contract import Contract

from app.models.user import User

from app.api.auth_api import get_current_user

from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import analyze_contract
from app.services.report_service import create_analysis_pdf

import hashlib
import json
import os


router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)



def get_default_analysis():

    return {
        "risk_score": 0,
        "overall_risk": "Unknown",
        "confidence": 0,
        "summary": [],
        "risky_clauses": [],
        "recommendations": []
    }



def normalize_analysis(analysis):

    default_analysis = get_default_analysis()

    if not analysis:
        return default_analysis

    # Already dictionary
    if isinstance(analysis, dict):

        return {
            **default_analysis,
            **analysis
        }

    # JSON string
    try:

        parsed = json.loads(analysis)

        if isinstance(parsed, dict):

            return {
                **default_analysis,
                **parsed
            }

    except Exception:

        pass

    # Invalid/non-JSON AI response
    return {
        **default_analysis,
        "summary": [
            str(analysis)
        ]
    }



def get_upload_date(contract):

    if not contract.filepath:

        return None

    try:

        if os.path.exists(contract.filepath):

            timestamp = os.path.getmtime(
                contract.filepath
            )

            from datetime import datetime

            return datetime.fromtimestamp(
                timestamp
            ).isoformat()

    except Exception as error:

        print(
            "UPLOAD DATE ERROR:",
            repr(error)
        )

    return None



@router.post("/upload")
def upload_contract(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

  

    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="File name is missing."
        )



    upload_folder = os.path.join(
        "app",
        "uploads",
        str(current_user.id)
    )

    os.makedirs(
        upload_folder,
        exist_ok=True
    )


  
    file_bytes = file.file.read()

    if not file_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty."
        )


   

    file_hash = hashlib.sha256(
        file_bytes
    ).hexdigest()


    print("=" * 70)
    print("FILE NAME :", file.filename)
    print("FILE HASH :", file_hash)
    print("=" * 70)


    existing_contract = (
        db.query(Contract)
        .filter(
            Contract.file_hash == file_hash,
            Contract.user_id == current_user.id
        )
        .first()
    )


   
    if existing_contract:

        print(
            "CACHE HIT - Existing contract found."
        )

        saved_analysis = normalize_analysis(
            existing_contract.analysis
        )

        return {

            "success": True,

            "message":
            "Existing contract analysis returned.",

            "contract_id":
            existing_contract.id,

            "file_name":
            existing_contract.file_name,

            "upload_date":
            get_upload_date(existing_contract),

            "analysis":
            saved_analysis,

            "cached":
            True

        }


  
    safe_filename = os.path.basename(
        file.filename
    )


   
    file_location = os.path.join(
        upload_folder,
        f"{file_hash}_{safe_filename}"
    )


    try:

        with open(
            file_location,
            "wb"
        ) as buffer:

            buffer.write(
                file_bytes
            )

    except Exception as error:

        print(
            "FILE SAVE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to save uploaded PDF."
        )


   

    try:

        contract_text = extract_text_from_pdf(
            file_location
        )

    except Exception as error:

        print(
            "PDF EXTRACTION ERROR:",
            repr(error)
        )

        try:
            os.remove(file_location)
        except OSError:
            pass

        raise HTTPException(
            status_code=500,
            detail="Failed to extract text from PDF."
        )


  
    # 11. CHECK READABLE TEXT
  

    if not contract_text or not contract_text.strip():

        try:

            os.remove(
                file_location
            )

        except OSError:

            pass

        raise HTTPException(
            status_code=400,
            detail=
            "PDF uploaded but no readable text was found."
        )


  
    # 12. CREATE DATABASE RECORD
  

    contract = Contract(

        file_name=safe_filename,

        filepath=file_location,

        user_id=current_user.id,

        file_hash=file_hash

    )


    try:

        db.add(contract)

        db.commit()

        db.refresh(contract)

    except Exception as error:

        db.rollback()

        print(
            "DATABASE INSERT ERROR:",
            repr(error)
        )

        try:
            os.remove(file_location)
        except OSError:
            pass

        raise HTTPException(
            status_code=500,
            detail="Failed to save contract in database."
        )


  
    # 13. AI ANALYSIS
  

    print(
        "CACHE MISS - Generating NEW AI analysis..."
    )

    try:

        analysis = analyze_contract(
            contract_text
        )

    except Exception as error:

        print(
            "AI ANALYSIS ERROR:",
            repr(error)
        )

        db.delete(contract)
        db.commit()

        try:
            os.remove(file_location)
        except OSError:
            pass

        raise HTTPException(
            status_code=500,
            detail="AI analysis failed."
        )


  
    # 14. NORMALIZE AI RESPONSE
  

    analysis_for_frontend = normalize_analysis(
        analysis
    )


  
    # 15. SAVE ANALYSIS TO MYSQL
  

    try:

        contract.analysis = json.dumps(
            analysis_for_frontend,
            ensure_ascii=False
        )

        db.commit()

        db.refresh(contract)

    except Exception as error:

        db.rollback()

        print(
            "ANALYSIS SAVE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to save analysis."
        )


  
    # 16. RETURN RESULT
  

    return {

        "success": True,

        "message":
        "Contract uploaded and analyzed successfully.",

        "contract_id":
        contract.id,

        "file_name":
        safe_filename,

        "upload_date":
        get_upload_date(contract),

        "analysis":
        analysis_for_frontend,

        "cached":
        False

    }



# GET DYNAMIC CONTRACT HISTORY


@router.get("/history")
def get_contract_history(
    db: Session = Depends(get_db),
     current_user: User = Depends(get_current_user)
):

    try:

        contracts = (
            db.query(Contract)
            .filter(
                Contract.user_id == current_user.id
            )
            .order_by(
                Contract.id.desc()
            )
            .all()
        )

        history = []

        for contract in contracts:

            analysis = normalize_analysis(
                contract.analysis
            )

            history.append({

                "id":
                contract.id,

                "contract_id":
                contract.id,

                "file_name":
                contract.file_name,

                "upload_date":
                get_upload_date(contract),

                "risk_score":
                analysis.get(
                    "risk_score",
                    0
                ),

                "overall_risk":
                analysis.get(
                    "overall_risk",
                    "Unknown"
                ),

                "confidence":
                analysis.get(
                    "confidence",
                    0
                ),

                "has_analysis":
                bool(contract.analysis),

                "analysis":
                analysis

            })


        # ==================================================
        # IMPORTANT:
        #
        # "history" is the main response.
        #
        # "contracts" is also returned so your current
        # History.jsx can work without immediately breaking.
        # ==================================================

        return {

            "success": True,

            "count":
            len(history),

            "history":
            history,

            "contracts":
            history

        }


    except Exception as error:

        print(
            "HISTORY ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=
            f"Failed to load contract history: {str(error)}"
        )



# GET ONE CONTRACT FROM HISTORY


@router.get("/history/{contract_id}")
def get_contract_history_item(
    contract_id: int,
    db: Session = Depends(get_db),
     current_user: User = Depends(get_current_user)
):

    contract = (
        db.query(Contract)
        .filter(
            Contract.id == contract_id,
            Contract.user_id == current_user.id
        )
        .first()
    )


    if not contract:

        raise HTTPException(
            status_code=404,
            detail="Contract not found."
        )


    analysis = normalize_analysis(
        contract.analysis
    )


    return {

        "success": True,

        "id":
        contract.id,

        "contract_id":
        contract.id,

        "file_name":
        contract.file_name,

        "filepath":
        contract.filepath,

        "upload_date":
        get_upload_date(contract),

        "analysis":
        analysis

    }



# GET ONE CONTRACT

#
# This endpoint is added specifically because your current
# History.jsx calls:
#
# /contracts/${contract.id}
#
# instead of:
#
# /contracts/history/${contract.id}
#


@router.get("/{contract_id}")
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
     current_user: User = Depends(get_current_user)
):

    contract = (
        db.query(Contract)
        .filter(
            Contract.id == contract_id,
            Contract.user_id == current_user.id
        )
        .first()
    )


    if not contract:

        raise HTTPException(
            status_code=404,
            detail="Contract not found."
        )


    analysis = normalize_analysis(
        contract.analysis
    )


    return {

        "success": True,

        "id":
        contract.id,

        "contract_id":
        contract.id,

        "file_name":
        contract.file_name,

        "filepath":
        contract.filepath,

        "upload_date":
        get_upload_date(contract),

        "analysis":
        analysis

    }



# DOWNLOAD REPORT FROM HISTORY


@router.get(
    "/history/{contract_id}/report"
)
def download_history_report(
    contract_id: int,
    db: Session = Depends(get_db),
     current_user: User = Depends(get_current_user)
):

    contract = (
        db.query(Contract)
        .filter(
            Contract.id == contract_id,
            Contract.user_id == current_user.id
        )
        .first()
    )


    if not contract:

        raise HTTPException(
            status_code=404,
            detail="Contract not found."
        )


    if not contract.analysis:

        raise HTTPException(
            status_code=404,
            detail=
            "Analysis is not available for this contract."
        )


    analysis = normalize_analysis(
        contract.analysis
    )


  
    # REPORT FOLDER
  

    report_folder = "app/reports"

    os.makedirs(
        report_folder,
        exist_ok=True
    )


  
    # SAFE FILE NAME
  

    safe_name = os.path.splitext(
        os.path.basename(
            contract.file_name
        )
    )[0]


    output_path = os.path.join(
        report_folder,
        f"{safe_name}_{contract.id}_analysis.pdf"
    )


  
    # CREATE PDF
  

    try:

        create_analysis_pdf(

            analysis,

            contract.file_name,

            output_path

        )

    except Exception as error:

        print(
            "REPORT CREATION ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create PDF report."
        )


  
    # RETURN PDF
  

    return FileResponse(

        path=output_path,

        media_type="application/pdf",

        filename=
        f"{safe_name}_{contract.id}_analysis.pdf"

    )



# DELETE CONTRACT FROM HISTORY


@router.delete(
    "/history/{contract_id}"
)
def delete_contract_history(
    contract_id: int,
    db: Session = Depends(get_db),
     current_user: User = Depends(get_current_user)
):

    contract = (
        db.query(Contract)
        .filter(
            Contract.id == contract_id,
            Contract.user_id == current_user.id
        )
        .first()
    )


    if not contract:

        raise HTTPException(
            status_code=404,
            detail="Contract not found."
        )


  
    # DELETE PHYSICAL PDF
  

    if contract.filepath:

        try:

            if os.path.exists(
                contract.filepath
            ):

                os.remove(
                    contract.filepath
                )

        except OSError as error:

            print(
                "FILE DELETE WARNING:",
                repr(error)
            )


  
    # DELETE DATABASE RECORD
  

    try:

        db.delete(
            contract
        )

        db.commit()

    except Exception as error:

        db.rollback()

        print(
            "DATABASE DELETE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete contract."
        )


    return {

        "success": True,

        "message":
        "Contract deleted successfully.",

        "contract_id":
        contract_id

    }