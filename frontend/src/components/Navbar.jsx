import React from "react";
import {Link} from "react-router-dom";
import logo from "../assets/logo.png"
import "../styles/Navbar.css"

function Navbar() {
    return (
            <nav className="navbar">
                <Link to="/" className="navbar-logo-link">
                    <img src={logo} alt="Logo" className="navbar-logo" />
                </Link>
                <ul className="navbar-menu-right">
                    <li>
                        <Link className="button-link-login">Support ❤️</Link>
                    </li>
                </ul>
            </nav>
        );
}

export default Navbar;