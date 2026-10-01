from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    LongTable
)
from xml.sax.saxutils import escape


# ==========================================================
# COLORS
# ==========================================================

BLUE = colors.HexColor("#0D6EFD")
DARK_BLUE = colors.HexColor("#084298")
LIGHT_BLUE = colors.HexColor("#EAF2FF")

RED = colors.HexColor("#DC3545")
LIGHT_RED = colors.HexColor("#FDECEC")

ORANGE = colors.HexColor("#FD7E14")

YELLOW = colors.HexColor("#FFC107")
LIGHT_YELLOW = colors.HexColor("#FFF8E1")

GREEN = colors.HexColor("#198754")
LIGHT_GREEN = colors.HexColor("#EAF7EF")

DARK = colors.HexColor("#172033")
GREY = colors.HexColor("#6C757D")

LIGHT_GREY = colors.HexColor("#F5F7FA")
BORDER = colors.HexColor("#D9DEE7")

WHITE = colors.white


# ==========================================================
# SAFE TEXT
# ==========================================================

def safe_text(value):
    """
    Safely convert AI/user text into ReportLab-compatible text.
    Prevents &, < and > from breaking Paragraph().
    """

    if value is None:
        return ""

    return escape(str(value))


# ==========================================================
# MAIN PDF FUNCTION
# ==========================================================

def create_analysis_pdf(
    analysis,
    file_name,
    output_path
):

    # ======================================================
    # DOCUMENT
    # ======================================================

    doc = SimpleDocTemplate(

        output_path,

        pagesize=A4,

        leftMargin=18 * mm,
        rightMargin=18 * mm,

        topMargin=18 * mm,
        bottomMargin=18 * mm,

        title="ContractLensAI Legal Analysis Report",

        author="ContractLensAI",

        allowSplitting=True
    )


    styles = getSampleStyleSheet()


    # ======================================================
    # STYLES
    # ======================================================

    title_style = ParagraphStyle(

        "ReportTitle",

        parent=styles["Title"],

        fontName="Helvetica-Bold",

        fontSize=24,

        leading=29,

        textColor=BLUE,

        alignment=TA_LEFT,

        spaceAfter=5
    )


    subtitle_style = ParagraphStyle(

        "Subtitle",

        parent=styles["Normal"],

        fontName="Helvetica",

        fontSize=10,

        leading=14,

        textColor=GREY,

        spaceAfter=14
    )


    contract_style = ParagraphStyle(

        "Contract",

        parent=styles["Normal"],

        fontName="Helvetica",

        fontSize=10.5,

        leading=15,

        textColor=DARK
    )


    section_style = ParagraphStyle(

        "Section",

        parent=styles["Heading2"],

        fontName="Helvetica-Bold",

        fontSize=17,

        leading=21,

        textColor=DARK_BLUE,

        spaceBefore=14,

        spaceAfter=9,

        keepWithNext=True
    )


    body_style = ParagraphStyle(

        "Body",

        parent=styles["BodyText"],

        fontName="Helvetica",

        fontSize=10.5,

        leading=15.5,

        textColor=DARK
    )


    bullet_style = ParagraphStyle(

        "Bullet",

        parent=body_style,

        leftIndent=12,

        firstLineIndent=-7,

        spaceAfter=6
    )


    table_header_style = ParagraphStyle(

        "TableHeader",

        parent=body_style,

        fontName="Helvetica-Bold",

        fontSize=10,

        leading=13,

        textColor=WHITE
    )


    table_cell_style = ParagraphStyle(

        "TableCell",

        parent=body_style,

        fontSize=9.5,

        leading=13.5,

        textColor=DARK,

        wordWrap="CJK"
    )


    risk_badge_style = ParagraphStyle(

        "RiskBadge",

        parent=body_style,

        fontName="Helvetica-Bold",

        fontSize=9,

        leading=12,

        alignment=TA_CENTER
    )


    footer_style = ParagraphStyle(

        "Footer",

        parent=body_style,

        fontSize=7.5,

        leading=10,

        textColor=GREY,

        alignment=TA_CENTER
    )


    # ======================================================
    # STORY
    # ======================================================

    story = []


    # ======================================================
    # HEADER
    # ======================================================

    brand_style = ParagraphStyle(

        "Brand",

        parent=body_style,

        fontName="Helvetica-Bold",

        fontSize=11,

        textColor=BLUE
    )


    header_right_style = ParagraphStyle(

        "HeaderRight",

        parent=body_style,

        fontName="Helvetica-Bold",

        fontSize=8,

        textColor=GREY,

        alignment=TA_CENTER
    )


    header_table = Table(

        [
            [

                Paragraph(
                    "ContractLensAI",
                    brand_style
                ),

                Paragraph(
                    "LEGAL ANALYSIS",
                    header_right_style
                )

            ]
        ],

        colWidths=[
            125 * mm,
            35 * mm
        ]
    )


    header_table.setStyle(

        TableStyle(

            [

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "LINEBELOW",
                    (0, 0),
                    (-1, -1),
                    1,
                    BORDER
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )

            ]
        )
    )


    story.append(header_table)

    story.append(
        Spacer(1, 12)
    )


    # ======================================================
    # TITLE
    # ======================================================

    story.append(

        Paragraph(
            "Legal Analysis Report",
            title_style
        )

    )


    story.append(

        Paragraph(
            "AI-powered contract risk assessment and recommendations",
            subtitle_style
        )

    )


    # ======================================================
    # CONTRACT INFORMATION
    # ======================================================

    contract_info = Table(

        [

            [

                Paragraph(
                    "<b>Contract</b>",
                    contract_style
                ),

                Paragraph(
                    safe_text(file_name),
                    contract_style
                )

            ]

        ],

        colWidths=[
            35 * mm,
            125 * mm
        ]
    )


    contract_info.setStyle(

        TableStyle(

            [

                (
                    "BACKGROUND",
                    (0, 0),
                    (0, 0),
                    LIGHT_BLUE
                ),

                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.6,
                    BORDER
                ),

                (
                    "INNERGRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    BORDER
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),

                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )

            ]
        )
    )


    story.append(contract_info)

    story.append(
        Spacer(1, 14)
    )


    # ======================================================
    # VALUES
    # ======================================================

    risk_score = analysis.get(
        "risk_score",
        0
    )

    overall_risk = analysis.get(
        "overall_risk",
        "Unknown"
    )

    confidence = analysis.get(
        "confidence",
        0
    )


    # ======================================================
    # OVERALL RISK COLOR
    # ======================================================

    if overall_risk == "High":

        overall_color = RED
        overall_bg = LIGHT_RED

    elif overall_risk == "Medium":

        overall_color = ORANGE
        overall_bg = LIGHT_YELLOW

    else:

        overall_color = GREEN
        overall_bg = LIGHT_GREEN


    # ======================================================
    # KPI CARD
    # ======================================================

    kpi_label_style = ParagraphStyle(

        "KpiLabel",

        parent=body_style,

        fontName="Helvetica-Bold",

        fontSize=8,

        leading=10,

        textColor=GREY,

        alignment=TA_CENTER
    )


    kpi_risk_style = ParagraphStyle(

        "KpiRisk",

        parent=body_style,

        fontName="Helvetica-Bold",

        fontSize=20,

        leading=23,

        textColor=RED,

        alignment=TA_CENTER
    )


    kpi_overall_style = ParagraphStyle(

        "KpiOverall",

        parent=body_style,

        fontName="Helvetica-Bold",

        fontSize=17,

        leading=20,

        textColor=overall_color,

        alignment=TA_CENTER
    )


    kpi_confidence_style = ParagraphStyle(

        "KpiConfidence",

        parent=body_style,

        fontName="Helvetica-Bold",

        fontSize=20,

        leading=23,

        textColor=GREEN,

        alignment=TA_CENTER
    )


    risk_card = Table(

        [

            [

                Paragraph(
                    "AI RISK SCORE",
                    kpi_label_style
                ),

                Paragraph(
                    "OVERALL RISK",
                    kpi_label_style
                ),

                Paragraph(
                    "CONFIDENCE",
                    kpi_label_style
                )

            ],

            [

                Paragraph(
                    f"{safe_text(risk_score)}%",
                    kpi_risk_style
                ),

                Paragraph(
                    safe_text(overall_risk),
                    kpi_overall_style
                ),

                Paragraph(
                    f"{safe_text(confidence)}%",
                    kpi_confidence_style
                )

            ]

        ],

        colWidths=[
            53 * mm,
            53 * mm,
            54 * mm
        ]
    )


    risk_card.setStyle(

        TableStyle(

            [

                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    LIGHT_GREY
                ),

                (
                    "BACKGROUND",
                    (0, 1),
                    (0, 1),
                    LIGHT_RED
                ),

                (
                    "BACKGROUND",
                    (1, 1),
                    (1, 1),
                    overall_bg
                ),

                (
                    "BACKGROUND",
                    (2, 1),
                    (2, 1),
                    LIGHT_GREEN
                ),

                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.7,
                    BORDER
                ),

                (
                    "INNERGRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )

            ]
        )
    )


    story.append(risk_card)

    story.append(
        Spacer(1, 15)
    )


    # ======================================================
    # EXECUTIVE SUMMARY
    # ======================================================

    summary = analysis.get(
        "summary",
        []
    )


    summary_items = []


    if isinstance(summary, list):

        for item in summary:

            summary_items.append(

                Paragraph(
                    f"• {safe_text(item)}",
                    bullet_style
                )

            )


    if not summary_items:

        summary_items.append(

            Paragraph(
                "• No summary available.",
                bullet_style
            )

        )


    # Keep heading with first summary item
    story.append(

        KeepTogether(

            [

                Paragraph(
                    "1. Executive Summary",
                    section_style
                ),

                summary_items[0]

            ]

        )

    )


    for item in summary_items[1:]:

        story.append(item)


    story.append(
        Spacer(1, 8)
    )


    # ======================================================
    # RISKY CLAUSES
    # ======================================================

    risky_clauses = analysis.get(
        "risky_clauses",
        []
    )


    clause_rows = [

        [

            Paragraph(
                "Clause",
                table_header_style
            ),

            Paragraph(
                "Risk",
                table_header_style
            )

        ]

    ]


    for item in risky_clauses:

        clause = safe_text(
            item.get(
                "clause",
                ""
            )
        )


        risk = str(
            item.get(
                "risk",
                "Low"
            )
        )


        if risk == "High":

            badge_color = RED
            badge_text_color = WHITE

        elif risk == "Medium":

            badge_color = YELLOW
            badge_text_color = DARK

        else:

            badge_color = GREEN
            badge_text_color = WHITE


        badge_style = ParagraphStyle(

            f"Badge_{len(clause_rows)}",

            parent=risk_badge_style,

            textColor=badge_text_color
        )


        clause_rows.append(

            [

                Paragraph(
                    clause,
                    table_cell_style
                ),

                Paragraph(
                    safe_text(risk),
                    badge_style
                )

            ]
        )


    if len(clause_rows) > 1:

        clause_table = LongTable(

            clause_rows,

            colWidths=[
                135 * mm,
                25 * mm
            ],

            repeatRows=1,

            splitByRow=1,

            hAlign="LEFT"
        )


        commands = [

            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                BLUE
            ),

            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                WHITE
            ),

            (
                "BOX",
                (0, 0),
                (-1, -1),
                0.7,
                BORDER
            ),

            (
                "INNERGRID",
                (0, 0),
                (-1, -1),
                0.4,
                BORDER
            ),

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),

            (
                "ALIGN",
                (1, 1),
                (1, -1),
                "CENTER"
            ),

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                7
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                7
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                8
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                8
            )

        ]


        # ==================================================
        # RISK COLORS
        # ==================================================

        for row_index, item in enumerate(
            risky_clauses,
            start=1
        ):

            risk = str(
                item.get(
                    "risk",
                    "Low"
                )
            )


            if risk == "High":

                risk_color = RED

            elif risk == "Medium":

                risk_color = YELLOW

            else:

                risk_color = GREEN


            commands.append(

                (
                    "BACKGROUND",
                    (1, row_index),
                    (1, row_index),
                    risk_color
                )

            )


            # Alternating clause background

            if row_index % 2 == 0:

                commands.append(

                    (
                        "BACKGROUND",
                        (0, row_index),
                        (0, row_index),
                        LIGHT_GREY
                    )

                )


        clause_table.setStyle(
            TableStyle(commands)
        )


        # Keep heading with beginning of table
        story.append(

            KeepTogether(

                [

                    Paragraph(
                        "2. Risky Clauses",
                        section_style
                    ),

                    Spacer(1, 2),

                    clause_table

                ]

            )

        )

    else:

        story.append(

            KeepTogether(

                [

                    Paragraph(
                        "2. Risky Clauses",
                        section_style
                    ),

                    Paragraph(
                        "No significant risky clauses were identified.",
                        body_style
                    )

                ]

            )

        )


    story.append(
        Spacer(1, 15)
    )


    # ======================================================
    # RECOMMENDATIONS
    # ======================================================

    recommendations = analysis.get(
        "recommendations",
        []
    )


    recommendation_items = []


    if isinstance(
        recommendations,
        list
    ):

        for item in recommendations:

            check_style = ParagraphStyle(

                f"Check_{len(recommendation_items)}",

                parent=body_style,

                fontName="Helvetica-Bold",

                fontSize=13,

                leading=15,

                textColor=GREEN,

                alignment=TA_CENTER
            )


            recommendation_box = Table(

                [

                    [

                        Paragraph(
                            "✓",
                            check_style
                        ),

                        Paragraph(
                            safe_text(item),
                            body_style
                        )

                    ]

                ],

                colWidths=[
                    10 * mm,
                    150 * mm
                ],

                splitByRow=1
            )


            recommendation_box.setStyle(

                TableStyle(

                    [

                        (
                            "BACKGROUND",
                            (0, 0),
                            (-1, -1),
                            LIGHT_GREEN
                        ),

                        (
                            "BOX",
                            (0, 0),
                            (-1, -1),
                            0.5,
                            colors.HexColor(
                                "#B7DFC5"
                            )
                        ),

                        (
                            "VALIGN",
                            (0, 0),
                            (-1, -1),
                            "MIDDLE"
                        ),

                        (
                            "LEFTPADDING",
                            (0, 0),
                            (-1, -1),
                            7
                        ),

                        (
                            "RIGHTPADDING",
                            (0, 0),
                            (-1, -1),
                            7
                        ),

                        (
                            "TOPPADDING",
                            (0, 0),
                            (-1, -1),
                            7
                        ),

                        (
                            "BOTTOMPADDING",
                            (0, 0),
                            (-1, -1),
                            7
                        )

                    ]
                )
            )


            recommendation_items.append(

                KeepTogether(

                    [

                        recommendation_box,

                        Spacer(
                            1,
                            6
                        )

                    ]

                )

            )


    if not recommendation_items:

        recommendation_items.append(

            Paragraph(
                "No recommendations available.",
                body_style
            )

        )


    # Keep heading with first recommendation
    story.append(

        KeepTogether(

            [

                Paragraph(
                    "3. AI Recommendations",
                    section_style
                ),

                recommendation_items[0]

            ]

        )

    )


    for item in recommendation_items[1:]:

        story.append(item)


    # ======================================================
    # DISCLAIMER
    # ======================================================

    story.append(
        Spacer(1, 10)
    )


    disclaimer_style = ParagraphStyle(

        "Disclaimer",

        parent=body_style,

        fontSize=8.5,

        leading=12,

        textColor=GREY
    )


    disclaimer = Table(

        [

            [

                Paragraph(

                    "<b>Important:</b> This report is AI-generated "
                    "and is intended for informational and contract-review "
                    "assistance only. It should not be considered a "
                    "substitute for professional legal advice.",

                    disclaimer_style

                )

            ]

        ],

        colWidths=[
            160 * mm
        ]
    )


    disclaimer.setStyle(

        TableStyle(

            [

                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    LIGHT_GREY
                ),

                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER
                ),

                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),

                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )

            ]
        )
    )


    story.append(disclaimer)


    # ======================================================
    # FINAL FOOTER TEXT
    # ======================================================

    story.append(
        Spacer(1, 12)
    )


    story.append(

        Paragraph(

            "Generated by ContractLensAI • AI Contract Intelligence",

            footer_style

        )

    )


    # ======================================================
    # PAGE FOOTER
    # ======================================================

    def add_page_number(
        canvas,
        doc
    ):

        canvas.saveState()


        # Footer line

        canvas.setStrokeColor(
            BORDER
        )


        canvas.line(

            18 * mm,
            12 * mm,

            192 * mm,
            12 * mm

        )


        # Company name

        canvas.setFont(
            "Helvetica",
            7
        )


        canvas.setFillColor(
            GREY
        )


        canvas.drawString(

            18 * mm,
            7 * mm,

            "ContractLensAI"

        )


        # Page number

        canvas.drawRightString(

            192 * mm,
            7 * mm,

            f"Page {doc.page}"

        )


        canvas.restoreState()


    # ======================================================
    # BUILD PDF
    # ======================================================

    doc.build(

        story,

        onFirstPage=add_page_number,

        onLaterPages=add_page_number

    )