import React from "react";
import logo from "../images/logo.jpg"
import Image from "next/image";

const Footer = () => {
    return (
        <div className="w-full h-20 bg-amazon_light text-gray-400 flex items-center justify-center gap-4">
        <Image className="w-24" src={logo} alt="Logo"/>
        <p className="text-sm -mt-2">
            All rights reserved {" "}
            <a className="hover:text-white hoverunderline decoration-[1px]
            cursor-pointer duration-250" href="https://www.clasona.com/" target="_blank">
            @Clasona</a></p>
    </div>
    );
}

export default Footer;