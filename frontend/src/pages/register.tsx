import React, { useEffect, useState}  from "react";


const registerPage = () => {
    // TODO: put all these together as in this link: https://github.com/pawelborkar/react-login-form/blob/master/src/App.js 
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // TODO: add repeat password
    const [businessType, setBusinessType] = useState(""); //TODO: make this choice
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();   
        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/register', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({   
                    firstName,
                    lastName,
                    email,
                    password,
                    businessType
                })
            });
            const registerData = await response.json();
            // console.log(response)
            // console.log(response.ok)
            if (!response.ok) {
                setSuccessMessage(''); // Clear any previous error message
                setErrorMessage(registerData.msg); 
                //TODO: Do not redirect
            } else {
                console.log(registerData);
                setRegisterData(registerData);
                setErrorMessage(''); // Clear any previous error message
                
                const primaryRole = registerData.user.roles[0].name //expecting primary role id is alwasys at index 0
                switch (primaryRole) {
                    // TODO: redirect to specific page
                    case "manufacturer":
                        setSuccessMessage('Manufacturer created successfully. Redirecting to manufacturer home...'); //for testing
                        break;
                    case "wholesaler":
                        setSuccessMessage('Wholesaler created successfully. Redirecting to wholesaler home...');
                        break;
                    case "retailer":
                        setSuccessMessage('Retailer created successfully. Redirecting to retailer home...');
                        break;
                    case "customer":
                        setSuccessMessage('Customer created successfully. Redirecting to customer home...');

                        break
                    default:
                        setSuccessMessage('Could not fetch user primary role...');
                }

            }
  
        } catch (error) {
            console.error('Error fetching register data:', error);            
            //add other errors, such as unauthorized, etc
        }
    };

    //initialize registerData as an object
    const [registerData, setRegisterData] = useState<any | null>(null);
    
    return(
        // change this to center the form
        // <div className="w-full px-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="w-full flex items-center justify-center gap-4">
            
            <form className="py-10" onSubmit={handleSubmit}>
                <h2 className="font-bold items-center">Create an account</h2>
                <div className=" flex items-center gap-2">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        className="w-full h-full rounded-md px-2 placeholder:text-sm text-base text-black border-[2px] border-amazon_light outline-none
                focus-visible:border-amazon_yellow"
                        type="text"
                        placeholder="(ex: Adrien)"
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="lastName">Last Name:</label>
                        <input
                            className="w-full h-full rounded-md px-2 placeholder:text-sm text-base text-black border-[2px] border-amazon_light outline-none
                    focus-visible:border-amazon_yellow"
                            type="text"
                            placeholder="(ex: Sibomana)"
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    
                <div className="flex items-center gap-2">
                    <label htmlFor="email">Email:</label>
                    <input
                        className="w-full h-full rounded-md px-2 placeholder:text-sm text-base text-black border-[2px] border-amazon_light outline-none
                focus-visible:border-amazon_yellow"
                        type="email"
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="password">Password:</label>
                    <input
                        className="w-full h-full rounded-md px-2 placeholder:text-sm text-base text-black border-[2px] border-amazon_light outline-none
                focus-visible:border-amazon_yellow"
                        type="text" //TODO: make this password type so it hides
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="businessType">Business Type:</label>
                        
                    <select
                        className="rounded-md border-[2px] border-amazon_light"
                        onChange={(e) => setBusinessType(e.target.value)}
                        required
                    >
                        <option value="">Select type</option>
                        <option value="E-commerce Marketplace">E-commerce Marketplace</option> {/*for admin*/}
                        <option value="manufacturing">Manufacturing</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="retail">Retail</option>
                        <option value="customer">Customer</option>
                    </select>
                    {/* <input
                        className="w-full h-full rounded-md px-2 placeholder:text-sm text-base text-black border-[2px] border-amazon_light outline-none
                focus-visible:border-amazon_yellow"
                        type="text" //TODO: make this password type so it hides
                        placeholder="(ex: manufacturer)"
                        onChange={(e) => setBusinessType(e.target.value)}
                        required
                    /> */}
                </div>
                <button type="submit" className="w-full h-10 rounded-md font-medium bg-amazon_blue text-white hover:bg-amazon_yellow 
                                hover:text-black duration-300 mt-2">Signup</button>
                
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} 
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>} 
            <p>Already have an account? <a className="text-amazon_yellow hover:text-amazon_blue hoverunderline decoration-[1px]
            cursor-pointer duration-250" href="http://localhost:3000/login">
            Signin</a></p>    
            </form>
        </div>
    );

}

export default registerPage;