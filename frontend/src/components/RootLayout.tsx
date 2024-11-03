// For the page apsects that remain static when you scroll like the header etc

import React, { ReactElement } from "react";
import Header from "@/components/header/Header";
import HeaderBottom from "@/components/header/HeaderBottom";
import Footer from "@/components/Footer";

interface Props{
    children:ReactElement
}
const RootLayout = ({children}:Props) => {
    return (
        <>
        <Header />
        <HeaderBottom />
        {children} {/* For the products, sliders, etc... */}
        <Footer />
        </>
    )
}

export default RootLayout;