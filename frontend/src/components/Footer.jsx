function Footer(){
    return(
        <footer
        className="bg-white border-top py-4">
            <div className="container">

                <div className="d-flex  flex-column flex-md-row justify-content-between align-items-center gap-3">
                    
                    <div className="text-muted small">

                         © 2026 <strong>ContractLensAI</strong>

                         <span className="mx-2">|</span>
                         All Rights Reserved.

                    </div>
                    <div className="d-flex gap-4">

                         <a href="#"className="text-decoration-none ">
                            Privacy Policy
                        </a>

                        <a href="#"className="text-decoration-none ">
                            Terms & Conditions
                        </a>

                        <a href="#" className="text-decoration-none">
                            Contact Us
                        </a>
                        </div>
                     </div>

                <div>
                   
                </div>
            </div>
        </footer>
    )
}
export default Footer;